jracer.view = {};

jracer.view.DOMProxy = class {
  constructor(style, property) {
    this.style = style;
    this.property = property;
    this.oldValue = null;
  }

  set(value) {
    if (value !== this.oldValue) {
      this.style[this.property] = value;
      this.oldValue = value;
    }
  }
};

jracer.view.SplitScreen = class {
  constructor(viewConfig, screenViews, minimapView) {
    this.screenViews = screenViews;
    this.DOMElement = this.createDOMElement();
    this.DOMElement.appendChild(minimapView.getDOMElement());
    screenViews.forEach((view) => {
      this.DOMElement.appendChild(view.getDOMElement());
    });
  }

  createDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'splitScreen';
    return newDOMElement;
  }

  update(frameProgress) {
    this.screenViews.forEach((view) => {
      view.update(frameProgress);
    });
  }

  getDOMElement() {
    return this.DOMElement;
  }
};

class AverageCalculator {
  constructor(initialValue, numberOfValues) {
    this.values = [];
    this.sum = 0;
    this.numberOfValues = numberOfValues;

    // eslint-disable-next-line no-restricted-syntax
    for (let index = 0; index < numberOfValues; index += 1) {
      this.values.push(initialValue);
      this.sum += initialValue;
    }
  }

  add(value) {
    this.values.unshift(value);
    this.sum += value;
    this.sum -= this.values.pop();
  }

  getAverage() {
    return this.sum / this.numberOfValues;
  }
}

jracer.view.Screen = class {
  constructor(viewConfig, trackView, carView, carModel, tachometerView) {
    this.viewConfig = viewConfig;
    this.trackView = trackView;
    this.carView = carView;
    this.carModel = carModel;
    this.tachometerView = tachometerView;

    this.DOMElement = this.createDOMElement();
    this.centralPixelDOMElement = this.createCentralPixelDOMElement();

    this.DOMElement.appendChild(this.centralPixelDOMElement);
    this.DOMElement.appendChild(tachometerView.getDOMElement());

    this.centralPixelDOMElement.appendChild(trackView.getDOMElement());

    this.rotateAndZoom = viewConfig.rotateAndZoom ? this.createRotateAndZoom() : null;

    this.update();
  }

  createDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'screen';
    return newDOMElement;
  }

  createCentralPixelDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'centralPixel';
    return newDOMElement;
  }

  createRotateAndZoom() {
    let averageScaleCalculator;
    let averageRotateCalculator;

    const transform = new jracer.view.DOMProxy(this.centralPixelDOMElement.style, 'transform');
    const carModel = this.carModel;

    const calculateRotate = (carDirection) => {
      if (!averageRotateCalculator) {
        averageRotateCalculator = new AverageCalculator(carDirection, 100);
      }

      averageRotateCalculator.add(carDirection);
      carDirection = Math.round(averageRotateCalculator.getAverage() * 1000) / 1000;
      return `rotate(${carDirection}rad)`;
    };

    const calculateScale = (velocity) => {
      const MAX_ZOOM_FACTOR = 0.7;
      const MIN_ZOOM_FACTOR = 1;
      let targetZoomFactor;

      targetZoomFactor = 1 - velocity / 800;

      if (targetZoomFactor < MAX_ZOOM_FACTOR) {
        targetZoomFactor = MAX_ZOOM_FACTOR;
      }

      if (targetZoomFactor > MIN_ZOOM_FACTOR) {
        targetZoomFactor = MIN_ZOOM_FACTOR;
      }

      if (!averageScaleCalculator) {
        averageScaleCalculator = new AverageCalculator(targetZoomFactor, 100);
      }

      averageScaleCalculator.add(targetZoomFactor);
      targetZoomFactor = Math.round(averageScaleCalculator.getAverage() * 1000) / 1000;
      return `scale(${targetZoomFactor})`;
    };

    return () => {
      transform.set(`${calculateRotate(-carModel.direction)} ${calculateScale(carModel.velocity.forward + Math.abs(carModel.velocity.lateral))}`);
    };
  }

  update(frameProgress) {
    if (this.rotateAndZoom) {
      this.rotateAndZoom();
    }

    this.trackView.update();
    if (this.carView) {
      this.carView.update();
    }
    this.tachometerView.update();
  }

  getDOMElement() {
    return this.DOMElement;
  }
};

jracer.view.Track = class {
  constructor(viewConfig, carViews) {
    this.carViews = carViews;
    this.DOMElement = this.createDOMElement();
  }

  createDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'track';
    return newDOMElement;
  }

  addCarViews() {
    this.carViews.forEach((view) => {
      this.DOMElement.appendChild(view.getDOMElement());
    });
  }

  update() {
    this.carViews.forEach((view) => {
      view.update();
    });
  }

  getDOMElement() {
    return this.DOMElement;
  }
};

jracer.view.StaticTrack = class extends jracer.view.Track {
  constructor(viewConfig, carViews) {
    super(viewConfig, carViews);
    this.addCarViews();
    this.getDOMElement().style.left = `${-Math.round(jracer.config.track.startposition.x)}px`;
    this.getDOMElement().style.bottom = `${-Math.round(jracer.config.track.startposition.y)}px`;
  }
};

jracer.view.MovingTrack = class extends jracer.view.Track {
  constructor(viewConfig, carModel, carViews, tireTracksView) {
    super(viewConfig, carViews);

    this.carModel = carModel;
    this.originalOffset = new jracer.Vector(0, 0);
    this.rotatedOffset = new jracer.Vector();

    this.left = new jracer.view.DOMProxy(this.getDOMElement().style, 'left');
    this.bottom = new jracer.view.DOMProxy(this.getDOMElement().style, 'bottom');

    this.getDOMElement().appendChild(tireTracksView.getDOMElement());
    this.addCarViews();

    this.update();
  }

  update() {
    super.update();
    this.rotatedOffset.copyFrom(this.originalOffset);
    this.rotatedOffset.rotate(-this.carModel.direction);
    this.left.set(`${-Math.round(this.carModel.position.x + this.rotatedOffset.x)}px`);
    this.bottom.set(`${-Math.round(this.carModel.position.y + this.rotatedOffset.y)}px`);
  }
};

class CarTireTracks {
  constructor(carModel, canvas) {
    this.carModel = carModel;
    this.canvas = canvas;
    this.drawers = [];
    this.setUpCanvasDrawers();
    canvas.lineCap = 'butt';
  }

  createDrawer(offset, alphaSource1, alphaSource2) {
    const startPosition = new jracer.Vector();
    const endPosition = new jracer.Vector();
    const rotatedOffset = new jracer.Vector();
    const carModel = this.carModel;
    const canvas = this.canvas;

    return () => {
      const globalAlpha = alphaSource1() + alphaSource2();

      startPosition.copyFrom(endPosition);

      rotatedOffset.copyFrom(offset);
      rotatedOffset.rotate(-carModel.direction);

      endPosition.x = carModel.position.x + rotatedOffset.x;
      endPosition.y = carModel.position.y + rotatedOffset.y;

      if (!startPosition.equals(endPosition)) {
        if (globalAlpha > 0.01) {
          canvas.beginPath();
          canvas.moveTo(startPosition.x, startPosition.y);
          canvas.lineTo(endPosition.x, endPosition.y);

          canvas.lineWidth = 3;
          canvas.globalAlpha = globalAlpha;
          canvas.strokeStyle = 'rgb(0,0,0)';
          canvas.globalCompositeOperation = 'source-atop';
          canvas.stroke();
          canvas.globalAlpha = globalAlpha * 0.9;
          canvas.strokeStyle = 'rgb(0,100,0)';
          canvas.globalCompositeOperation = 'destination-over';
          canvas.stroke();
        }
      }
    };
  }

  calculateGlobalAlpha(velocity) {
    let globalAlpha = Math.abs(velocity) / 1000;
    globalAlpha = globalAlpha > 1 ? 1 : globalAlpha;
    return globalAlpha;
  }

  calculateFrontGlobalAlpha() {
    return 0;//TODO
  }

  calculateBackGlobalAlpha() {
    return 0;//TODO
  }

  calculateLeftGlobalAlpha() {
    let globalAlpha;
    globalAlpha = this.calculateGlobalAlpha(this.carModel.velocity.lateral);
    globalAlpha *= this.carModel.velocity.lateral > 0 ? 2 : 1;
    globalAlpha = globalAlpha > 0.5 ? 0.5 : globalAlpha;
    return globalAlpha;
  }

  calculateRightGlobalAlpha() {
    let globalAlpha;
    globalAlpha = this.calculateGlobalAlpha(this.carModel.velocity.lateral);
    globalAlpha *= this.carModel.velocity.lateral < 0 ? 2 : 1;
    globalAlpha = globalAlpha > 0.5 ? 0.5 : globalAlpha;
    return globalAlpha;
  }

  setUpCanvasDrawers() {
    const { wheelbase, trackWidth } = this.carModel.dimensions;
    const frontRightOffset = new jracer.Vector(trackWidth / 2, wheelbase / 2);

    const frontLeftOffset = frontRightOffset.copy();
    frontRightOffset.x = -frontRightOffset.x;

    const backRightOffset = frontRightOffset.copy();
    backRightOffset.y = -backRightOffset.y;

    const backLeftOffset = backRightOffset.copy();
    backLeftOffset.x = -backLeftOffset.x;

    this.drawers.push(this.createDrawer(frontRightOffset, () => this.calculateFrontGlobalAlpha(), () => this.calculateRightGlobalAlpha()));
    this.drawers.push(this.createDrawer(backRightOffset, () => this.calculateBackGlobalAlpha(), () => this.calculateRightGlobalAlpha()));
    this.drawers.push(this.createDrawer(backLeftOffset, () => this.calculateBackGlobalAlpha(), () => this.calculateLeftGlobalAlpha()));
    this.drawers.push(this.createDrawer(frontLeftOffset, () => this.calculateFrontGlobalAlpha(), () => this.calculateLeftGlobalAlpha()));
  }

  update() {
    this.drawers[0]();
    this.drawers[1]();
    this.drawers[2]();
    this.drawers[3]();
  }
}

jracer.view.TireTracks = class {
  constructor(viewConfig, carModels) {
    this.carTireTracks = [];
    this.DOMElement = this.createDOMElement();
    this.canvasContext = this.DOMElement.getContext('2d');
    this.createCarTireTracks(carModels);
  }

  createDOMElement() {
    const newDOMElement = window.document.createElement('canvas');
    newDOMElement.className = 'tireTracks';
    newDOMElement.width = jracer.model.track.dimensions.width;
    newDOMElement.height = jracer.model.track.dimensions.height;
    return newDOMElement;
  }

  createCarTireTracks(carModels) {
    carModels.forEach((carModel) => {
      this.carTireTracks.push(new CarTireTracks(carModel, this.canvasContext));
    });
  }

  getDOMElement() {
    return this.DOMElement;
  }

  update() {
    this.carTireTracks.slice().reverse().forEach((track) => {
      track.update();
    });
  }

  getCanvas() {
    return this.canvasContext;
  }
};

jracer.view.HeadUpDisplay = class {
  constructor(viewConfig, carModel) {
    this.carModel = carModel;
    this.speed = null;
    this.round = null;
    this.lastTime = null;
    this.DOMElement = this.createDOMElement();
    this.update();
  }

  createDOMElement() {
    let label;
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'headupdisplay';

    label = window.document.createElement('label');
    label.appendChild(window.document.createTextNode('像素/秒'));
    newDOMElement.appendChild(label);
    this.speed = window.document.createElement('span');
    newDOMElement.appendChild(this.speed);

    label = window.document.createElement('label');
    label.appendChild(window.document.createTextNode('轮'));
    newDOMElement.appendChild(label);
    this.round = window.document.createElement('span');
    newDOMElement.appendChild(this.round);

    label = window.document.createElement('label');
    label.appendChild(window.document.createTextNode('Zeit'));
    newDOMElement.appendChild(label);
    this.lastTime = window.document.createElement('span');
    newDOMElement.appendChild(this.lastTime);

    return newDOMElement;
  }

  getDOMElement() {
    return this.DOMElement;
  }

  update() {
    this.speed.textContent = Math.round(this.carModel.velocity.forward);
    this.round.textContent = this.carModel.round;
    this.lastTime.textContent = this.carModel.roundTimes[this.carModel.roundTimes.length - 1];
  }
};

jracer.view.MiniMap = class {
  constructor(viewConfig) {
    this.DOMElement = this.createDOMElement();
  }

  createDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'miniMap';
    return newDOMElement;
  }

  getDOMElement() {
    return this.DOMElement;
  }
};
