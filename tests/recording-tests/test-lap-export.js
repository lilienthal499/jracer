// Test lap completion recording export

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { model, createCar } from '../js/model.js';
import { createPhysicsEngine } from '../js/physicsengine.js';
import { createTrack } from '../js/track.js';
import { createCarController, createRecordingDecorator, createKeyboardController } from '../js/controller.js';

const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log('=== TEST LAP COMPLETION EXPORT ===\n');

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
const recordingDecorator = createRecordingDecorator(carController);

physicsEngine.addCar(car);
const frameListeners = [];
physicsEngine.scheduleUpdates({
  addFrameListener: (listener) => frameListeners.push(listener),
  addSubFrameListener: () => {}
});

const player1Config = config.players.find(p => p.record === true);
const keyboardController = createKeyboardController(player1Config.controls, recordingDecorator);

frameListeners.push(keyboardController.update);
frameListeners.push(recordingDecorator.update);

// Simple input: just hold UP to drive around the track
function simulateKeyEvent(type, code) {
  const event = { type, code };
  keyboardController.getKeyHandler()(event);
}

console.log('Simulating: Press UP and drive around track...');
console.log(`Track: ${trackData.name} (${trackData.sections.length} sections)\n`);

// Press UP at start
simulateKeyEvent('keydown', 'KeyW');

let lapCompleted = false;
let frameCount = 0;
const maxFrames = 10000; // Safety limit

while (!lapCompleted && frameCount < maxFrames) {
  frameListeners.forEach(listener => listener());

  // Check if lap was completed (round incremented)
  if (car.round > 1) {
    lapCompleted = true;
    console.log(`\nLap completed at frame ${frameCount}!`);
    console.log(`Final position: (${car.position.x.toFixed(2)}, ${car.position.y.toFixed(2)})`);
    console.log(`Track sequence: ${car.trackSequence}/${model.track.sequenceOfSegments.length}`);
  }

  // Progress indicator every 500 frames
  if (frameCount % 500 === 0) {
    console.log(`Frame ${frameCount}: Lap ${car.round}, Sequence ${car.trackSequence}/${model.track.sequenceOfSegments.length}, Pos (${car.position.x.toFixed(0)}, ${car.position.y.toFixed(0)})`);
  }

  model.frameNumber++;
  frameCount++;
}

if (!lapCompleted) {
  console.log('\n⚠ Did not complete lap within frame limit');
  console.log('Recording export requires lap completion');
} else {
  console.log('\n✓ Recording should have been exported above when lap completed');
}
