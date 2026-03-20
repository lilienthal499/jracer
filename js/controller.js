jracer.controller = {};
jracer.controller.Keys = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4
};

jracer.controller.DelayedController = function (delay, callback) {
  'use strict';
  var numberOfSteps = Math.ceil(delay / jracer.model.frameDuration),
    initialFrameNumber = jracer.model.frameNumber;

  this.update = function () {
    var currentStep = jracer.model.frameNumber - initialFrameNumber;
    if (currentStep <= numberOfSteps) {
      callback(currentStep / numberOfSteps);
    }
  };
};

jracer.controller.CarController = function (car) {
  'use strict';

  var delayedControllers = {
      gasPedal: undefined,
      brake: undefined,
      steeringWheel: undefined
    },
    leftIsPressed = false,
    rightIsPressed = false;

  function steeringWheelTurnedRight() {
    delayedControllers.steeringWheel = new jracer.controller.DelayedController(
      400,
      function (progress) {
        // This could be non-linear
        car.controls.steeringWheel = progress;
      }
    );
  }

  function steeringWheelTurnedLeft() {
    delayedControllers.steeringWheel = new jracer.controller.DelayedController(
      400,
      function (progress) {
        // This could be non-linear
        car.controls.steeringWheel = -progress;
      }
    );
  }

  function steeringWheelNotTurned() {
    delayedControllers.steeringWheel = new jracer.controller.DelayedController(
      600,
      function (progress) {
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
    delayedControllers.gasPedal = new jracer.controller.DelayedController(
      400,
      function (progress) {
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
    delayedControllers.brake = new jracer.controller.DelayedController(
      200,
      function (progress) {
        car.controls.brake = progress;
      }
    );
  }

  function onKeyDownReleased() {
    delayedControllers.brake = undefined;
    car.controls.brake = 0;
  }

  this.release = function (keyName) {
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
  };

  this.pressed = function (keyName) {
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
  };

  this.update = function () {
    var propertyName;
    for (propertyName in delayedControllers) {
      if (
        delayedControllers.hasOwnProperty(propertyName) &&
        delayedControllers[propertyName] !== undefined
      ) {
        delayedControllers[propertyName].update();
      }
    }
  };
};

jracer.controller.KeyboardController = function (keyConfig, carController) {
  'use strict';

  var index,
    keys = [];

  function setupKeys() {
    for (index = keyConfig.length - 1; index >= 0; index = index - 1) {
      keys.push({
        name: keyConfig[index].key,
        code: keyConfig[index].code,
        isPressed: false
      });
    }
  }

  function getKey(code) {
    var index;
    for (index in keys) {
      if (keys.hasOwnProperty(index) && keys[index].code === code) {
        return keys[index];
      }
    }
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
    var Key = getKey(event.keyCode);
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

  this.getKeyHandler = function () {
    return keyHandler;
  };
  setupKeys();
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
