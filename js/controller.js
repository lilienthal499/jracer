jracer.controller = {};
jracer.controller.Keys = Object.freeze({
  UP: 'UP',
  DOWN: 'DOWN',
  LEFT: 'LEFT',
  RIGHT: 'RIGHT'
});

jracer.controller.createDelayedController = function (delay, callback) {
  'use strict';
  const numberOfSteps = Math.ceil(delay / jracer.model.frameDuration);
  const initialFrameNumber = jracer.model.frameNumber;

  function update() {
    const currentStep = jracer.model.frameNumber - initialFrameNumber;
    if (currentStep <= numberOfSteps) {
      callback(currentStep / numberOfSteps);
    }
  }

  return { update };
};

jracer.controller.createCarController = function (car) {
  'use strict';

  const delayedControllers = {
    gasPedal: undefined,
    brake: undefined,
    steeringWheel: undefined
  };
  let leftIsPressed = false;
  let rightIsPressed = false;

  function steeringWheelTurnedRight() {
    delayedControllers.steeringWheel = jracer.controller.createDelayedController(
      400,
      (progress) => {
        // This could be non-linear
        car.controls.steeringWheel = progress;
      }
    );
  }

  function steeringWheelTurnedLeft() {
    delayedControllers.steeringWheel = jracer.controller.createDelayedController(
      400,
      (progress) => {
        // This could be non-linear
        car.controls.steeringWheel = -progress;
      }
    );
  }

  function steeringWheelNotTurned() {
    delayedControllers.steeringWheel = jracer.controller.createDelayedController(
      600,
      (progress) => {
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
    delayedControllers.gasPedal = jracer.controller.createDelayedController(
      400,
      (progress) => {
        // This could be non-linear
        car.controls.gasPedal = progress;
      }
    );
  }

  function onKeyUpReleased() {
    delayedControllers.gasPedal = undefined;
    car.controls.gasPedal = 0;
  }

  function onKeyDownPressed() {
    delayedControllers.brake = jracer.controller.createDelayedController(
      200,
      (progress) => {
        car.controls.brake = progress;
      }
    );
  }

  function onKeyDownReleased() {
    delayedControllers.brake = undefined;
    car.controls.brake = 0;
  }

  function release(keyName) {
    switch (keyName) {
      case jracer.controller.Keys.UP:
        onKeyUpReleased();
        break;
      case jracer.controller.Keys.DOWN:
        onKeyDownReleased();
        break;
      case jracer.controller.Keys.LEFT:
        onKeyLeftReleased();
        break;
      case jracer.controller.Keys.RIGHT:
        onKeyRightReleased();
        break;
    }
  }

  function pressed(keyName) {
    switch (keyName) {
      case jracer.controller.Keys.UP:
        onKeyUpPressed();
        break;
      case jracer.controller.Keys.DOWN:
        onKeyDownPressed();
        break;
      case jracer.controller.Keys.LEFT:
        onKeyLeftPressed();
        break;
      case jracer.controller.Keys.RIGHT:
        onKeyRightPressed();
        break;
    }
  }

  function update() {
    Object.keys(delayedControllers).forEach((propertyName) => {
      if (delayedControllers[propertyName] !== undefined) {
        delayedControllers[propertyName].update();
      }
    });
  }

  return { release, pressed, update };
};

jracer.controller.createKeyboardController = function (keyConfig, carController) {
  'use strict';

  const keys = [];

  function setupKeys() {
    keyConfig.slice().reverse().forEach((config) => {
      keys.push({
        name: config.key,
        code: config.code,
        isPressed: false
      });
    });
  }

  function getKey(code) {
    return keys.find((key) => key.code === code);
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
};

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
