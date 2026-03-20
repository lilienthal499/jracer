jracer.model = (function () {
  'use strict';

  var model = {
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

      this.dimensions = {
        width: 16,
        length: 30,
        wheelbase: 22, // Radstand
        trackWidth: 10, // Spurbreite
        frontOverhang: 3,
        rearOverhang: 3,
        sideOverhang: 3
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
