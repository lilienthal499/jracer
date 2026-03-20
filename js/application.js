/* eslint-disable no-redeclare */
const jracer = {};
/* eslint-enable no-redeclare */

jracer.Vector = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    if (isNaN(this.x)) {
      this.x = 0;
    }
    if (isNaN(this.y)) {
      this.y = 0;
    }
  }

  copy() {
    return new jracer.Vector(this.x, this.y);
  }

  rotate(rotationAngle) {
    const tmpX = this.x;
    const tmpY = this.y;
    this.x = Math.cos(rotationAngle) * tmpX - Math.sin(rotationAngle) * tmpY;
    this.y = Math.sin(rotationAngle) * tmpX + Math.cos(rotationAngle) * tmpY;
  }

  copyFrom(otherVector) {
    this.x = otherVector.x;
    this.y = otherVector.y;
  }

  equals(otherVector) {
    return (this.x === otherVector.x && this.y === otherVector.y);
  }
};


jracer.startup = function (config) {
  'use strict';

  fetch(`tracks/${config.track.number}.json`)
    .then((response) => response.json())
    .then((trackData) => {
      config.track.sections = trackData.sections.map((sectionName) => {
        return jracer.Track[sectionName];
      });

      config.track.gridSize = trackData.gridSize;

      console.log(`Loaded track: ${trackData.name} (${trackData.description})`);

      startGame(config);
    });

  function startGame(cfg) {
    const screens = [];

    function setupPlayers(players) {

      players.forEach((player) => {

        const car = new jracer.model.Car();
        car.controls.maxSteeringAngle = player.maxSteeringAngle;
        //TODO
        car.position.x = jracer.model.track.startingPosition.x;
        car.position.y = jracer.model.track.startingPosition.y;

        jracer.model.cars.push(car);

        const carController = new jracer.controller.CarController(car);

        jracer.frameManager.addFrameListener(carController.update);

        const keyboardController = new jracer.controller.KeyboardController(player.controls, carController);

        document.addEventListener('keydown', keyboardController.getKeyHandler());
        document.addEventListener('keyup', keyboardController.getKeyHandler());

        jracer.physicsEngine.addCar(car);

      // if (index === 1) {
      // firstCar = car;
      // firstCarView = new jracer.view.StaticCar(player.view, car);
      // headUpDisplayView = new jracer.view.Tachometer({}, car);
      // } else {
      // carViews.push(new jracer.view.MovingCar(player.view, car));
      // }
      });
    }

    function createScreenView(players, playerIndex) {

      const carViews = [];

      jracer.model.cars.forEach((car, index) => {
        if (index !== playerIndex) {
          carViews.push(new jracer.view.MovingCar(players[index].view, car));
        }
      });
      const firstCar = jracer.model.cars[playerIndex];
      const firstCarView = new jracer.view.StaticCar(players[playerIndex].view, firstCar);
      const headUpDisplayView = new jracer.view.HeadUpDisplay({}, firstCar);

      const tireTracksView = new jracer.view.TireTracks({}, jracer.model.cars);
      jracer.frameManager.addSubFrameListener(tireTracksView.update);


      const trackDrawer = new jracer.Track.Drawer(tireTracksView.getCanvas(), jracer.model.track.sequenceOfComponents, jracer.model.track.gridSize);
      carViews.push(new jracer.view.MovingCar(players[playerIndex].view, firstCar));
      // trackView = new jracer.view.StaticTrack(jracer.config.track, carViews);
      const trackView = new jracer.view.MovingTrack(jracer.config.track, firstCar, carViews, tireTracksView);
      return new jracer.view.Screen(players[playerIndex].view, trackView, firstCarView, firstCar, headUpDisplayView);
    }

    jracer.physicsEngine = new jracer.PhysicsEngine(jracer.model);
    jracer.physicsEngine.scheduleUpdates(jracer.frameManager);

    const track = new jracer.Track(config.track.sections, config.track.gridSize);

    jracer.model.track = track.getModel();


    setupPlayers(config.players);

    screens.push(createScreenView(config.players, 0));
    screens.push(createScreenView(config.players, 1));

    const miniMap = new jracer.view.MiniMap();

    const splitScreen = new jracer.view.SplitScreen({}, screens, miniMap);
    window.document.body.appendChild(splitScreen.getDOMElement());
    jracer.frameManager.addSubFrameListener(splitScreen.update);
    // screenView2 = new jracer.view.Screen(jracer.config.screen, trackView, firstCarView, headUpDisplayView);

    function createAndFocusDummyInput() {
      const newDOMElement = window.document.createElement('input');
      newDOMElement.autofocus = true;
      newDOMElement.className = 'dummy';
      window.document.body.appendChild(newDOMElement);
    }
    createAndFocusDummyInput();

    window.setTimeout(jracer.frameManager.start, 1000);
  }
};

/*
Optionen:
1 Spieler
n Spieler, Splitscreen
miniMap

 */
