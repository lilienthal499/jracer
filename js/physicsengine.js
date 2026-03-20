jracer.PhysicsEngine = function (model) {
  'use strict';
  var carPhyicsControllers = [],

    dt = model.frameDurationInSeconds,

    ROLLING_RESISTANCE = 50,
    STATIC_FRICTION = 550,
    DRIFTING_FRICTION = STATIC_FRICTION * 0.9,
    AERODYNAMIC_RESISTANCE_FRONT = 0.001,
    AERODYNAMIC_RESISTANCE_SIDE = 0,
    TURNING_FRICTION = 0.4,
    TURNING_FRICTION_SLIDE = TURNING_FRICTION * 0.8,

    enginePower = 180,
    brakePower = 600;

  function increaseAbsoluteValue(valueToIncrease, amount) {
    var result = valueToIncrease + amount;
    if (result < 0 && valueToIncrease > 0) {
      return 0;
    }
    if (result > 0 && valueToIncrease < 0) {
      return 0;
    }
    return result;
  }

  function CarPhyicsController(carModel) {

    var undirectedVelocity = new jracer.Vector(0, 0),
      directedVelocity = new jracer.Vector(0, 0),
      angularVelocity = 0,
      angularDrifting = false,
      notRealizedAcceleration = 0,
      last = {
        position: new jracer.Vector(0, 0),
        velocity: {
          forward: 0,
          lateral: 0
        },
        direction: 0
      },
      next = {
        position: new jracer.Vector(0, 0),
        velocity: {
          forward: 0,
          lateral: 0
        },
        direction: 0
      };

    function calculateDirection() {

      function calculateTragetAngularVelocity() {

        var tragetAngularVelocity = 0, currentSteeringAngle, turnRadius;

        currentSteeringAngle = carModel.controls.maxSteeringAngle * carModel.controls.steeringWheel;

        // wheelbase * sinus(steering angle) = turn radius
        turnRadius = carModel.dimensions.wheelbase / Math.sin(currentSteeringAngle);

        tragetAngularVelocity = next.velocity.forward / turnRadius;

        return tragetAngularVelocity;
      }

      function calculateAngularAcceleration(tragetAngularVelocity) {

        var angularAcceleration,
          friction = next.velocity.drifting ? TURNING_FRICTION_SLIDE : TURNING_FRICTION;

        angularAcceleration = tragetAngularVelocity - angularVelocity;
        angularDrifting = Math.abs(angularAcceleration) > friction;

        if (angularDrifting) {
          if (angularAcceleration > 0) {
            angularAcceleration = TURNING_FRICTION_SLIDE;
          }
          if (angularAcceleration < 0) {
            angularAcceleration = -TURNING_FRICTION_SLIDE;
          }
        }
        return angularAcceleration;
      }

      var tragetAngularVelocity, angularAcceleration;

      tragetAngularVelocity = calculateTragetAngularVelocity();
      angularAcceleration = calculateAngularAcceleration(tragetAngularVelocity);
      angularVelocity += angularAcceleration;

      return next.direction + angularVelocity * dt;
    }

    function calculateAcceleration(velocity) {

      function getCurrentFriction() {
        // if (carModel.next.velocity.drifting) {
        // console.log("drifting");
        // }

        return next.velocity.drifting ? DRIFTING_FRICTION : STATIC_FRICTION;
      }

      var acceleration = new jracer.Vector(0, 0),
        currentFriction = getCurrentFriction();

      notRealizedAcceleration = 0;

      // forward
      acceleration.y += enginePower * carModel.controls.gasPedal;

      if (velocity.y > 0) {
        acceleration.y -= brakePower * carModel.controls.brake;
        if (acceleration.y < -currentFriction) {
          notRealizedAcceleration += acceleration.y + currentFriction;
          // console.log("Zu stark gebremst!" + notRealizedAcceleration);
          acceleration.y = -DRIFTING_FRICTION;
        }
        acceleration.y -= ROLLING_RESISTANCE;
        acceleration.y -= Math.pow(velocity.y, 2) * AERODYNAMIC_RESISTANCE_FRONT;
      }

      if (acceleration.y > currentFriction) {
        notRealizedAcceleration += acceleration.y - currentFriction;
        acceleration.y = DRIFTING_FRICTION;
        // console.log("Zu schnell beschleunigt! " + notRealizedAcceleration);
      }

      // backwards
      if (velocity.y < 0) {
        acceleration.y += currentFriction;
      }


      // lateral
      if (velocity.x > 0) {
        acceleration.x -= currentFriction;
        acceleration.x -= Math.pow(velocity.x, 2) * AERODYNAMIC_RESISTANCE_SIDE;
      }

      if (velocity.x < 0) {
        acceleration.x += currentFriction;
        acceleration.x += Math.pow(velocity.x, 2) * AERODYNAMIC_RESISTANCE_SIDE;
      }

      return acceleration;
    }

    function calculateVelocity(acceleration, velocity) {

      velocity.x = increaseAbsoluteValue(velocity.x, acceleration.x * dt);
      velocity.y = increaseAbsoluteValue(velocity.y, acceleration.y * dt);

    }


    function calculateDisplacement(velocity) {
      return new jracer.Vector(velocity.x * dt, velocity.y * dt);
    }


    function copyModel(targetModel, sourceModel) {

      targetModel.direction = sourceModel.direction;

      targetModel.position.x = sourceModel.position.x;
      targetModel.position.y = sourceModel.position.y;

      targetModel.velocity.lateral = sourceModel.velocity.lateral;
      targetModel.velocity.forward = sourceModel.velocity.forward;

    }


    function setCarModel(direction, displacement, velocity) {

      copyModel(last, next);

      next.direction = direction;

      next.position.x += displacement.x;
      next.position.y += displacement.y;

      //TODO Compare with

      next.velocity.lateral = velocity.x;
      next.velocity.forward = velocity.y;

      next.velocity.drifting = Math.abs(next.velocity.lateral) > 0 || angularDrifting || Math.abs(notRealizedAcceleration) > 0;
      next.notRealizedAcceleration = notRealizedAcceleration;

    }

    function calculateTrackComponent() {

      var gridX = Math.ceil(next.position.x / jracer.model.track.gridSize) - 1,
        gridY = Math.ceil(next.position.y / jracer.model.track.gridSize) - 1,
        component;

      try {
        component = jracer.model.track.grid[gridX][gridY];

        if (carModel.trackSequence === jracer.model.track.sequenceOfComponents.length - 1 && component.getSequenceNumber() === 1){
          carModel.round += 1;
          carModel.trackSequence = 1;
          //console.log(carModel.trackSequence);
        }
        if (carModel.trackSequence === component.getSequenceNumber() - 1){
          carModel.component = component;
          carModel.trackSequence += 1;
          //console.log(carModel.trackSequence);
          carModel.roundTimes.push(jracer.model.frameNumber);
          console.dir(carModel.roundTimes);
        }

      } catch (TypeError) {
        console.log('Outside Track Area');
      }
    }

    // Initialize
    copyModel(next, carModel);
    copyModel(last, carModel);

    this.calculateNewFrame = function () {

      var direction, acceleration, displacement;

      direction = calculateDirection();

      directedVelocity.copyFrom(undirectedVelocity);
      directedVelocity.rotate(direction);

      acceleration = calculateAcceleration(directedVelocity);

      calculateVelocity(acceleration, directedVelocity);

      undirectedVelocity.copyFrom(directedVelocity);
      undirectedVelocity.rotate(-direction);

      displacement = calculateDisplacement(undirectedVelocity);

      setCarModel(direction, displacement, directedVelocity);

      calculateTrackComponent();

    };

    this.calculateSubFrame = function (progress) {
      var current = carModel;

      function calculateCurrentValue(lastValue, nextValue) {
        var diff = nextValue - lastValue;
        return nextValue + (diff * progress);
      }

      current.position.x = calculateCurrentValue(last.position.x, next.position.x);
      current.position.y = calculateCurrentValue(last.position.y, next.position.y);
      current.direction = calculateCurrentValue(last.direction, next.direction);
      current.velocity.forward = calculateCurrentValue(last.velocity.forward, next.velocity.forward);
      current.velocity.lateral = calculateCurrentValue(last.velocity.lateral, next.velocity.lateral);

    };
  }

  function calculateSubFrame(progress) {
    var index, carPhyicsController;
    for (index = carPhyicsControllers.length - 1; index >= 0; index -= 1) {
      carPhyicsController = carPhyicsControllers[index];
      carPhyicsController.calculateSubFrame(progress);
    }
  }

  function calculateNewFrame() {
    var index, carPhyicsController;
    for (index = carPhyicsControllers.length - 1; index >= 0; index -= 1) {
      carPhyicsController = carPhyicsControllers[index];
      carPhyicsController.calculateNewFrame();
    }
  }


  return {
    addCar: function (carModel) {
      carPhyicsControllers.push(new CarPhyicsController(carModel));
    },
    sheduleUpdates: function (frameManager) {
      frameManager.addSubFrameListener(calculateSubFrame);
      frameManager.addFrameListener(calculateNewFrame);
    }
  };

};
