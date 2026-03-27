import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import physics modules
import { model } from '../js/model.js';
import { createPhysicsEngine } from '../js/physicsengine.js';
import { createTrack } from '../js/track.js';
import { createCarController, createPlaybackController } from '../js/controller.js';
import { createFrameManager } from '../js/framemanager.js';

// Load configuration
const config = JSON.parse(readFileSync(join(__dirname, 'config.json'), 'utf8'));
const trackData = JSON.parse(readFileSync(join(__dirname, 'tracks', `${config.track.number}.json`), 'utf8'));

console.log(`Loading track: ${trackData.name}`);
console.log(`Track sections: ${trackData.sections.length}`);

// Initialize physics engine
const physicsEngine = createPhysicsEngine(model);

// Create track
const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
model.track = track.getModel();

console.log(`Track dimensions: ${model.track.dimensions.width} x ${model.track.dimensions.height}`);
console.log(`Starting position: (${model.track.startingPosition.x}, ${model.track.startingPosition.y})`);

// Find player with recording (for playback)
const recordedPlayer = config.players.find(p => p.recording !== undefined);
console.log(`Using recording from player: ${recordedPlayer.name}`);

// Create car
const car = model.createCar();
car.controls.maxSteeringAngle = recordedPlayer.maxSteeringAngle;
car.position.x = model.track.startingPosition.x;
car.position.y = model.track.startingPosition.y;
car.segment = model.track.getSegmentAtPosition(car.position.x, car.position.y);
model.cars.push(car);

// Create controllers
const carController = createCarController(car);
const playbackController = createPlaybackController(recordedPlayer.recording, carController);

// Add car to physics engine
physicsEngine.addCar(car);

// Create frame manager with synchronous "animation frame" mocks
let frameCallbacks = [];
let nextFrameId = 1;

const mockRequestAnimationFrame = (callback) => {
  const id = nextFrameId++;
  frameCallbacks.push({ id, callback });
  return id;
};

const mockCancelAnimationFrame = (id) => {
  frameCallbacks = frameCallbacks.filter(fc => fc.id !== id);
};

const frameManager = createFrameManager(model, mockRequestAnimationFrame, mockCancelAnimationFrame);

// Register physics and controller updates (same as browser)
physicsEngine.scheduleUpdates(frameManager);
frameManager.addFrameListener(carController.update);
frameManager.addFrameListener(playbackController.update);

// Start frame manager (schedules first frame)
frameManager.start();

// Run simulation
const maxFrames = 500;
console.log(`\nRunning simulation for ${maxFrames} frames...`);

// Simulate timestamp progression
let now = 0;
const frameDuration = model.frameDuration; // 16.666... ms for 60 FPS

for (let frame = 0; frame < maxFrames; frame++) {
  // Execute all pending frame callbacks (synchronously)
  const callbacks = [...frameCallbacks];
  frameCallbacks = [];

  callbacks.forEach(fc => {
    fc.callback(now);
  });

  now += frameDuration;

  // Log progress every 100 frames
  if ((frame + 1) % 100 === 0) {
    console.log(`Frame ${frame + 1}/${maxFrames}: Position (${car.position.x.toFixed(2)}, ${car.position.y.toFixed(2)}), Speed: ${car.velocity.forward.toFixed(2)}, Gas: ${car.controls.gasPedal.toFixed(2)}, Steering: ${car.controls.steeringWheel.toFixed(2)}`);
  }
}

frameManager.stop();

console.log('\nSimulation complete!');
console.log('===================');
console.log(`Final position: (${car.position.x.toFixed(2)}, ${car.position.y.toFixed(2)})`);
console.log(`Final velocity: forward=${car.velocity.forward.toFixed(2)}, lateral=${car.velocity.lateral.toFixed(2)}`);
console.log(`Final direction: ${car.direction.toFixed(2)} radians`);
console.log(`Lap count: ${car.round}`);
console.log(`Track sequence: ${car.trackSequence}`);
console.log(`Checkpoints hit: ${car.roundTimes.length}`);
console.log(`Checkpoint frames: ${car.roundTimes.join(', ')}`);
console.log(`On track: ${car.segment.type !== 'offtrack'}`);
console.log(`Current segment: ${car.segment.type}`);
