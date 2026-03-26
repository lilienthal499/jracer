// Find the exact moment and cause of divergence

import { model, createCar } from '../js/model.js';
import { createPhysicsEngine } from '../js/physicsengine.js';
import { createTrack } from '../js/track.js';
import { createCarController, createRecordingDecorator, createPlaybackController, createKeyboardController } from '../js/controller.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== FIND EXACT DIVERGENCE POINT ===\n');

function runWithLogging(label, useRecording, recording) {
  model.frameNumber = 0;
  model.cars = [];

  const physicsEngine = createPhysicsEngine(model);
  const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
  model.track = track.getModel();

  const car = createCar();
  car.controls.maxSteeringAngle = 0.2;
  car.position.x = model.track.startingPosition.x;
  car.position.y = model.track.startingPosition.y;
  car.segment = model.track.getSegmentAtPosition(car.position.x, car.position.y);
  model.cars.push(car);

  let carController = createCarController(car);
  let recordingDecorator;
  let playbackController;
  let keyboardController;

  if (useRecording) {
    // Playback mode
    playbackController = createPlaybackController(recording, carController);
  } else {
    // Recording mode
    recordingDecorator = createRecordingDecorator(carController, car);
    const player1Config = config.players.find(p => p.record === true);
    keyboardController = createKeyboardController(player1Config.controls, recordingDecorator);
  }

  physicsEngine.addCar(car);
  const frameListeners = [];
  physicsEngine.scheduleUpdates({
    addFrameListener: (listener) => frameListeners.push(listener),
    addSubFrameListener: () => {}
  });

  if (useRecording) {
    frameListeners.push(playbackController.update);
    frameListeners.push(carController.update);
  } else {
    frameListeners.push(recordingDecorator.update);
  }

  const keySequence = [
    { frame: 0, type: 'keydown', code: 'KeyW' },
    { frame: 50, type: 'keydown', code: 'KeyD' },
    { frame: 100, type: 'keyup', code: 'KeyD' },
    { frame: 150, type: 'keyup', code: 'KeyW' }
  ];

  console.log(`\n${label}:`);
  console.log('Frame | Gas   | Steer  | Pos X     | Pos Y     | Vel Forward | Vel Lateral | Direction');
  console.log('------|-------|--------|-----------|-----------|-------------|-------------|----------');

  const states = [];

  for (let frame = 0; frame < 110; frame++) {
    if (!useRecording) {
      // Keyboard events
      keySequence.forEach(input => {
        if (input.frame === frame) {
          const event = { type: input.type, code: input.code };
          keyboardController.getKeyHandler()(event);
        }
      });
    }

    frameListeners.forEach(listener => listener());

    if (frame >= 98 && frame <= 102) {
      states.push({
        frame,
        gas: car.controls.gasPedal,
        steering: car.controls.steeringWheel,
        x: car.position.x,
        y: car.position.y,
        velF: car.velocity.forward,
        velL: car.velocity.lateral,
        dir: car.direction
      });

      console.log(
        `${frame.toString().padStart(5)} | ` +
        `${car.controls.gasPedal.toFixed(3)} | ` +
        `${car.controls.steeringWheel.toFixed(4)} | ` +
        `${car.position.x.toFixed(5)} | ` +
        `${car.position.y.toFixed(5)} | ` +
        `${car.velocity.forward.toFixed(5)} | ` +
        `${car.velocity.lateral.toFixed(5)} | ` +
        `${car.direction.toFixed(7)}`
      );
    }

    model.frameNumber++;
  }

  return { states, recording: useRecording ? null : recordingDecorator.getRecording() };
}

const { states: recStates, recording } = runWithLogging('RECORDING', false, null);
const { states: playStates } = runWithLogging('PLAYBACK', true, recording);

console.log('\n\n=== DIFFERENCE ANALYSIS ===');
console.log('Frame | ΔX         | ΔY         | ΔVelF      | ΔVelL      | ΔDir');
console.log('------|------------|------------|------------|------------|------------');

for (let i = 0; i < recStates.length; i++) {
  const rec = recStates[i];
  const play = playStates[i];

  console.log(
    `${rec.frame.toString().padStart(5)} | ` +
    `${(rec.x - play.x).toFixed(8)} | ` +
    `${(rec.y - play.y).toFixed(8)} | ` +
    `${(rec.velF - play.velF).toFixed(8)} | ` +
    `${(rec.velL - play.velL).toFixed(8)} | ` +
    `${(rec.dir - play.dir).toFixed(10)}`
  );
}
