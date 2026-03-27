// Test if execution order actually matters

import { model, createCar } from '../js/model.js';
import { createCarController, createPlaybackController } from '../js/controller.js';
import { createPhysicsEngine } from '../js/physicsengine.js';
import { createTrack } from '../js/track.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== TEST: Does Update Order Matter? ===\n');

const recording = {
  "0": ["UP"],
  "50": ["RIGHT"],
  "100": ["RIGHT"],
  "150": ["UP"]
};

function runWithOrder(label, playbackFirst) {
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

  const carController = createCarController(car);
  const playbackController = createPlaybackController(recording, carController);

  physicsEngine.addCar(car);
  const frameListeners = [];
  physicsEngine.scheduleUpdates({
    addFrameListener: (listener) => frameListeners.push(listener),
    addSubFrameListener: () => {}
  });

  // Register in specified order
  if (playbackFirst) {
    console.log(`${label}: playbackController.update → carController.update`);
    frameListeners.push(playbackController.update);
    frameListeners.push(carController.update);
  } else {
    console.log(`${label}: carController.update → playbackController.update`);
    frameListeners.push(carController.update);
    frameListeners.push(playbackController.update);
  }

  const positions = [];

  for (let frame = 0; frame < 200; frame++) {
    frameListeners.forEach(listener => listener());

    if (frame % 50 === 0) {
      positions.push({
        frame,
        x: car.position.x,
        y: car.position.y,
        gas: car.controls.gasPedal,
        steering: car.controls.steeringWheel
      });
    }

    model.frameNumber++;
  }

  return positions;
}

const test1 = runWithOrder('Test 1', true);  // playback first
console.log('');
const test2 = runWithOrder('Test 2', false); // carController first

console.log('\n=== COMPARISON ===');
console.log('Frame | Test 1 Position   | Test 2 Position   | Difference');
console.log('------|-------------------|-------------------|------------');

let maxDiff = 0;
for (let i = 0; i < test1.length; i++) {
  const t1 = test1[i];
  const t2 = test2[i];

  const diff = Math.sqrt(Math.pow(t1.x - t2.x, 2) + Math.pow(t1.y - t2.y, 2));
  maxDiff = Math.max(maxDiff, diff);

  const pos1 = `(${t1.x.toFixed(1)}, ${t1.y.toFixed(1)})`;
  const pos2 = `(${t2.x.toFixed(1)}, ${t2.y.toFixed(1)})`;

  console.log(`${t1.frame.toString().padStart(5)} | ${pos1.padEnd(17)} | ${pos2.padEnd(17)} | ${diff.toFixed(6)}`);
}

console.log(`\n=== RESULT ===`);
console.log(`Maximum difference: ${maxDiff.toFixed(10)}`);

if (maxDiff === 0) {
  console.log('✓ Order does NOT matter - both produce identical results');
  console.log('Comment is MISLEADING and should be updated');
} else {
  console.log('✓ Order DOES matter - different results');
  console.log('Comment is CORRECT');
}
