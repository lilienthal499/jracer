import { createCarController, createKeyboardController, createPlaybackController, createRecordingDecorator } from './controller.js';
import { frameManager } from './framemanager.js';
import { model } from './model.js';
import { createPhysicsEngine } from './physicsengine.js';
import { createTrack } from './track.js';
import { MovingCar, StaticCar } from './view/car.js';
import { HeadUpDisplay } from './view/headupdisplay.js';
import { TireTracks } from './view/tiretracks.js';
import { Drawer } from './view/track.js';
import { MiniMap, MovingTrack, Screen, SplitScreen } from './view/view.js';

export function startup() {
  'use strict';

  // BROWSER DEPENDENCY: fetch API
  fetch('backend/config.json')
    .then(response => response.json())
    .then(config => {
      // BROWSER DEPENDENCY: fetch API
      fetch(`backend/tracks/${config.track.number}.json`)
        .then(response => response.json())
        .then(trackData => {
          // console.log(`Loaded track: ${trackData.name} (${trackData.description})`);

          const carControllers = initializeGame(config, trackData);
          attachInputSources(carControllers, config, frameManager);
          startGameUI(config, trackData);
        });
    });
}

// Testable: Initialize game logic without UI
export function initializeGame(config, trackData) {
  'use strict';

  const physicsEngine = createPhysicsEngine(model);
  physicsEngine.scheduleUpdates(frameManager);

  const track = createTrack(trackData.sections, trackData.gridSize, trackData.trackWidth);
  model.track = track.getModel();

  const carControllers = [];

  config.players.forEach(player => {
    const car = model.createCar();
    car.controls.maxSteeringAngle = player.maxSteeringAngle;
    car.position.x = model.track.startingPosition.x;
    car.position.y = model.track.startingPosition.y;
    car.segment = model.track.getSegmentAtPosition(car.position.x, car.position.y);

    model.cars.push(car);

    let carController = createCarController(car);

    // Wrap with recording decorator if player.record is true
    if (player.record === true) {
      carController = createRecordingDecorator(carController, car);
    }

    // NOTE: Don't register carController.update here yet - playback needs to run first
    carControllers.push(carController);

    physicsEngine.addCar(car);
  });

  return carControllers;
}

// Attach input sources to car controllers (keyboard, playback, AI, etc.)
export function attachInputSources(carControllers, config, frameManager) {
  config.players.forEach((player, index) => {
    const carController = carControllers[index];

    // Attach keyboard controller if controls defined
    if (player.controls !== undefined) {
      const keyboardController = createKeyboardController(player.controls, carController);
      // BROWSER DEPENDENCY: document.addEventListener (DOM events)
      document.addEventListener('keydown', keyboardController.getKeyHandler());
      document.addEventListener('keyup', keyboardController.getKeyHandler());
      // Register keyboard update to apply buffered inputs at frame boundaries
      frameManager.addFrameListener(keyboardController.update);
    }

    // Attach playback controller if recording defined
    if (player.recording !== undefined) {
      const playbackController = createPlaybackController(player.recording, carController);
      frameManager.addFrameListener(playbackController.update);
    }

    // Register carController update (processes delayed controllers)
    // Note: The order of registration doesn't affect the result because:
    // - Keyboard inputs are buffered until keyboardController.update() applies them
    // - Playback inputs are applied when playbackController.update() runs
    // - Both set the control state which carController.update() then processes
    // - The delayed controllers only START progressing after inputs are set,
    //   so they won't make progress until the NEXT frame regardless of order
    frameManager.addFrameListener(carController.update);
  });
}

// UI: Creates views and attaches to DOM
function startGameUI(config, trackData) {
  'use strict';

  const screens = [];

  function createScreenView(players, playerIndex) {
    const carViews = [];

    model.cars.forEach((car, index) => {
      if (index !== playerIndex) {
        carViews.push(MovingCar(players[index].view, car));
      }
    });
    const firstCar = model.cars[playerIndex];
    const firstCarView = StaticCar(players[playerIndex].view, firstCar);
    const headUpDisplayView = HeadUpDisplay({}, firstCar, playerIndex, model.track);

    // Create canvas for track and tire marks
    const trackCanvas = document.createElement('canvas');
    trackCanvas.width = model.track.dimensions.width;
    trackCanvas.height = model.track.dimensions.height;

    // Draw track on canvas
    Drawer(trackCanvas.getContext('2d'), model.track, config.track.showGrid);

    // Set up tire track rendering on same canvas
    const tireTracksView = TireTracks(trackCanvas, model.cars);
    frameManager.addSubFrameListener(tireTracksView.update);

    carViews.push(MovingCar(players[playerIndex].view, firstCar));
    const trackView = MovingTrack(trackData, firstCar, carViews, trackCanvas);
    return Screen(players[playerIndex].view, trackView, firstCarView, firstCar, headUpDisplayView);
  }

  screens.push(createScreenView(config.players, 0));
  screens.push(createScreenView(config.players, 1));

  const miniMap = MiniMap();

  const splitScreen = SplitScreen({}, screens, miniMap);
  // BROWSER DEPENDENCY: window.document.body (DOM manipulation)
  window.document.body.appendChild(splitScreen.getDOMElement());
  frameManager.addSubFrameListener(splitScreen.update);

  function createAndFocusDummyInput() {
    // BROWSER DEPENDENCY: window.document (DOM manipulation)
    const newDOMElement = window.document.createElement('input');
    newDOMElement.autofocus = true;
    newDOMElement.className = 'dummy';
    window.document.body.appendChild(newDOMElement);
  }
  createAndFocusDummyInput();

  // BROWSER DEPENDENCY: window.setTimeout
  window.setTimeout(frameManager.start, 1000);
}

/*
Optionen:
1 Spieler
n Spieler, Splitscreen
miniMap

 */
