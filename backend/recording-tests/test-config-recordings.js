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

console.log('=== TEST EXISTING RECORDINGS FROM CONFIG ===\n');

// Find recorded players
const recordedPlayers = config.players.filter(p => p.recording !== undefined);
console.log(`Found ${recordedPlayers.length} recorded players: ${recordedPlayers.map(p => p.name).join(', ')}\n`);

recordedPlayers.forEach((player, playerIndex) => {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing player: ${player.name}`);
  console.log(`${'='.repeat(60)}`);

  // Reset model
  model.frameNumber = 0;
  model.cars = [];

  const physicsEngine = createPhysicsEngine(model);
  const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
  model.track = track.getModel();

  // Create car
  const car = createCar();
  car.controls.maxSteeringAngle = player.maxSteeringAngle;
  car.position.x = model.track.startingPosition.x;
  car.position.y = model.track.startingPosition.y;
  car.segment = model.track.getSegmentAtPosition(car.position.x, car.position.y);
  model.cars.push(car);

  // Create controllers
  const carController = createCarController(car);
  const playbackController = createPlaybackController(player.recording, carController);

  physicsEngine.addCar(car);
  const frameListeners = [];
  physicsEngine.scheduleUpdates({
    addFrameListener: (listener) => frameListeners.push(listener),
    addSubFrameListener: () => {}
  });

  // Analyze recording
  const frameNumbers = Object.keys(player.recording).map(Number).sort((a, b) => a - b);
  console.log(`\nRecording analysis:`);
  console.log(`  First frame: ${frameNumbers[0]}`);
  console.log(`  Last frame: ${frameNumbers[frameNumbers.length - 1]}`);
  console.log(`  Total events: ${frameNumbers.length}`);
  console.log(`  Recording sample (first 5 events):`);
  frameNumbers.slice(0, 5).forEach(frame => {
    console.log(`    Frame ${frame}: ${player.recording[frame].join(', ')}`);
  });

  // Run simulation
  const maxFrames = Math.max(...frameNumbers) + 100; // Run 100 frames past last event

  console.log(`\nRunning simulation for ${maxFrames} frames...`);

  const checkpoints = [0, 50, 100, 200, 300, 400, maxFrames - 1];
  console.log('\nSimulation progress:');
  console.log('Frame | Position          | Speed  | Gas | Steer | On Track');
  console.log('------|-------------------|--------|-----|-------|----------');

  for (let frame = 0; frame < maxFrames; frame++) {
    carController.update();
    playbackController.update();
    frameListeners.forEach(listener => listener());

    if (checkpoints.includes(frame)) {
      const pos = `(${car.position.x.toFixed(1)}, ${car.position.y.toFixed(1)})`;
      const onTrack = car.segment.type !== 'offtrack' ? '✓' : '✗ OFF';
      console.log(`${frame.toString().padStart(5)} | ${pos.padEnd(17)} | ${car.velocity.forward.toFixed(1).padStart(6)} | ${car.controls.gasPedal.toFixed(1)} | ${car.controls.steeringWheel.toFixed(2)} | ${onTrack}`);
    }

    model.frameNumber++;
  }

  console.log(`\nFinal results:`);
  console.log(`  Position: (${car.position.x.toFixed(2)}, ${car.position.y.toFixed(2)})`);
  console.log(`  Velocity: ${car.velocity.forward.toFixed(2)} (forward), ${car.velocity.lateral.toFixed(2)} (lateral)`);
  console.log(`  Direction: ${car.direction.toFixed(2)} radians`);
  console.log(`  Lap: ${car.round}`);
  console.log(`  Track sequence: ${car.trackSequence}/${model.track.sequenceOfSegments.length}`);
  console.log(`  On track: ${car.segment.type !== 'offtrack' ? 'Yes' : 'No'}`);
  console.log(`  Checkpoints: ${car.roundTimes.length}`);
});

console.log('\n\n=== TEST COMPLETE ===');
