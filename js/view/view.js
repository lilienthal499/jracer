import { Vector } from '../vector.js';
import { model } from '../model.js';

('use strict');

export function createCachedStyleSetter(style, property) {
  let oldValue = null;

  function set(value) {
    if (value !== oldValue) {
      style[property] = value;
      oldValue = value;
    }
  }

  return { set };
}

export function createCachedTextSetter(element) {
  let oldValue = null;

  function set(value) {
    if (value !== oldValue) {
      element.textContent = value;
      oldValue = value;
    }
  }

  return { set };
}

export function SplitScreen(viewConfig, screenViews, minimapView) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'splitScreen';

  DOMElement.appendChild(minimapView.getDOMElement());
  screenViews.forEach(view => {
    DOMElement.appendChild(view.getDOMElement());
  });

  function update(frameProgress) {
    screenViews.forEach(view => {
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

    const transform = createCachedStyleSetter(centralPixelDOMElement.style, 'transform');

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

      let targetZoomFactor = 1 - velocity / 800;
      targetZoomFactor = Math.max(MAX_ZOOM_FACTOR, Math.min(MIN_ZOOM_FACTOR, targetZoomFactor));

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
    carViews.forEach(view => {
      DOMElement.appendChild(view.getDOMElement());
    });
  }

  function update() {
    carViews.forEach(view => {
      view.update();
    });
  }

  function getDOMElement() {
    return DOMElement;
  }

  return { addCarViews, update, getDOMElement };
}

export function MovingTrack(viewConfig, carModel, carViews, trackCanvas) {
  const track = createTrack(carViews);
  const originalOffset = new Vector(0, 0);
  const rotatedOffset = new Vector();

  const left = createCachedStyleSetter(track.getDOMElement().style, 'left');
  const bottom = createCachedStyleSetter(track.getDOMElement().style, 'bottom');

  track.getDOMElement().appendChild(trackCanvas);
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

export function MiniMap(viewConfig) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'miniMap';

  function getDOMElement() {
    return DOMElement;
  }

  return { getDOMElement };
}
