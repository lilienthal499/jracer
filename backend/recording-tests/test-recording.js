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

// Load configuration
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== RECORD AND REPLAY TEST ===');
console.log(`Track: ${trackData.name}\n`);

// ============================================================================
// PHASE 1: RECORD A RUN
// ============================================================================

console.log('PHASE 1: Recording a run with manual controls...');

// Reset model state
model.frameNumber = 0;
model.cars = [];

// Initialize physics engine
const physicsEngine1 = createPhysicsEngine(model);

// Create track
const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
model.track = track.getModel();

// Create car for recording
const car1 = createCar();
car1.controls.maxSteeringAngle = 0.2;
car1.position.x = model.track.startingPosition.x;
car1.position.y = model.track.startingPosition.y;
car1.segment = model.track.getSegmentAtPosition(car1.position.x, car1.position.y);
model.cars.push(car1);

// Create controller with recording decorator
let carController1 = createCarController(car1);
let recording = null;
const recordingDecorator = {
  pressed: (keyName) => {
    carController1.pressed(keyName);
    const frame = model.frameNumber;
    if (!recording[frame]) {
      recording[frame] = [];
    }
    recording[frame].push(keyName);
  },
  release: (keyName) => {
    carController1.release(keyName);
    const frame = model.frameNumber;
    if (!recording[frame]) {
      recording[frame] = [];
    }
    recording[frame].push(keyName);
  },
  update: () => carController1.update()
};
recording = {};

// Add car to physics engine
physicsEngine1.addCar(car1);

// Create minimal frame manager
const frameListeners1 = [];
const fakeFrameManager1 = {
  addFrameListener: (listener) => frameListeners1.push(listener),
  addSubFrameListener: () => {}
};
physicsEngine1.scheduleUpdates(fakeFrameManager1);

// Simple input sequence: accelerate, turn right, straighten, brake
const inputSequence = [
  { frame: 0, key: 'UP' },       // Start accelerating
  { frame: 50, key: 'RIGHT' },   // Start turning right
  { frame: 100, key: 'RIGHT' },  // Stop turning right
  { frame: 150, key: 'LEFT' },   // Turn left
  { frame: 200, key: 'LEFT' },   // Stop turning left
  { frame: 250, key: 'DOWN' },   // Start braking
  { frame: 300, key: 'DOWN' },   // Stop braking
  { frame: 350, key: 'UP' }      // Stop accelerating
];

// Run recording simulation
const recordedPositions = [];
for (let frame = 0; frame < 400; frame++) {
  // Apply inputs from sequence
  inputSequence.forEach(input => {
    if (input.frame === frame) {
      recordingDecorator.pressed(input.key);
    }
  });

  // Update controllers
  recordingDecorator.update();

  // Update physics
  frameListeners1.forEach(listener => listener());

  // Record position every 10 frames
  if (frame % 10 === 0) {
    recordedPositions.push({
      frame,
      x: car1.position.x,
      y: car1.position.y,
      direction: car1.direction,
      forwardVel: car1.velocity.forward,
      lateralVel: car1.velocity.lateral
    });
  }

  model.frameNumber++;
}

console.log(`Recorded ${Object.keys(recording).length} frame events`);
console.log(`Final position: (${car1.position.x.toFixed(2)}, ${car1.position.y.toFixed(2)})`);
console.log(`Final velocity: forward=${car1.velocity.forward.toFixed(2)}, lateral=${car1.velocity.lateral.toFixed(2)}`);
console.log('Recording:', JSON.stringify(recording));

// ============================================================================
// PHASE 2: REPLAY THE RECORDING
// ============================================================================

console.log('\n\nPHASE 2: Replaying the recording...');

// Reset model state
model.frameNumber = 0;
model.cars = [];

// Initialize physics engine (fresh instance)
const physicsEngine2 = createPhysicsEngine(model);

// Track is already created, reuse model.track

// Create car for playback
const car2 = createCar();
car2.controls.maxSteeringAngle = 0.2;
car2.position.x = model.track.startingPosition.x;
car2.position.y = model.track.startingPosition.y;
car2.segment = model.track.getSegmentAtPosition(car2.position.x, car2.position.y);
model.cars.push(car2);

// Create controller with playback
const carController2 = createCarController(car2);
const playbackController = createPlaybackController(recording, carController2);

// Add car to physics engine
physicsEngine2.addCar(car2);

// Create minimal frame manager
const frameListeners2 = [];
const fakeFrameManager2 = {
  addFrameListener: (listener) => frameListeners2.push(listener),
  addSubFrameListener: () => {}
};
physicsEngine2.scheduleUpdates(fakeFrameManager2);

// Run playback simulation
const playbackPositions = [];
for (let frame = 0; frame < 400; frame++) {
  // Update controllers
  carController2.update();
  playbackController.update();

  // Update physics
  frameListeners2.forEach(listener => listener());

  // Record position every 10 frames
  if (frame % 10 === 0) {
    playbackPositions.push({
      frame,
      x: car2.position.x,
      y: car2.position.y,
      direction: car2.direction,
      forwardVel: car2.velocity.forward,
      lateralVel: car2.velocity.lateral
    });
  }

  model.frameNumber++;
}

console.log(`Final position: (${car2.position.x.toFixed(2)}, ${car2.position.y.toFixed(2)})`);
console.log(`Final velocity: forward=${car2.velocity.forward.toFixed(2)}, lateral=${car2.velocity.lateral.toFixed(2)}`);

// ============================================================================
// PHASE 3: COMPARE RESULTS
// ============================================================================

console.log('\n\n=== COMPARISON ===');
console.log('Frame | Recorded Position | Playback Position | Diff (distance)');
console.log('------|-------------------|-------------------|----------------');

let maxDiff = 0;
let totalDiff = 0;
for (let i = 0; i < recordedPositions.length; i++) {
  const rec = recordedPositions[i];
  const play = playbackPositions[i];

  const diffX = rec.x - play.x;
  const diffY = rec.y - play.y;
  const distance = Math.sqrt(diffX * diffX + diffY * diffY);

  maxDiff = Math.max(maxDiff, distance);
  totalDiff += distance;

  const recPos = `(${rec.x.toFixed(1)}, ${rec.y.toFixed(1)})`;
  const playPos = `(${play.x.toFixed(1)}, ${play.y.toFixed(1)})`;

  console.log(`${rec.frame.toString().padStart(5)} | ${recPos.padEnd(17)} | ${playPos.padEnd(17)} | ${distance.toFixed(4)}`);
}

const avgDiff = totalDiff / recordedPositions.length;

console.log('\n=== SUMMARY ===');
console.log(`Maximum difference: ${maxDiff.toFixed(4)} units`);
console.log(`Average difference: ${avgDiff.toFixed(4)} units`);
console.log(`Total samples: ${recordedPositions.length}`);

if (maxDiff < 0.001) {
  console.log('\n✓ SUCCESS: Recording and playback match perfectly!');
} else if (maxDiff < 1.0) {
  console.log('\n⚠ WARNING: Small differences detected (< 1 unit)');
} else {
  console.log('\n✗ FAILURE: Significant differences detected!');
}
