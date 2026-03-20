jracer.model = (function () {
  'use strict';

  const model = {
    Car: function () {

      this.position = new jracer.Vector(0, 0);

      this.velocity = {
        forward: 0,
        lateral: 0
      };

      this.direction = 0;

      this.controls = {
        gasPedal: 0,
        brake: 0,
        steeringWheel: 0,
        maxSteeringAngle: 0.75
      };

      const width = 16;
      const length = 30;
      const wheelbase = 22; // Radstand
      const trackWidth = 10; // Spurbreite
      const frontOverhang = 3;
      const rearOverhang = 3;
      const sideOverhang = 3;

      this.dimensions = {
        width,
        length,
        wheelbase,
        trackWidth,
        frontOverhang,
        rearOverhang,
        sideOverhang
      };

      this.component = undefined;
      this.trackSequence = 0;
      this.round = 1;
      this.roundTimes = [];

    },
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
