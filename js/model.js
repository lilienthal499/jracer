import { Vector } from './vector.js';

export function createCar() {
  const car = {
    position: new Vector(0, 0),

    velocity: {
      forward: 0,
      lateral: 0
    },

    direction: 0,

    controls: {
      gasPedal: 0,
      brake: 0,
      steeringWheel: 0,
      maxSteeringAngle: 0.75
    },

    dimensions: {
      width: 16,
      length: 30,
      wheelbase: 22, // Radstand
      trackWidth: 10, // Spurbreite
      frontOverhang: 3,
      rearOverhang: 3,
      sideOverhang: 3
    },

    segment: undefined,
    trackSequence: 0,
    round: 1,
    roundTimes: [],

    isOnTrack: function () {
      return this.segment.isOnTrack(this.position);
    }
  };

  return car;
}

export const model = {
  createCar,
  paused: false,
  frameNumber: 0,
  framesPerSecond: 60,
  frameDuration: 0, // Milliseconds
  frameDurationInSeconds: 0,
  cars: [],
  track: {
    dimensions: {
      width: 3000,
      height: 3000
    },
    startingPosition: {
      x: 1500,
      y: 1500
    },
    gridSize: 100,
    // Track edge offsets from turn center (as fraction of gridSize)
    // Used for rendering curved sections
    edgeOffsetInner: 0.7, // Smaller radius (tighter turn)
    edgeOffsetOuter: 0.3 // Larger radius (wider turn)
  }
};

model.frameDuration = Math.floor(1000 / model.framesPerSecond);
model.frameDurationInSeconds = model.frameDuration / 1000;
