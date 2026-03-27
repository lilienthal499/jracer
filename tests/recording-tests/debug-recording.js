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
import { createCarController, createPlaybackController } from '../js/controller.js';

// Load configuration
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== DETAILED RECORDING DEBUG ===\n');

// ============================================================================
// RECORD
// ============================================================================

model.frameNumber = 0;
model.cars = [];

const physicsEngine1 = createPhysicsEngine(model);
const track = createTrack(trackData.sections, trackData.gridSize, trackData.gridSize);
model.track = track.getModel();

const car1 = createCar();
car1.controls.maxSteeringAngle = 0.2;
car1.position.x = model.track.startingPosition.x;
car1.position.y = model.track.startingPosition.y;
car1.segment = model.track.getSegmentAtPosition(car1.position.x, car1.position.y);
model.cars.push(car1);

const carController1 = createCarController(car1);
const recording = {};

// Manual recording
function recordInput(frame, keyName) {
  if (!recording[frame]) {
    recording[frame] = [];
  }
  recording[frame].push(keyName);
}

physicsEngine1.addCar(car1);
const frameListeners1 = [];
physicsEngine1.scheduleUpdates({
  addFrameListener: (listener) => frameListeners1.push(listener),
  addSubFrameListener: () => {}
});

// Simple sequence
console.log('RECORDING:');
console.log('Frame | Action | Gas | Steering | Position');

for (let frame = 0; frame < 150; frame++) {
  // Apply inputs
  if (frame === 0) {
    carController1.pressed('UP');
    recordInput(frame, 'UP');
  }
  if (frame === 50) {
    carController1.pressed('RIGHT');
    recordInput(frame, 'RIGHT');
  }
  if (frame === 100) {
    carController1.release('RIGHT');
    recordInput(frame, 'RIGHT');
  }

  carController1.update();
  frameListeners1.forEach(listener => listener());

  if (frame % 10 === 0 || frame === 49 || frame === 50 || frame === 99 || frame === 100) {
    console.log(`${frame.toString().padStart(5)} | ${recording[frame] ? recording[frame].join(',').padEnd(6) : '      '} | ${car1.controls.gasPedal.toFixed(2)} | ${car1.controls.steeringWheel.toFixed(2).padStart(5)} | (${car1.position.x.toFixed(1)}, ${car1.position.y.toFixed(1)})`);
  }

  model.frameNumber++;
}

console.log('\nRecording:', JSON.stringify(recording));

// ============================================================================
// PLAYBACK
// ============================================================================

console.log('\n\nPLAYBACK:');
console.log('Frame | Action | Gas | Steering | Position');

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

for (let frame = 0; frame < 150; frame++) {
  carController2.update();
  playbackController.update();
  frameListeners2.forEach(listener => listener());

  if (frame % 10 === 0 || frame === 49 || frame === 50 || frame === 99 || frame === 100) {
    const action = recording[frame] ? recording[frame].join(',') : '';
    console.log(`${frame.toString().padStart(5)} | ${action.padEnd(6)} | ${car2.controls.gasPedal.toFixed(2)} | ${car2.controls.steeringWheel.toFixed(2).padStart(5)} | (${car2.position.x.toFixed(1)}, ${car2.position.y.toFixed(1)})`);
  }

  model.frameNumber++;
}

console.log('\n=== CONTROL VALUE COMPARISON ===');
console.log('At frame 100:');
console.log(`Recording - steering should be 0 (RIGHT key released)`);
console.log(`Playback - steering is ${car2.controls.steeringWheel.toFixed(2)}`);
