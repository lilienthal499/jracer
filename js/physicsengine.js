import { Vector } from './vector.js';
import { model } from './model.js';

export function createPhysicsEngine(modelInstance) {
  'use strict';
  const carPhysicsControllers = [];

  const dt = modelInstance.frameDurationInSeconds;

  const ROLLING_RESISTANCE = 50;
  const STATIC_FRICTION = 550;
  const DRIFTING_FRICTION = STATIC_FRICTION * 0.9;
  const AERODYNAMIC_RESISTANCE_FRONT = 0.001;
  const AERODYNAMIC_RESISTANCE_SIDE = 0;
  const TURNING_FRICTION = 0.4;
  const TURNING_FRICTION_SLIDE = TURNING_FRICTION * 0.8;

  const enginePower = 180;
  const brakePower = 600;

  function increaseAbsoluteValue(valueToIncrease, amount) {
    const result = valueToIncrease + amount;
    if (result < 0 && valueToIncrease > 0) {
      return 0;
    }
    if (result > 0 && valueToIncrease < 0) {
      return 0;
    }
    return result;
  }

  function createCarPhysicsController(carModel) {
    const undirectedVelocity = new Vector(0, 0);
    const directedVelocity = new Vector(0, 0);
    let angularVelocity = 0;
    let angularDrifting = false;
    let notRealizedAcceleration = 0;
    const last = {
      position: new Vector(0, 0),
      velocity: {
        forward: 0,
        lateral: 0
      },
      direction: 0
    };
    const next = {
      position: new Vector(0, 0),
      velocity: {
        forward: 0,
        lateral: 0
      },
      direction: 0
    };

    function calculateDirection() {
      function calculateTargetAngularVelocity() {
        let targetAngularVelocity = 0;
        const currentSteeringAngle = carModel.controls.maxSteeringAngle * carModel.controls.steeringWheel;

        // wheelbase * sinus(steering angle) = turn radius
        const turnRadius = carModel.dimensions.wheelbase / Math.sin(currentSteeringAngle);

        targetAngularVelocity = next.velocity.forward / turnRadius;

        return targetAngularVelocity;
      }

      function calculateAngularAcceleration(targetAngularVelocity) {
        let angularAcceleration;
        const friction = next.velocity.drifting ? TURNING_FRICTION_SLIDE : TURNING_FRICTION;

        angularAcceleration = targetAngularVelocity - angularVelocity;
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

      const targetAngularVelocity = calculateTargetAngularVelocity();
      const angularAcceleration = calculateAngularAcceleration(targetAngularVelocity);
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

      const acceleration = new Vector(0, 0);
      const currentFriction = getCurrentFriction();

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
      return new Vector(velocity.x * dt, velocity.y * dt);
    }

    function copyCarState(targetModel, sourceModel) {
      targetModel.direction = sourceModel.direction;

      targetModel.position.x = sourceModel.position.x;
      targetModel.position.y = sourceModel.position.y;

      targetModel.velocity.lateral = sourceModel.velocity.lateral;
      targetModel.velocity.forward = sourceModel.velocity.forward;
    }

    function setCarModel(direction, displacement, velocity) {
      copyCarState(last, next);

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
      const gridX = Math.ceil(next.position.x / model.track.gridSize) - 1;
      const gridY = Math.ceil(next.position.y / model.track.gridSize) - 1;
      let component;

      try {
        component = model.track.grid[gridX][gridY];

        if (carModel.trackSequence === model.track.sequenceOfComponents.length - 1 && component.getSequenceNumber() === 1) {
          carModel.round += 1;
          carModel.trackSequence = 1;
          //console.log(carModel.trackSequence);
        }
        if (carModel.trackSequence === component.getSequenceNumber() - 1) {
          carModel.component = component;
          carModel.trackSequence += 1;
          //console.log(carModel.trackSequence);
          carModel.roundTimes.push(model.frameNumber);
          console.dir(carModel.roundTimes);
        }
      } catch (TypeError) {
        console.log('Outside Track Area');
      }
    }

    // Initialize
    copyCarState(next, carModel);
    copyCarState(last, carModel);

    function calculateNewFrame() {
      const direction = calculateDirection();

      directedVelocity.copyFrom(undirectedVelocity);
      directedVelocity.rotate(direction);

      const acceleration = calculateAcceleration(directedVelocity);

      calculateVelocity(acceleration, directedVelocity);

      undirectedVelocity.copyFrom(directedVelocity);
      undirectedVelocity.rotate(-direction);

      const displacement = calculateDisplacement(undirectedVelocity);

      setCarModel(direction, displacement, directedVelocity);

      calculateTrackComponent();
    }

    function calculateSubFrame(progress) {
      const current = carModel;

      function calculateCurrentValue(lastValue, nextValue) {
        const diff = nextValue - lastValue;
        return nextValue + diff * progress;
      }

      current.position.x = calculateCurrentValue(last.position.x, next.position.x);
      current.position.y = calculateCurrentValue(last.position.y, next.position.y);
      current.direction = calculateCurrentValue(last.direction, next.direction);
      current.velocity.forward = calculateCurrentValue(last.velocity.forward, next.velocity.forward);
      current.velocity.lateral = calculateCurrentValue(last.velocity.lateral, next.velocity.lateral);
    }

    return { calculateNewFrame, calculateSubFrame };
  }

  function updateAllCarsSubFrame(progress) {
    carPhysicsControllers.forEach(carPhysicsController => {
      carPhysicsController.calculateSubFrame(progress);
    });
  }

  function updateAllCarsFrame() {
    carPhysicsControllers.forEach(carPhysicsController => {
      carPhysicsController.calculateNewFrame();
    });
  }

  return {
    addCar: function (carModel) {
      carPhysicsControllers.push(createCarPhysicsController(carModel));
    },
    scheduleUpdates: function (frameManager) {
      frameManager.addSubFrameListener(updateAllCarsSubFrame);
      frameManager.addFrameListener(updateAllCarsFrame);
    }
  };
}
