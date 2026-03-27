import { readFileSync, writeFileSync } from 'fs';
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

console.log('=== TEST WITH createRecordingDecorator ===\n');

// ============================================================================
// RECORD using createRecordingDecorator
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
carController1 = createRecordingDecorator(carController1);

physicsEngine1.addCar(car1);
const frameListeners1 = [];
physicsEngine1.scheduleUpdates({
  addFrameListener: (listener) => frameListeners1.push(listener),
  addSubFrameListener: () => {}
});

const recordPositions = [];

for (let frame = 0; frame < 200; frame++) {
  // Apply simple input sequence
  if (frame === 0) {
    carController1.pressed(Keys.UP);
  }
  if (frame === 50) {
    carController1.pressed(Keys.RIGHT);
  }
  if (frame === 100) {
    carController1.release(Keys.RIGHT);
  }
  if (frame === 150) {
    carController1.release(Keys.UP);
  }

  carController1.update();
  frameListeners1.forEach(listener => listener());

  if (frame % 20 === 0) {
    recordPositions.push({
      frame,
      x: car1.position.x,
      y: car1.position.y,
      gas: car1.controls.gasPedal,
      steering: car1.controls.steeringWheel
    });
  }

  model.frameNumber++;
}

console.log(`Final position: (${car1.position.x.toFixed(2)}, ${car1.position.y.toFixed(2)})`);

// Recording is captured in console by createRecordingDecorator
// We need to extract it manually - let's look at what the decorator does

console.log('\nNote: createRecordingDecorator logs to console but doesn\'t return recording.');
console.log('Let me check the controller code...');
