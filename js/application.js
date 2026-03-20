/* eslint-disable no-redeclare */
var jracer = {};
/* eslint-enable no-redeclare */

jracer.Vector = function (x, y) {
  'use strict';

  var me = this;
  this.x = x;
  this.y = y;
  if (isNaN(this.x)) {
    this.x = 0;
  }
  if (isNaN(this.y)) {
    this.y = 0;
  }

  this.copy = function () {
    return new jracer.Vector(me.x, me.y);
  };

  this.rotate = function (rotationAngle) {
    var tmpX = me.x, tmpY = me.y;
    me.x = Math.cos(rotationAngle) * tmpX - Math.sin(rotationAngle) * tmpY;
    me.y = Math.sin(rotationAngle) * tmpX + Math.cos(rotationAngle) * tmpY;
  };

  this.copyFrom = function (otherVector) {
    this.x = otherVector.x;
    this.y = otherVector.y;
  };

  this.equals = function (otherVector) {
    return (this.x === otherVector.x && this.y === otherVector.y);
  };
};


jracer.startup = function (config) {
  'use strict';

  var screens = [], splitScreen, track, miniMap;

  function setupPlayers(players) {

    var index, car, player, carController, keyboardController;
    for (index = 0; index < players.length; index += 1) {

      player = players[index];

      car = new jracer.model.Car();
      car.controls.maxSteeringAngle = player.maxSteeringAngle;
      //TODO
      car.position.x = jracer.model.track.startingPosition.x;
      car.position.y = jracer.model.track.startingPosition.y;

      jracer.model.cars.push(car);

      carController = new jracer.controller.CarController(car);

      jracer.frameManager.addFrameListener(carController.update);

      keyboardController = new jracer.controller.KeyboardController(player.controls, carController);

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
    }
  }

  function createScreenView(players, playerIndex) {

    var index, trackView, carViews = [], firstCarView, firstCar, tireTracksView, headUpDisplayView, trackDrawer;

    for (index = 0; index < jracer.model.cars.length; index += 1) {
      if (index !== playerIndex) {
        carViews.push(new jracer.view.MovingCar(players[index].view, jracer.model.cars[index]));
      }
    }
    firstCar = jracer.model.cars[playerIndex];
    firstCarView = new jracer.view.StaticCar(players[playerIndex].view, firstCar);
    headUpDisplayView = new jracer.view.HeadUpDisplay({}, firstCar);

    tireTracksView = new jracer.view.TireTracks({}, jracer.model.cars);
    jracer.frameManager.addSubFrameListener(tireTracksView.update);


    trackDrawer = new jracer.Track.Drawer(tireTracksView.getCanvas(), jracer.model.track.sequenceOfComponents, jracer.model.track.gridSize);
    carViews.push(new jracer.view.MovingCar(players[playerIndex].view, firstCar));
    // trackView = new jracer.view.StaticTrack(jracer.config.track, carViews);
    trackView = new jracer.view.MovingTrack(jracer.config.track, firstCar, carViews, tireTracksView);
    return new jracer.view.Screen(players[playerIndex].view, trackView, firstCarView, firstCar, headUpDisplayView);
  }

  jracer.physicsEngine = new jracer.PhysicsEngine(jracer.model);
  jracer.physicsEngine.sheduleUpdates(jracer.frameManager);

  track = new jracer.Track(config.track.sections, config.track.gridSize);

  jracer.model.track = track.getModel();


  setupPlayers(config.players);

  screens.push(createScreenView(config.players, 0));
  screens.push(createScreenView(config.players, 1));

  miniMap = new jracer.view.MiniMap();

  splitScreen = new jracer.view.SplitScreen({}, screens, miniMap);
  window.document.body.appendChild(splitScreen.getDOMElement());
  jracer.frameManager.addSubFrameListener(splitScreen.update);
  // screenView2 = new jracer.view.Screen(jracer.config.screen, trackView, firstCarView, headUpDisplayView);

  function createAndFocusDummyInput() {
    var newDOMElement = window.document.createElement('input');
    newDOMElement.autofocus = true;
    newDOMElement.className = 'dummy';
    window.document.body.appendChild(newDOMElement);
  }
  createAndFocusDummyInput();

  window.setTimeout(jracer.frameManager.start, 1000);

};

/*
Optionen:
1 Spieler
n Spieler, Splitscreen
miniMap

 */
