// Realistic browser keyboard simulation test

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { model, createCar } from '../js/model.js';
import { createPhysicsEngine } from '../js/physicsengine.js';
import { createTrack } from '../js/track.js';
import { createCarController, createRecordingDecorator, createPlaybackController, createKeyboardController } from '../js/controller.js';
import { Keys } from '../shared/keys.js';

const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== REALISTIC KEYBOARD SIMULATION TEST ===\n');

// ============================================================================
// PHASE 1: RECORD with realistic keyboard timing
// ============================================================================

console.log('PHASE 1: Recording with realistic keyboard events...');

model.frameNumber = 0;
model.cars = [];

const physicsEngine1 = createPhysicsEngine(model);
const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
model.track = track.getModel();

const car1 = createCar();
car1.controls.maxSteeringAngle = 0.2;
car1.position.x = model.track.startingPosition.x;
car1.position.y = model.track.startingPosition.y;
car1.segment = model.track.getSegmentAtPosition(car1.position.x, car1.position.y);
model.cars.push(car1);

let carController1 = createCarController(car1);
const recordingDecorator = createRecordingDecorator(carController1, car1);

physicsEngine1.addCar(car1);
const frameListeners1 = [];
physicsEngine1.scheduleUpdates({
  addFrameListener: (listener) => frameListeners1.push(listener),
  addSubFrameListener: () => {}
});

// Keyboard controller simulates browser keyboard events
const player1Config = config.players.find(p => p.record === true);
const keyboardController1 = createKeyboardController(player1Config.controls, recordingDecorator);

// Simulate DOM keyboard events
function simulateKeyEvent(type, code) {
  const event = {
    type: type, // 'keydown' or 'keyup'
    code: code  // 'KeyW', 'KeyD', etc.
  };
  keyboardController1.getKeyHandler()(event);
}

// Input sequence - simulating realistic keypresses
const keySequence = [
  { frame: 0, type: 'keydown', code: 'KeyW' },      // Press UP
  { frame: 50, type: 'keydown', code: 'KeyD' },     // Press RIGHT
  { frame: 100, type: 'keyup', code: 'KeyD' },      // Release RIGHT
  { frame: 150, type: 'keyup', code: 'KeyW' }       // Release UP
];

const recordedStates = [];

// Simulate frame loop like browser
frameListeners1.push(keyboardController1.update); // Apply buffered keyboard inputs
frameListeners1.push(recordingDecorator.update);  // Then update carController

for (let frame = 0; frame < 200; frame++) {
  // Keyboard events can fire at ANY point during frame
  // In browser they're async, here we simulate them firing BEFORE frame update
  keySequence.forEach(input => {
    if (input.frame === frame) {
      simulateKeyEvent(input.type, input.code);
    }
  });

  // Frame update - all registered listeners run
  frameListeners1.forEach(listener => listener());

  if (frame % 20 === 0) {
    recordedStates.push({
      frame,
      x: car1.position.x,
      y: car1.position.y,
      gas: car1.controls.gasPedal,
      steering: car1.controls.steeringWheel
    });
  }

  model.frameNumber++;
}

const recording = recordingDecorator.getRecording();
console.log(`Recording: ${JSON.stringify(recording)}`);
console.log(`Recorded ${Object.keys(recording).length} events`);
console.log(`Final: (${car1.position.x.toFixed(2)}, ${car1.position.y.toFixed(2)})\n`);

// ============================================================================
// PHASE 2: PLAYBACK
// ============================================================================

console.log('PHASE 2: Playing back recording...');

model.frameNumber = 0;
model.cars = [];

const physicsEngine2 = createPhysicsEngine(model);

const car2 = createCar();
car2.controls.maxSteeringAngle = 0.2;
car2.position.x = model.track.startingPosition.x;
car2.position.y = model.track.startingPosition.y;
car2.segment = model.track.getSegmentAtPosition(car2.position.x, car2.position.y);
model.cars.push(car2);

const carController2 = createCarController(car2);
const playbackController = createPlaybackController(recording, carController2);

physicsEngine2.addCar(car2);
const frameListeners2 = [];
physicsEngine2.scheduleUpdates({
  addFrameListener: (listener) => frameListeners2.push(listener),
  addSubFrameListener: () => {}
});

const playbackStates = [];

// Register listeners once before loop
frameListeners2.push(playbackController.update);
frameListeners2.push(carController2.update);

for (let frame = 0; frame < 200; frame++) {
  // Playback: inputs applied during update cycle
  frameListeners2.forEach(listener => listener());

  if (frame % 20 === 0) {
    playbackStates.push({
      frame,
      x: car2.position.x,
      y: car2.position.y,
      gas: car2.controls.gasPedal,
      steering: car2.controls.steeringWheel
    });
  }

  model.frameNumber++;
}

console.log(`Final: (${car2.position.x.toFixed(2)}, ${car2.position.y.toFixed(2)})\n`);

// ============================================================================
// COMPARISON
// ============================================================================

console.log('=== COMPARISON ===');
console.log('Frame | Recorded Pos      | Playback Pos      | Diff     | Gas Match | Steer Match');
console.log('------|-------------------|-------------------|----------|-----------|------------');

let maxDiff = 0;
let firstDivergence = -1;

for (let i = 0; i < recordedStates.length; i++) {
  const rec = recordedStates[i];
  const play = playbackStates[i];

  const diffX = rec.x - play.x;
  const diffY = rec.y - play.y;
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);

  if (distance > 0.001 && firstDivergence === -1) {
    firstDivergence = rec.frame;
  }

  maxDiff = Math.max(maxDiff, distance);

  const recPos = `(${rec.x.toFixed(1)}, ${rec.y.toFixed(1)})`;
  const playPos = `(${play.x.toFixed(1)}, ${play.y.toFixed(1)})`;
  const gasMatch = Math.abs(rec.gas - play.gas) < 0.001 ? '✓' : `✗ ${rec.gas.toFixed(2)}/${play.gas.toFixed(2)}`;
  const steerMatch = Math.abs(rec.steering - play.steering) < 0.001 ? '✓' : `✗ ${rec.steering.toFixed(2)}/${play.steering.toFixed(2)}`;

  console.log(`${rec.frame.toString().padStart(5)} | ${recPos.padEnd(17)} | ${playPos.padEnd(17)} | ${distance.toFixed(6)} | ${gasMatch.padEnd(9)} | ${steerMatch}`);
}

console.log(`\n=== RESULTS ===`);
console.log(`Maximum difference: ${maxDiff.toFixed(6)} units`);
if (firstDivergence >= 0) {
  console.log(`First divergence at frame: ${firstDivergence}`);
}

if (maxDiff < 0.001) {
  console.log('✓ SUCCESS: Recording matches playback!');
} else {
  console.log('✗ FAILURE: Recording diverges from playback');
  console.log('\nThis confirms the bug exists. The issue is likely:');
  console.log('- Keyboard events fire OUTSIDE frame loop (async)');
  console.log('- Recording captures frame number at time of key event');
  console.log('- But playback applies inputs during frame update');
  console.log('- This timing difference causes divergence');
}
