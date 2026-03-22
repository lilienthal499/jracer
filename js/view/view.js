import { Vector } from '../vector.js';
import { model } from '../model.js';

'use strict';

export function createDOMProxy(style, property) {
  let oldValue = null;

  function set(value) {
    if (value !== oldValue) {
      style[property] = value;
      oldValue = value;
    }
  }

  return { set };
}

export function SplitScreen(viewConfig, screenViews, minimapView) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'splitScreen';

  DOMElement.appendChild(minimapView.getDOMElement());
  screenViews.forEach((view) => {
    DOMElement.appendChild(view.getDOMElement());
  });

  function update(frameProgress) {
    screenViews.forEach((view) => {
      view.update(frameProgress);
    });
  }

  function getDOMElement() {
    return DOMElement;
  }

  return { update, getDOMElement };
}

function createAverageCalculator(initialValue, numberOfValues) {
  const values = [];
  let sum = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (let index = 0; index < numberOfValues; index += 1) {
    values.push(initialValue);
    sum += initialValue;
  }

  function add(value) {
    values.unshift(value);
    sum += value;
    sum -= values.pop();
  }

  function getAverage() {
    return sum / numberOfValues;
  }

  return { add, getAverage };
}

export function Screen(viewConfig, trackView, carView, carModel, tachometerView) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'screen';

  const centralPixelDOMElement = document.createElement('div');
  centralPixelDOMElement.className = 'centralPixel';

  DOMElement.appendChild(centralPixelDOMElement);
  DOMElement.appendChild(tachometerView.getDOMElement());
  centralPixelDOMElement.appendChild(trackView.getDOMElement());

  const rotateAndZoom = viewConfig.rotateAndZoom ? createRotateAndZoom() : null;

  function createRotateAndZoom() {
    let averageScaleCalculator;
    let averageRotateCalculator;

    const transform = createDOMProxy(centralPixelDOMElement.style, 'transform');

    function calculateRotate(carDirection) {
      if (!averageRotateCalculator) {
        averageRotateCalculator = createAverageCalculator(carDirection, 100);
      }

      averageRotateCalculator.add(carDirection);
      carDirection = Math.round(averageRotateCalculator.getAverage() * 1000) / 1000;
      return `rotate(${carDirection}rad)`;
    }

    function calculateScale(velocity) {
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
        averageScaleCalculator = createAverageCalculator(targetZoomFactor, 100);
      }

      averageScaleCalculator.add(targetZoomFactor);
      targetZoomFactor = Math.round(averageScaleCalculator.getAverage() * 1000) / 1000;
      return `scale(${targetZoomFactor})`;
    }

    return function () {
      transform.set(`${calculateRotate(-carModel.direction)} ${calculateScale(carModel.velocity.forward + Math.abs(carModel.velocity.lateral))}`);
    };
  }

  function update(frameProgress) {
    if (rotateAndZoom) {
      rotateAndZoom();
    }

    trackView.update();
    if (carView) {
      carView.update();
    }
    tachometerView.update();
  }

  function getDOMElement() {
    return DOMElement;
  }

  update();

  return { update, getDOMElement };
}

function createTrack(carViews) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'track';

  function addCarViews() {
    carViews.forEach((view) => {
      DOMElement.appendChild(view.getDOMElement());
    });
  }

  function update() {
    carViews.forEach((view) => {
      view.update();
    });
  }

  function getDOMElement() {
    return DOMElement;
  }

  return { addCarViews, update, getDOMElement };
}

export function MovingTrack(viewConfig, carModel, carViews, tireTracksView) {
  const track = createTrack(carViews);
  const originalOffset = new Vector(0, 0);
  const rotatedOffset = new Vector();

  const left = createDOMProxy(track.getDOMElement().style, 'left');
  const bottom = createDOMProxy(track.getDOMElement().style, 'bottom');

  track.getDOMElement().appendChild(tireTracksView.getDOMElement());
  track.addCarViews();

  function update() {
    track.update();
    rotatedOffset.copyFrom(originalOffset);
    rotatedOffset.rotate(-carModel.direction);
    left.set(`${-Math.round(carModel.position.x + rotatedOffset.x)}px`);
    bottom.set(`${-Math.round(carModel.position.y + rotatedOffset.y)}px`);
  }

  update();

  return { update, getDOMElement: track.getDOMElement };
}

function createCarTireTracks(carModel, canvas) {
  const drawers = [];

  function createDrawer(offset, alphaSource1, alphaSource2) {
    const startPosition = new Vector();
    const endPosition = new Vector();
    const rotatedOffset = new Vector();

    return function () {
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

  function calculateGlobalAlpha(velocity) {
    let globalAlpha = Math.abs(velocity) / 1000;
    globalAlpha = globalAlpha > 1 ? 1 : globalAlpha;
    return globalAlpha;
  }

  function calculateFrontGlobalAlpha() {
    return 0;//TODO
  }

  function calculateBackGlobalAlpha() {
    return 0;//TODO
  }

  function calculateLeftGlobalAlpha() {
    let globalAlpha;
    globalAlpha = calculateGlobalAlpha(carModel.velocity.lateral);
    globalAlpha *= carModel.velocity.lateral > 0 ? 2 : 1;
    globalAlpha = globalAlpha > 0.5 ? 0.5 : globalAlpha;
    return globalAlpha;
  }

  function calculateRightGlobalAlpha() {
    let globalAlpha;
    globalAlpha = calculateGlobalAlpha(carModel.velocity.lateral);
    globalAlpha *= carModel.velocity.lateral < 0 ? 2 : 1;
    globalAlpha = globalAlpha > 0.5 ? 0.5 : globalAlpha;
    return globalAlpha;
  }

  function setUpCanvasDrawers() {
    const { wheelbase, trackWidth } = carModel.dimensions;
    const frontRightOffset = new Vector(trackWidth / 2, wheelbase / 2);

    const frontLeftOffset = frontRightOffset.copy();
    frontRightOffset.x = -frontRightOffset.x;

    const backRightOffset = frontRightOffset.copy();
    backRightOffset.y = -backRightOffset.y;

    const backLeftOffset = backRightOffset.copy();
    backLeftOffset.x = -backLeftOffset.x;

    drawers.push(createDrawer(frontRightOffset, calculateFrontGlobalAlpha, calculateRightGlobalAlpha));
    drawers.push(createDrawer(backRightOffset, calculateBackGlobalAlpha, calculateRightGlobalAlpha));
    drawers.push(createDrawer(backLeftOffset, calculateBackGlobalAlpha, calculateLeftGlobalAlpha));
    drawers.push(createDrawer(frontLeftOffset, calculateFrontGlobalAlpha, calculateLeftGlobalAlpha));
  }

  setUpCanvasDrawers();
  canvas.lineCap = 'butt';

  function update() {
    drawers[0]();
    drawers[1]();
    drawers[2]();
    drawers[3]();
  }

  return { update };
}

export function TireTracks(viewConfig, carModels) {
  const carTireTracks = [];

  const DOMElement = document.createElement('canvas');
  DOMElement.className = 'tireTracks';
  DOMElement.width = model.track.dimensions.width;
  DOMElement.height = model.track.dimensions.height;

  const canvasContext = DOMElement.getContext('2d');

  carModels.forEach((carModel) => {
    carTireTracks.push(createCarTireTracks(carModel, canvasContext));
  });

  function getDOMElement() {
    return DOMElement;
  }

  function update() {
    carTireTracks.slice().reverse().forEach((track) => {
      track.update();
    });
  }

  function getCanvas() {
    return canvasContext;
  }

  return { getDOMElement, update, getCanvas };
}

export function HeadUpDisplay(viewConfig, carModel) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'headupdisplay';

  let label;

  label = document.createElement('label');
  label.appendChild(document.createTextNode('像素/秒'));
  DOMElement.appendChild(label);
  const speed = document.createElement('span');
  DOMElement.appendChild(speed);

  label = document.createElement('label');
  label.appendChild(document.createTextNode('轮'));
  DOMElement.appendChild(label);
  const round = document.createElement('span');
  DOMElement.appendChild(round);

  label = document.createElement('label');
  label.appendChild(document.createTextNode('Zeit'));
  DOMElement.appendChild(label);
  const lastTime = document.createElement('span');
  DOMElement.appendChild(lastTime);

  function getDOMElement() {
    return DOMElement;
  }

  function update() {
    speed.textContent = Math.round(carModel.velocity.forward);
    round.textContent = carModel.round;
    lastTime.textContent = carModel.roundTimes[carModel.roundTimes.length - 1];
  }

  update();

  return { getDOMElement, update };
}

export function MiniMap(viewConfig) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'miniMap';

  function getDOMElement() {
    return DOMElement;
  }

  return { getDOMElement };
}
