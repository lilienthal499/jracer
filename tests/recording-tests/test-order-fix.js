import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import physics modules - using the FIXED application.js logic
import { model, createCar } from '../js/model.js';
import { createPhysicsEngine } from '../js/physicsengine.js';
import { createTrack } from '../js/track.js';
import { createCarController, createRecordingDecorator, createPlaybackController } from '../js/controller.js';
import { Keys } from '../shared/keys.js';

// Load configuration
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== TEST EXECUTION ORDER FIX ===\n');

// Helper to create a fake frame manager that respects registration order
function createTestFrameManager() {
  const listeners = [];
  return {
    addFrameListener: (fn) => listeners.push(fn),
    addSubFrameListener: () => {}, // Not needed for backend
    runFrame: () => listeners.forEach(fn => fn())
  };
}

// ============================================================================
// PHASE 1: RECORD with keyboard-style inputs
// ============================================================================

console.log('PHASE 1: Recording...');

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
const recordingDecorator = createRecordingDecorator(carController1);

physicsEngine1.addCar(car1);

const frameManager1 = createTestFrameManager();
physicsEngine1.scheduleUpdates(frameManager1);
// Keyboard player: only carController update is registered (inputs come from keyboard events)
frameManager1.addFrameListener(recordingDecorator.update);

const recordedStates = [];

for (let frame = 0; frame < 200; frame++) {
  // Simulate keyboard events (these happen OUTSIDE the frame loop in real browser)
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

  // Run frame
  frameManager1.runFrame();

  // Record state
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
console.log(`Final: (${car1.position.x.toFixed(2)}, ${car1.position.y.toFixed(2)})\n`);

// ============================================================================
// PHASE 2: PLAYBACK with CORRECT order (playback before carController)
// ============================================================================

console.log('PHASE 2: Playback with FIXED order (playback → carController)...');

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
const playbackController2 = createPlaybackController(recording, carController2);

physicsEngine2.addCar(car2);

const frameManager2 = createTestFrameManager();
physicsEngine2.scheduleUpdates(frameManager2);
// CORRECT ORDER: playback first, then carController
frameManager2.addFrameListener(playbackController2.update);
frameManager2.addFrameListener(carController2.update);

const playbackStates = [];

for (let frame = 0; frame < 200; frame++) {
  frameManager2.runFrame();

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
// PHASE 3: PLAYBACK with WRONG order (carController before playback)
// ============================================================================

console.log('PHASE 3: Playback with OLD BUGGY order (carController → playback)...');

model.frameNumber = 0;
model.cars = [];

const physicsEngine3 = createPhysicsEngine(model);

const car3 = createCar();
car3.controls.maxSteeringAngle = 0.2;
car3.position.x = model.track.startingPosition.x;
car3.position.y = model.track.startingPosition.y;
car3.segment = model.track.getSegmentAtPosition(car3.position.x, car3.position.y);
model.cars.push(car3);

const carController3 = createCarController(car3);
const playbackController3 = createPlaybackController(recording, carController3);

physicsEngine3.addCar(car3);

const frameManager3 = createTestFrameManager();
physicsEngine3.scheduleUpdates(frameManager3);
// WRONG ORDER: carController first, then playback (old buggy code)
frameManager3.addFrameListener(carController3.update);
frameManager3.addFrameListener(playbackController3.update);

const buggyStates = [];

for (let frame = 0; frame < 200; frame++) {
  frameManager3.runFrame();

  if (frame % 20 === 0) {
    buggyStates.push({
      frame,
      x: car3.position.x,
      y: car3.position.y,
      gas: car3.controls.gasPedal,
      steering: car3.controls.steeringWheel
    });
  }

  model.frameNumber++;
}

console.log(`Final: (${car3.position.x.toFixed(2)}, ${car3.position.y.toFixed(2)})\n`);

// ============================================================================
// COMPARISON
// ============================================================================

console.log('=== COMPARISON ===');
console.log('Frame | Recording      | Fixed Playback | Buggy Playback | Fixed Diff | Buggy Diff');
console.log('------|----------------|----------------|----------------|------------|------------');

let maxFixedDiff = 0;
let maxBuggyDiff = 0;

for (let i = 0; i < recordedStates.length; i++) {
  const rec = recordedStates[i];
  const fixed = playbackStates[i];
  const buggy = buggyStates[i];

  const fixedDiff = Math.sqrt(Math.pow(rec.x - fixed.x, 2) + Math.pow(rec.y - fixed.y, 2));
  const buggyDiff = Math.sqrt(Math.pow(rec.x - buggy.x, 2) + Math.pow(rec.y - buggy.y, 2));

  maxFixedDiff = Math.max(maxFixedDiff, fixedDiff);
  maxBuggyDiff = Math.max(maxBuggyDiff, buggyDiff);

  const recPos = `(${rec.x.toFixed(1)}, ${rec.y.toFixed(1)})`;
  const fixedPos = `(${fixed.x.toFixed(1)}, ${fixed.y.toFixed(1)})`;
  const buggyPos = `(${buggy.x.toFixed(1)}, ${buggy.y.toFixed(1)})`;

  console.log(`${rec.frame.toString().padStart(5)} | ${recPos.padEnd(14)} | ${fixedPos.padEnd(14)} | ${buggyPos.padEnd(14)} | ${fixedDiff.toFixed(4).padStart(10)} | ${buggyDiff.toFixed(4).padStart(10)}`);
}

console.log('\n=== RESULTS ===');
console.log(`Fixed order max difference: ${maxFixedDiff.toFixed(6)} units`);
console.log(`Buggy order max difference: ${maxBuggyDiff.toFixed(6)} units`);

if (maxFixedDiff < 0.0001) {
  console.log('✓ FIXED: Perfect match with correct execution order!');
} else {
  console.log('✗ FIXED: Still has differences');
}

if (maxBuggyDiff > 1.0) {
  console.log('✓ CONFIRMED: Buggy order causes significant divergence');
} else {
  console.log('? UNEXPECTED: Buggy order didn\'t cause expected divergence');
}
