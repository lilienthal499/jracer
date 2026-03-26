import { Keys } from '../shared/keys.js';
import { model } from './model.js';

/**
 * Controller Architecture Overview:
 *
 * This module provides a layered controller system for car input:
 *
 * 1. createGradualTransition (utility)
 *    - Provides gradual control value transitions over multiple frames
 *    - Used internally to smooth gas/brake/steering inputs
 *
 * 2. createCarController (core layer)
 *    - Manages car.controls (gasPedal, brake, steeringWheel)
 *    - Public API: pressed(keyName), release(keyName), update()
 *    - Input-agnostic: works with keyboard, AI, playback, or any source
 *    - Registered with frameManager to update gradual transitions each frame
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
 *   - New input sources call carController.press()/release() directly
 *   - Example: createPlaybackController(recording, carController)
 *   - Example: createAIController(trackData, carController)
 */

/**
 * Creates a gradual transition that updates a value over multiple frames.
 * Used to smooth control transitions (gas, brake, steering).
 *
 * @param {number} delay - Duration in milliseconds
 * @param {function(number)} callback - Called each frame with progress (0-1)
 * @returns {{update: function}} Transition object with update method
 */
export function createGradualTransition(delay, callback) {
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
 * - Accepts input from any source via press()/release() API
 * - Manages delayed/gradual control transitions
 * - Directly manipulates car.controls object
 * - Must be registered with frameManager.addFrameListener(controller.update)
 *
 * The controller is input-agnostic: keyboard, AI, playback, or any other
 * input source can call press()/release() with key names.
 *
 * @param {Object} car - Car model with controls object
 * @returns {{press: function, release: function, update: function}}
 */
export function createCarController(car) {
  // Gradual transitions provide smooth control value changes for realistic feel
  const transitions = {
    gasPedal: undefined,
    brake: undefined,
    steeringWheel: undefined
  };

  // Key state manager (using closure)
  function createKeyStateManager() {
    const states = new Map();

    return {
      press: keyName => {
        states.set(keyName, true);
      },
      release: keyName => {
        states.set(keyName, false);
      },
      isPressed: keyName => states.get(keyName) || false
    };
  }

  const keyState = createKeyStateManager();

  // Steering wheel state transitions
  function steeringWheelTurnedLeft() {
    transitions.steeringWheel = createGradualTransition(400, progress => {
      // This could be non-linear
      car.controls.steeringWheel = -progress;
    });
  }

  function steeringWheelTurnedRight() {
    transitions.steeringWheel = createGradualTransition(400, progress => {
      // This could be non-linear
      car.controls.steeringWheel = progress;
    });
  }

  function steeringWheelNotTurned() {
    transitions.steeringWheel = createGradualTransition(600, progress => {
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

  // Gas pedal handlers
  function onKeyUpPressed() {
    keyState.press(Keys.UP);
    transitions.gasPedal = createGradualTransition(400, progress => {
      // This could be non-linear
      car.controls.gasPedal = progress;
    });
  }

  function onKeyUpReleased() {
    keyState.release(Keys.UP);
    transitions.gasPedal = undefined;
    car.controls.gasPedal = 0;
  }

  // Brake handlers
  function onKeyDownPressed() {
    keyState.press(Keys.DOWN);
    transitions.brake = createGradualTransition(200, progress => {
      car.controls.brake = progress;
    });
  }

  function onKeyDownReleased() {
    keyState.release(Keys.DOWN);
    transitions.brake = undefined;
    car.controls.brake = 0;
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
  function press(keyName) {
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
    Object.keys(transitions).forEach(propertyName => {
      if (transitions[propertyName] !== undefined) {
        transitions[propertyName].update();
      }
    });
  }

  return { press, release, update };
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
 * - Buffers inputs to apply at frame boundaries for deterministic recording/playback
 * - Delegates to carController.press()/release()
 *
 * Usage:
 *   const keyboardController = createKeyboardController(keyConfig, carController);
 *   document.addEventListener('keydown', keyboardController.getKeyHandler());
 *   document.addEventListener('keyup', keyboardController.getKeyHandler());
 *   frameManager.addFrameListener(keyboardController.update); // Apply buffered inputs
 *
 * @param {Array} keyConfig - Array of {key: string, code: string} mappings
 *   key = logical action (UP/DOWN/LEFT/RIGHT)
 *   code = physical key code (KeyW, ArrowUp, etc.)
 *   Example: [{ key: "UP", code: "KeyW" }, { key: "LEFT", code: "KeyA" }]
 * @param {Object} carController - Car controller with pressed/release methods
 * @returns {{getKeyHandler: function, update: function}}
 */
export function createKeyboardController(keyConfig, carController) {
  const keysByCode = new Map(); // Map physical key code to key object
  const pressedBuffer = []; // Logical keys pressed this frame
  const releaseBuffer = []; // Logical keys released this frame

  function setupKeys() {
    // Reverse order ensures first key config takes priority if duplicates exist
    keyConfig
      .slice()
      .reverse()
      .forEach(config => {
        keysByCode.set(config.code, {
          logicalKey: config.key, // UP/DOWN/LEFT/RIGHT
          physicalCode: config.code, // KeyW, ArrowUp, etc.
          isPressed: false
        });
      });
  }

  function onKeyDown(keyMapping) {
    keyMapping.isPressed = true;
    pressedBuffer.push(keyMapping.logicalKey);
  }

  function onKeyUp(keyMapping) {
    keyMapping.isPressed = false;
    releaseBuffer.push(keyMapping.logicalKey);
  }

  function keyHandler(event) {
    const keyMapping = keysByCode.get(event.code);
    if (keyMapping === undefined) {
      return; // Ignore keys not in config
    }
    // Prevent duplicate events (browser may fire multiple keydown while held)
    if (event.type === 'keydown' && keyMapping.isPressed === false) {
      onKeyDown(keyMapping);
    }
    if (event.type === 'keyup' && keyMapping.isPressed === true) {
      onKeyUp(keyMapping);
    }
  }

  // Called each frame to apply buffered inputs
  function update() {
    // Apply all buffered inputs at frame boundary
    pressedBuffer.forEach(logicalKey => carController.press(logicalKey));
    releaseBuffer.forEach(logicalKey => carController.release(logicalKey));
    // Clear buffers after applying
    pressedBuffer.length = 0;
    releaseBuffer.length = 0;
  }

  setupKeys();

  return { getKeyHandler: () => keyHandler, update };
}

/**
 * Creates a recording decorator that wraps a car controller to capture inputs.
 *
 * Decorator pattern: wraps carController.press() and carController.release()
 * to record all input events while passing through to the wrapped controller.
 *
 * Recording export should be handled by the application layer (e.g., application.js)
 * by registering a callback on car.onLapComplete and calling getRecording().
 *
 * @param {Object} carController - Car controller to wrap
 * @returns {{press: function, release: function, update: function, getRecording: function}}
 */
export function createRecordingDecorator(carController) {
  const recording = {};

  function recordToggle(keyName) {
    const frameKey = model.frameNumber.toString();

    if (recording[frameKey] === undefined) {
      recording[frameKey] = [];
    }
    recording[frameKey].push(keyName);
  }

  function press(keyName) {
    recordToggle(keyName);
    carController.press(keyName);
  }

  function release(keyName) {
    recordToggle(keyName);
    carController.release(keyName);
  }

  function update() {
    // Call wrapped controller update
    carController.update();
  }

  function getRecording() {
    return recording;
  }

  return { press, release, update, getRecording };
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
 * @param {Object} carController - Car controller with press/release methods
 * @returns {{update: function}}
 */
export function createPlaybackController(recording, carController) {
  const keyStates = new Map(); // Track current state of each key

  // Called every frame by frameManager
  function update() {
    const frameKey = model.frameNumber.toString();

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
          carController.press(key);
          keyStates.set(key, true);
        }
      });
    }
  }

  return { update };
}
