// Debug: why isn't playback applying inputs?

import { model, createCar } from '../js/model.js';
import { createCarController, createPlaybackController } from '../js/controller.js';
import { Keys } from '../shared/keys.js';

console.log('=== DEBUG PLAYBACK ===\n');

const recording = {
  "0": ["UP"],
  "50": ["RIGHT"],
  "100": ["RIGHT"],
  "150": ["UP"]
};

console.log('Recording:', JSON.stringify(recording));
console.log('');

model.frameNumber = 0;
const car = createCar();
const carController = createCarController(car);
const playbackController = createPlaybackController(recording, carController);

console.log('Frame | model.frameNumber | Looking for frame | Found event? | Gas  | Steering');
console.log('------|-------------------|-------------------|--------------|------|----------');

for (let frame = 0; frame < 160; frame++) {
  const currentFrame = model.frameNumber; // Save before update

  playbackController.update();
  carController.update();

  const frameKey = (frame).toString(); // What playback is looking for
  const hasEvent = recording[frameKey] !== undefined;

  if ([0, 1, 49, 50, 51, 99, 100, 101, 149, 150, 151].includes(frame)) {
    console.log(`${frame.toString().padStart(5)} | ${currentFrame.toString().padStart(17)} | ${frameKey.padEnd(17)} | ${(hasEvent ? 'YES' : 'no').padEnd(12)} | ${car.controls.gasPedal.toFixed(2)} | ${car.controls.steeringWheel.toFixed(2)}`);
  }

  model.frameNumber++;
}

console.log('\n=== ISSUE IDENTIFIED ===');
console.log('Check if playbackController is calculating currentFrame correctly.');
console.log('playbackStartFrame is captured when createPlaybackController is called.');
console.log('If model.frameNumber is already >0 at that point, the offset will be wrong!');
