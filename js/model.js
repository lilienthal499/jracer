jracer.model = (function () {
  'use strict';

  function createCar() {
    return {
      position: new jracer.Vector(0, 0),

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

      component: undefined,
      trackSequence: 0,
      round: 1,
      roundTimes: []
    };
  }

  const model = {
    createCar,
    paused: false,
    frameNumber: 0,
    framesPerSecond: 60,
    frameDuration: 0, // Milliseconds
    frameDurationInSeconds: 0,
    cars : [],
    track: {
      dimensions: {
        width: 3000,
        height: 3000
      },
      startingPosition: {
        x:1500,
        y:1500
      },
      gridSize: 100
    }
  };

  model.frameDuration = Math.floor(1000 / model.framesPerSecond);
  model.frameDurationInSeconds = model.frameDuration / 1000;

  return model;

}());
