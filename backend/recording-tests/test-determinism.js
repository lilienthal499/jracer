import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import physics modules
import { model, createCar } from '../js/model.js';
import { createPhysicsEngine } from '../js/physicsengine.js';
import { createTrack } from '../js/track.js';
import { createCarController, createRecordingDecorator, createPlaybackController } from '../js/controller.js';
import { Keys } from '../shared/keys.js';

// Load configuration
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== RECORD/REPLAY DETERMINISM TEST ===\n');

// ============================================================================
// PHASE 1: RECORD
// ============================================================================

console.log('PHASE 1: Recording with createRecordingDecorator...');

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

const recordedStates = [];

for (let frame = 0; frame < 200; frame++) {
  // Apply input sequence
  if (frame === 0) {
    recordingDecorator.pressed(Keys.UP);
  }
  if (frame === 50) {
    recordingDecorator.pressed(Keys.RIGHT);
  }
  if (frame === 100) {
    recordingDecorator.release(Keys.RIGHT);
  }
  if (frame === 150) {
    recordingDecorator.release(Keys.UP);
  }

  recordingDecorator.update();
  frameListeners1.forEach(listener => listener());

  // Record state every 10 frames
  if (frame % 10 === 0) {
    recordedStates.push({
      frame,
      x: car1.position.x,
      y: car1.position.y,
      direction: car1.direction,
      forwardVel: car1.velocity.forward,
      gas: car1.controls.gasPedal,
      steering: car1.controls.steeringWheel
    });
  }

  model.frameNumber++;
}

const recording = recordingDecorator.getRecording();
console.log(`Recorded ${Object.keys(recording).length} frame events`);
console.log(`Recording: ${JSON.stringify(recording)}`);
console.log(`Final position: (${car1.position.x.toFixed(2)}, ${car1.position.y.toFixed(2)})`);

// ============================================================================
// PHASE 2: PLAYBACK
// ============================================================================

console.log('\n\nPHASE 2: Playing back recording...');

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

for (let frame = 0; frame < 200; frame++) {
  carController2.update();
  playbackController.update();
  frameListeners2.forEach(listener => listener());

  // Record state every 10 frames
  if (frame % 10 === 0) {
    playbackStates.push({
      frame,
      x: car2.position.x,
      y: car2.position.y,
      direction: car2.direction,
      forwardVel: car2.velocity.forward,
      gas: car2.controls.gasPedal,
      steering: car2.controls.steeringWheel
    });
  }

  model.frameNumber++;
}

console.log(`Final position: (${car2.position.x.toFixed(2)}, ${car2.position.y.toFixed(2)})`);

// ============================================================================
// PHASE 3: COMPARE
// ============================================================================

console.log('\n\n=== COMPARISON ===');
console.log('Frame | Recorded Pos      | Playback Pos      | Diff    | Gas R/P | Steer R/P');
console.log('------|-------------------|-------------------|---------|---------|----------');

let maxDiff = 0;
for (let i = 0; i < recordedStates.length; i++) {
  const rec = recordedStates[i];
  const play = playbackStates[i];

  const diffX = rec.x - play.x;
  const diffY = rec.y - play.y;
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);
  maxDiff = Math.max(maxDiff, distance);

  const recPos = `(${rec.x.toFixed(1)}, ${rec.y.toFixed(1)})`;
  const playPos = `(${play.x.toFixed(1)}, ${play.y.toFixed(1)})`;
  const gasMatch = rec.gas === play.gas ? '✓' : '✗';
  const steerMatch = rec.steering === play.steering ? '✓' : '✗';

  console.log(`${rec.frame.toString().padStart(5)} | ${recPos.padEnd(17)} | ${playPos.padEnd(17)} | ${distance.toFixed(4)} | ${rec.gas.toFixed(2)}/${play.gas.toFixed(2)} ${gasMatch} | ${rec.steering.toFixed(2)}/${play.steering.toFixed(2)} ${steerMatch}`);
}

console.log(`\nMaximum position difference: ${maxDiff.toFixed(6)} units`);

if (maxDiff < 0.0001) {
  console.log('✓ SUCCESS: Perfect match!');
} else {
  console.log('✗ FAILURE: Positions diverged!');
}
