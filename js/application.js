import { model } from './model.js';
import { frameManager } from './framemanager.js';
import { createCarController, createKeyboardController } from './controller.js';
import { createPhysicsEngine } from './physicsengine.js';
import { createTrack } from './track.js';
import { Drawer } from './view/track.js';
import { MovingCar, StaticCar } from './view/car.js';
import { TireTracks } from './view/tiretracks.js';
import { HeadUpDisplay } from './view/headupdisplay.js';
import { MovingTrack, Screen, SplitScreen, MiniMap } from './view/view.js';

export function startup() {
  'use strict';

  fetch('backend/config.json')
    .then(response => response.json())
    .then(config => {
      fetch(`backend/tracks/${config.track.number}.json`)
        .then(response => response.json())
        .then(trackData => {
          console.log(`Loaded track: ${trackData.name} (${trackData.description})`);

          const carControllers = initializeGame(config, trackData);
          attachKeyboardControls(carControllers, config);
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

    model.cars.push(car);

    const carController = createCarController(car);
    frameManager.addFrameListener(carController.update);
    carControllers.push(carController);

    physicsEngine.addCar(car);
  });

  return carControllers;
}

// Attach keyboard input to car controllers
export function attachKeyboardControls(carControllers, config) {
  config.players.forEach((player, index) => {
    const keyboardController = createKeyboardController(player.controls, carControllers[index]);

    document.addEventListener('keydown', keyboardController.getKeyHandler());
    document.addEventListener('keyup', keyboardController.getKeyHandler());
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
    const headUpDisplayView = HeadUpDisplay({}, firstCar, playerIndex);

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
  window.document.body.appendChild(splitScreen.getDOMElement());
  frameManager.addSubFrameListener(splitScreen.update);

  function createAndFocusDummyInput() {
    const newDOMElement = window.document.createElement('input');
    newDOMElement.autofocus = true;
    newDOMElement.className = 'dummy';
    window.document.body.appendChild(newDOMElement);
  }
  createAndFocusDummyInput();

  window.setTimeout(frameManager.start, 1000);
}

/*
Optionen:
1 Spieler
n Spieler, Splitscreen
miniMap

 */
