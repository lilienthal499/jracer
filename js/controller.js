import { model } from './model.js';

export const Keys = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
});

export function createDelayedController(delay, callback) {
  'use strict';
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
  'use strict';

  const delayedControllers = {
    gasPedal: undefined,
    brake: undefined,
    steeringWheel: undefined
  };
  let leftIsPressed = false;
  let rightIsPressed = false;

  function steeringWheelTurnedRight() {
    delayedControllers.steeringWheel = createDelayedController(
      400,
      progress => {
        // This could be non-linear
        car.controls.steeringWheel = progress;
      }
    );
  }

  function steeringWheelTurnedLeft() {
    delayedControllers.steeringWheel = createDelayedController(
      400,
      progress => {
        // This could be non-linear
        car.controls.steeringWheel = -progress;
      }
    );
  }

  function steeringWheelNotTurned() {
    delayedControllers.steeringWheel = createDelayedController(
      600,
      progress => {
        if (car.controls.steeringWheel > 0) {
          car.controls.steeringWheel -= progress;
          car.controls.steeringWheel =
            car.controls.steeringWheel > 0 ? car.controls.steeringWheel : 0;
        }
        if (car.controls.steeringWheel < 0) {
          car.controls.steeringWheel += progress;
          car.controls.steeringWheel =
            car.controls.steeringWheel < 0 ? car.controls.steeringWheel : 0;
        }
      }
    );
    car.controls.steeringWheel = 0;
  }

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

  function onKeyDownPressed() {
    delayedControllers.brake = createDelayedController(200, progress => {
      car.controls.brake = progress;
    });
  }

  function onKeyDownReleased() {
    delayedControllers.brake = undefined;
    car.controls.brake = 0;
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

  function update() {
    Object.keys(delayedControllers).forEach(propertyName => {
      if (delayedControllers[propertyName] !== undefined) {
        delayedControllers[propertyName].update();
      }
    });
  }

  return { release, pressed, update };
}

export function createKeyboardController(keyConfig, carController) {
  'use strict';

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
    const Key = getKey(event.keyCode);
    if (Key === undefined) {
      return;
    }
    if (event.type === 'keyup' && Key.isPressed === true) {
      onKeyUp(Key);
    }
    if (event.type === 'keydown' && Key.isPressed === false) {
      onKeyDown(Key);
    }
  }

  function getKeyHandler() {
    return keyHandler;
  }

  setupKeys();

  return { getKeyHandler };
}

// return {
// addKeyboardcontroller: function (keyCodes, car) {

// var carController, keyboardController;
// carController = new CarController(car);
// keyboardController = new KeyboardController(keyCodes, carController);

// document.addEventListener('keydown', keyboardController.keyHandler);
// document.addEventListener('keyup', keyboardController.keyHandler);

// controllers.push(keyboardController);
// },

// };
