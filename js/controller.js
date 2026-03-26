import { model } from './model.js';
import { Keys } from '../shared/keys.js';

export function createDelayedController(delay, callback) {
  const numberOfSteps = Math.ceil(delay / model.frameDuration);
  const initialFrameNumber = model.frameNumber;

  function update() {
    const currentStep = model.frameNumber - initialFrameNumber;
    if (currentStep <= numberOfSteps) {
      callback(currentStep / numberOfSteps);
    }
  }

  return { update };
}

export function createCarController(car) {
  const delayedControllers = {
    gasPedal: undefined,
    brake: undefined,
    steeringWheel: undefined
  };
  let leftIsPressed = false;
  let rightIsPressed = false;

  // Gas pedal handlers
  function onKeyUpPressed() {
    delayedControllers.gasPedal = createDelayedController(400, progress => {
      // This could be non-linear
      car.controls.gasPedal = progress;
    });
  }

  function onKeyUpReleased() {
    delayedControllers.gasPedal = undefined;
    car.controls.gasPedal = 0;
  }

  // Brake handlers
  function onKeyDownPressed() {
    delayedControllers.brake = createDelayedController(200, progress => {
      car.controls.brake = progress;
    });
  }

  function onKeyDownReleased() {
    delayedControllers.brake = undefined;
    car.controls.brake = 0;
  }

  // Steering wheel state managers
  function steeringWheelTurnedLeft() {
    delayedControllers.steeringWheel = createDelayedController(400, progress => {
      // This could be non-linear
      car.controls.steeringWheel = -progress;
    });
  }

  function steeringWheelTurnedRight() {
    delayedControllers.steeringWheel = createDelayedController(400, progress => {
      // This could be non-linear
      car.controls.steeringWheel = progress;
    });
  }

  function steeringWheelNotTurned() {
    delayedControllers.steeringWheel = createDelayedController(600, progress => {
      if (car.controls.steeringWheel > 0) {
        car.controls.steeringWheel -= progress;
        car.controls.steeringWheel = Math.max(car.controls.steeringWheel, 0);
      }
      if (car.controls.steeringWheel < 0) {
        car.controls.steeringWheel += progress;
        car.controls.steeringWheel = Math.min(car.controls.steeringWheel, 0);
      }
    });
    car.controls.steeringWheel = 0;
  }

  // Left steering handlers
  function onKeyLeftPressed() {
    leftIsPressed = true;
    if (rightIsPressed) {
      steeringWheelNotTurned();
    } else {
      steeringWheelTurnedLeft();
    }
  }

  function onKeyLeftReleased() {
    leftIsPressed = false;
    if (rightIsPressed) {
      steeringWheelTurnedRight();
    } else {
      steeringWheelNotTurned();
    }
  }

  // Right steering handlers
  function onKeyRightPressed() {
    rightIsPressed = true;
    if (leftIsPressed) {
      steeringWheelNotTurned();
    } else {
      steeringWheelTurnedRight();
    }
  }

  function onKeyRightReleased() {
    rightIsPressed = false;
    if (leftIsPressed) {
      steeringWheelTurnedLeft();
    } else {
      steeringWheelNotTurned();
    }
  }

  // Public API
  function pressed(keyName) {
    switch (keyName) {
      case Keys.UP:
        onKeyUpPressed();
        break;
      case Keys.DOWN:
        onKeyDownPressed();
        break;
      case Keys.LEFT:
        onKeyLeftPressed();
        break;
      case Keys.RIGHT:
        onKeyRightPressed();
        break;
    }
  }

  function release(keyName) {
    switch (keyName) {
      case Keys.UP:
        onKeyUpReleased();
        break;
      case Keys.DOWN:
        onKeyDownReleased();
        break;
      case Keys.LEFT:
        onKeyLeftReleased();
        break;
      case Keys.RIGHT:
        onKeyRightReleased();
        break;
    }
  }

  function update() {
    Object.keys(delayedControllers).forEach(propertyName => {
      if (delayedControllers[propertyName] !== undefined) {
        delayedControllers[propertyName].update();
      }
    });
  }

  return { pressed, release, update };
}

export function createKeyboardController(keyConfig, carController) {
  const keys = [];

  function setupKeys() {
    keyConfig
      .slice()
      .reverse()
      .forEach(config => {
        keys.push({
          name: config.key,
          code: config.code,
          isPressed: false
        });
      });
  }

  function getKey(code) {
    return keys.find(key => key.code === code);
  }

  function onKeyDown(Key) {
    Key.isPressed = true;
    carController.pressed(Key.name);
  }

  function onKeyUp(Key) {
    Key.isPressed = false;
    carController.release(Key.name);
  }

  function keyHandler(event) {
    const Key = getKey(event.code);
    if (Key === undefined) {
      return;
    }
    if (event.type === 'keydown' && Key.isPressed === false) {
      onKeyDown(Key);
    }
    if (event.type === 'keyup' && Key.isPressed === true) {
      onKeyUp(Key);
    }
  }

  setupKeys();

  return { getKeyHandler: () => keyHandler };
}
