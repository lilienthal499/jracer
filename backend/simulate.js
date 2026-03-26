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
if (!recordedPlayer) {
  console.error('No recorded player found in config!');
  process.exit(1);
}

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

// Create minimal frame manager that just stores listeners
const frameListeners = [];
const fakeFrameManager = {
  addFrameListener: (listener) => frameListeners.push(listener),
  addSubFrameListener: () => {} // No longer needed - physics now updates carModel directly
};

// Register physics updates with fake frame manager
physicsEngine.scheduleUpdates(fakeFrameManager);

// Run simulation
const maxFrames = 500;
console.log(`\nRunning simulation for ${maxFrames} frames...`);

for (let frame = 0; frame < maxFrames; frame++) {
  // Update controllers
  carController.update();
  playbackController.update();

  // Update physics by calling all registered frame listeners
  frameListeners.forEach(listener => listener());

  // Increment frame counter
  model.frameNumber++;

  // Log progress every 100 frames
  if ((frame + 1) % 100 === 0) {
    console.log(`Frame ${frame + 1}/${maxFrames}: Position (${car.position.x.toFixed(2)}, ${car.position.y.toFixed(2)}), Speed: ${car.velocity.forward.toFixed(2)}, Gas: ${car.controls.gasPedal.toFixed(2)}, Steering: ${car.controls.steeringWheel.toFixed(2)}`);
  }
}

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
