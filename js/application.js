import { model } from './model.js';
import { frameManager } from './framemanager.js';
import { createCarController, createKeyboardController } from './controller.js';
import { createPhysicsEngine } from './physicsengine.js';
import { createTrack } from './track.js';
import { Drawer } from './view/track.js';
import { MovingCar, StaticCar } from './view/car.js';
import {
  HeadUpDisplay,
  TireTracks,
  MovingTrack,
  Screen,
  SplitScreen,
  MiniMap
} from './view/view.js';

export function startup() {
  'use strict';

  fetch('backend/config.json')
    .then(response => response.json())
    .then(config => {
      fetch(`backend/tracks/${config.track.number}.json`)
        .then(response => response.json())
        .then(trackData => {
          config.track.sections = trackData.sections;

          console.log(`Loaded track: ${trackData.name} (${trackData.description})`);

          const carControllers = initializeGame(config);
          attachKeyboardControls(carControllers, config);
          startGameUI(config);
        });
    });
}

// Testable: Initialize game logic without UI
export function initializeGame(config) {
  'use strict';

  const physicsEngine = createPhysicsEngine(model);
  physicsEngine.scheduleUpdates(frameManager);

  const track = createTrack(
    config.track.sections,
    config.track.gridSize,
    config.track.trackWidth
  );
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
    const keyboardController = createKeyboardController(
      player.controls,
      carControllers[index]
    );

    document.addEventListener('keydown', keyboardController.getKeyHandler());
    document.addEventListener('keyup', keyboardController.getKeyHandler());
  });
}

// UI: Creates views and attaches to DOM
function startGameUI(config) {
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
    const headUpDisplayView = HeadUpDisplay({}, firstCar);

    const tireTracksView = TireTracks({}, model.cars);
    frameManager.addSubFrameListener(tireTracksView.update);

    Drawer(
      tireTracksView.getCanvas(),
      model.track,
      config.track.showGrid
    );
    carViews.push(MovingCar(players[playerIndex].view, firstCar));
    const trackView = MovingTrack(
      config.track,
      firstCar,
      carViews,
      tireTracksView
    );
    return Screen(
      players[playerIndex].view,
      trackView,
      firstCarView,
      firstCar,
      headUpDisplayView
    );
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
