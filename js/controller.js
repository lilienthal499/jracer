import { model } from './model.js';
import { Keys } from '../shared/keys.js';

/**
 * Controller Architecture Overview:
 *
 * This module provides a layered controller system for car input:
 *
 * 1. createDelayedController (utility)
 *    - Provides gradual control value transitions over multiple frames
 *    - Used internally to smooth gas/brake/steering inputs
 *
 * 2. createCarController (core layer)
 *    - Manages car.controls (gasPedal, brake, steeringWheel)
 *    - Public API: pressed(keyName), release(keyName), update()
 *    - Input-agnostic: works with keyboard, AI, playback, or any source
 *    - Registered with frameManager to update delayed controllers each frame
 *
 * 3. createKeyboardController (input adapter)
 *    - Translates DOM keyboard events to carController API calls
 *    - Maps key codes to key names (UP/DOWN/LEFT/RIGHT)
 *    - Prevents duplicate press/release events
 *    - One of many possible input sources (AI, recording playback, etc.)
 *
 * Data Flow:
 *   KeyboardEvent → KeyboardController → CarController → car.controls → PhysicsEngine
 *
 * Extension Points:
 *   - New input sources call carController.pressed()/release() directly
 *   - Example: createPlaybackController(recording, carController)
 *   - Example: createAIController(trackData, carController)
 */

/**
 * Creates a controller that gradually updates a value over multiple frames.
 * Used to smooth control transitions (gas, brake, steering).
 *
 * @param {number} delay - Duration in milliseconds
 * @param {function(number)} callback - Called each frame with progress (0-1)
 * @returns {{update: function}} Controller with update method
 */
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

/**
 * Creates a car controller that manages car control inputs (gas, brake, steering).
 *
 * This is the core controller layer that:
 * - Accepts input from any source via pressed()/release() API
 * - Manages delayed/gradual control transitions
 * - Directly manipulates car.controls object
 * - Must be registered with frameManager.addFrameListener(controller.update)
 *
 * The controller is input-agnostic: keyboard, AI, playback, or any other
 * input source can call pressed()/release() with key names.
 *
 * @param {Object} car - Car model with controls object
 * @returns {{pressed: function, release: function, update: function}}
 */
export function createCarController(car) {
  // Delayed controllers provide gradual transitions for realistic control feel
  const delayedControllers = {
    gasPedal: undefined,
    brake: undefined,
    steeringWheel: undefined
  };

  // Key state manager with validation (using closure)
  function createKeyStateManager() {
    const states = new Map();

    return {
      press: (keyName) => {
        states.set(keyName, true);
      },
      release: (keyName) => {
        if (!states.get(keyName)) {
          throw new Error(`Duplicate key release: ${keyName} already released`);
        }
        states.set(keyName, false);
      },
      isPressed: (keyName) => states.get(keyName) || false
    };
  }

  const keyState = createKeyStateManager();

  // Gas pedal handlers
  function onKeyUpPressed() {
    keyState.press(Keys.UP);
    delayedControllers.gasPedal = createDelayedController(400, progress => {
      // This could be non-linear
      car.controls.gasPedal = progress;
    });
  }

  function onKeyUpReleased() {
    keyState.release(Keys.UP);
    delayedControllers.gasPedal = undefined;
    car.controls.gasPedal = 0;
  }

  // Brake handlers
  function onKeyDownPressed() {
    keyState.press(Keys.DOWN);
    delayedControllers.brake = createDelayedController(200, progress => {
      car.controls.brake = progress;
    });
  }

  function onKeyDownReleased() {
    keyState.release(Keys.DOWN);
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
    keyState.press(Keys.LEFT);
    if (keyState.isPressed(Keys.RIGHT)) {
      steeringWheelNotTurned();
    } else {
      steeringWheelTurnedLeft();
    }
  }

  function onKeyLeftReleased() {
    keyState.release(Keys.LEFT);
    if (keyState.isPressed(Keys.RIGHT)) {
      steeringWheelTurnedRight();
    } else {
      steeringWheelNotTurned();
    }
  }

  // Right steering handlers
  function onKeyRightPressed() {
    keyState.press(Keys.RIGHT);
    if (keyState.isPressed(Keys.LEFT)) {
      steeringWheelNotTurned();
    } else {
      steeringWheelTurnedRight();
    }
  }

  function onKeyRightReleased() {
    keyState.release(Keys.RIGHT);
    if (keyState.isPressed(Keys.LEFT)) {
      steeringWheelTurnedLeft();
    } else {
      steeringWheelNotTurned();
    }
  }

  // Public API - called by input sources (keyboard, AI, playback, etc.)
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

  // Called every frame by frameManager to update delayed controller progress
  function update() {
    Object.keys(delayedControllers).forEach(propertyName => {
      if (delayedControllers[propertyName] !== undefined) {
        delayedControllers[propertyName].update();
      }
    });
  }

  return { pressed, release, update };
}

/**
 * Creates a keyboard input adapter that translates DOM events to car controller calls.
 *
 * This is ONE possible input source for carController. Others could include:
 * - AI controller (reads track state, calls pressed/release)
 * - Playback controller (replays recorded inputs)
 * - Network controller (remote player inputs)
 * - Gamepad controller (joystick/button events)
 *
 * The keyboard controller:
 * - Maps physical key codes to logical key names (UP/DOWN/LEFT/RIGHT)
 * - Prevents duplicate events (tracks isPressed state per key)
 * - Delegates to carController.pressed()/release()
 *
 * Usage:
 *   const keyboardController = createKeyboardController(keyConfig, carController);
 *   document.addEventListener('keydown', keyboardController.getKeyHandler());
 *   document.addEventListener('keyup', keyboardController.getKeyHandler());
 *
 * @param {Array} keyConfig - Array of {key: string, code: string} mappings
 * @param {Object} carController - Car controller with pressed/release methods
 * @returns {{getKeyHandler: function}}
 */
export function createKeyboardController(keyConfig, carController) {
  const keys = [];

  function setupKeys() {
    // Reverse order ensures first key config takes priority if duplicates exist
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
    carController.pressed(Key.name); // Delegates to carController
  }

  function onKeyUp(Key) {
    Key.isPressed = false;
    carController.release(Key.name); // Delegates to carController
  }

  function keyHandler(event) {
    const Key = getKey(event.code);
    if (Key === undefined) {
      return; // Ignore keys not in config
    }
    // Prevent duplicate events (browser may fire multiple keydown while held)
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

/**
 * Creates a recording decorator that wraps a car controller to capture inputs.
 * Automatically exports recording to console after frame 2000.
 *
 * Decorator pattern: wraps carController.pressed() and carController.release()
 * to record all input events while passing through to the wrapped controller.
 *
 * @param {Object} carController - Car controller to wrap
 * @returns {{pressed: function, release: function, update: function}}
 */
export function createRecordingDecorator(carController) {
  const recordingStartFrame = model.frameNumber;
  const recording = {};
  let hasExported = false;

  function recordToggle(keyName) {
    const currentFrame = model.frameNumber - recordingStartFrame;
    const frameKey = currentFrame.toString();

    if (recording[frameKey] === undefined) {
      recording[frameKey] = [];
    }
    recording[frameKey].push(keyName);
  }

  function pressed(keyName) {
    recordToggle(keyName);
    carController.pressed(keyName);
  }

  function release(keyName) {
    recordToggle(keyName);
    carController.release(keyName);
  }

  function update() {
    const currentFrame = model.frameNumber - recordingStartFrame;

    // Auto-export at frame 500
    if (currentFrame >= 500 && !hasExported) {
      console.log('=== RECORDING EXPORT (Frame 500) ===');
      console.log(JSON.stringify(recording, null, 2));
      console.log('=== Total frames recorded:', Object.keys(recording).length);
      hasExported = true;
    }

    // Call wrapped controller update
    carController.update();
  }

  return { pressed, release, update };
}

/**
 * Creates a playback controller that replays recorded inputs.
 *
 * Recording format (frame-based, toggle on repeat):
 * {
 *   "0": ["UP"],              // Frame 0: press UP
 *   "60": ["RIGHT"],          // Frame 60: press RIGHT (UP still held)
 *   "120": ["RIGHT"],         // Frame 120: release RIGHT (toggle - same key again)
 *   "660": ["UP", "DOWN", "LEFT"]  // Frame 660: release UP, press DOWN and LEFT
 * }
 *
 * Listing a key toggles its state: press if released, release if pressed.
 * Minimal format - no prefixes needed, only record actual input events.
 *
 * @param {Object} recording - Frame number to array of key toggles
 * @param {Object} carController - Car controller with pressed/release methods
 * @returns {{update: function}}
 */
export function createPlaybackController(recording, carController) {
  const playbackStartFrame = model.frameNumber;
  const keyStates = new Map(); // Track current state of each key

  // Called every frame by frameManager
  function update() {
    const currentFrame = model.frameNumber - playbackStartFrame;
    const frameKey = currentFrame.toString();

    // Check if there are key events for this frame
    if (recording[frameKey] !== undefined) {
      const keyToggles = recording[frameKey];

      keyToggles.forEach(key => {
        const isCurrentlyPressed = keyStates.get(key) || false;

        if (isCurrentlyPressed) {
          // Key is pressed, so release it
          carController.release(key);
          keyStates.set(key, false);
        } else {
          // Key is released, so press it
          carController.pressed(key);
          keyStates.set(key, true);
        }
      });
    }
  }

  return { update };
}

