// Test browser recordings by comparing two runs of the SAME recording

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { model, createCar } from '../js/model.js';
import { createPhysicsEngine } from '../js/physicsengine.js';
import { createTrack } from '../js/track.js';
import { createCarController, createPlaybackController } from '../js/controller.js';

const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== DETERMINISM TEST: Same Recording, Two Runs ===\n');

// Get first recorded player
const recordedPlayer = config.players.find(p => p.recording !== undefined);
if (!recordedPlayer) {
  console.error('No recorded player found!');
  process.exit(1);
}

console.log(`Testing recording from: ${recordedPlayer.name}`);
console.log(`Recording has ${Object.keys(recordedPlayer.recording).length} events\n`);

function runSimulation(runNumber) {
  model.frameNumber = 0;
  model.cars = [];

  const physicsEngine = createPhysicsEngine(model);
  const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
  model.track = track.getModel();

  const car = createCar();
  car.controls.maxSteeringAngle = recordedPlayer.maxSteeringAngle;
  car.position.x = model.track.startingPosition.x;
  car.position.y = model.track.startingPosition.y;
  car.segment = model.track.getSegmentAtPosition(car.position.x, car.position.y);
  model.cars.push(car);

  const carController = createCarController(car);
  const playbackController = createPlaybackController(recordedPlayer.recording, carController);

  physicsEngine.addCar(car);
  const frameListeners = [];
  physicsEngine.scheduleUpdates({
    addFrameListener: (listener) => frameListeners.push(listener),
    addSubFrameListener: () => {}
  });

  // Register in correct order: playback first, then carController
  frameListeners.push(playbackController.update);
  frameListeners.push(carController.update);

  const states = [];
  const maxFrames = Math.max(...Object.keys(recordedPlayer.recording).map(Number)) + 100;

  for (let frame = 0; frame < maxFrames; frame++) {
    frameListeners.forEach(fn => fn());

    if (frame % 50 === 0) {
      states.push({
        frame,
        x: car.position.x,
        y: car.position.y,
        forward: car.velocity.forward,
        lateral: car.velocity.lateral,
        direction: car.direction
      });
    }

    model.frameNumber++;
  }

  return states;
}

console.log('Run 1...');
const run1 = runSimulation(1);

console.log('Run 2...');
const run2 = runSimulation(2);

console.log('\n=== COMPARISON ===');
console.log('Frame | Run 1 Position    | Run 2 Position    | Difference');
console.log('------|-------------------|-------------------|------------');

let maxDiff = 0;
for (let i = 0; i < run1.length; i++) {
  const s1 = run1[i];
  const s2 = run2[i];

  const diff = Math.sqrt(Math.pow(s1.x - s2.x, 2) + Math.pow(s1.y - s2.y, 2));
  maxDiff = Math.max(maxDiff, diff);

  const pos1 = `(${s1.x.toFixed(1)}, ${s1.y.toFixed(1)})`;
  const pos2 = `(${s2.x.toFixed(1)}, ${s2.y.toFixed(1)})`;

  console.log(`${s1.frame.toString().padStart(5)} | ${pos1.padEnd(17)} | ${pos2.padEnd(17)} | ${diff.toFixed(6)}`);
}

console.log(`\n=== RESULT ===`);
console.log(`Maximum difference: ${maxDiff.toFixed(10)} units`);

if (maxDiff === 0) {
  console.log('✓ PERFECT: Playback is 100% deterministic');
} else {
  console.log('✗ FAILURE: Playback is non-deterministic!');
  console.log('This means there is a source of randomness or timing dependency in the code.');
}
