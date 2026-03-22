(function () {
  'use strict';

  const carDrawers = {
    default(ctx, width, length, color) {
      drawBody(ctx, width, length, color);
      drawWindshield(ctx, width, 6, 8);
      drawRearWindow(ctx, width, length, 8);
      drawHeadlights(ctx, width);
      drawTaillights(ctx, width, length);
      drawSideMirrors(ctx, width, length);
    }
  };

  function drawBody(ctx, width, length, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, length);
  }

  function drawWindshield(ctx, width, offsetTop, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(2, offsetTop, width - 4, height);
  }

  function drawRearWindow(ctx, width, length, height) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(2, length - 14, width - 4, height);
  }

  function drawHeadlights(ctx, width) {
    ctx.fillStyle = 'white';
    ctx.fillRect(1, 1, 4, 4);
    ctx.fillRect(width - 5, 1, 4, 4);
  }

  function drawTaillights(ctx, width, length) {
    ctx.fillStyle = 'red';
    ctx.fillRect(1, length - 5, 4, 4);
    ctx.fillRect(width - 5, length - 5, 4, 4);
  }

  function drawSideMirrors(ctx, width, length) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-1, length / 2 - 2, 2, 4);
    ctx.fillRect(width - 1, length / 2 - 2, 2, 4);
  }

  function calculateTransform(direction) {
    direction = direction % (2 * Math.PI);
    direction = Math.round(direction * 1000) / 1000;
    return `rotate(${direction}rad)`;
  }

  function createCarDOMElement(carModel, viewConfig) {
    const newDOMElement = window.document.createElement('canvas');
    newDOMElement.className = 'car';
    const { width, length } = carModel.dimensions;
    newDOMElement.width = width;
    newDOMElement.height = length;
    newDOMElement.style.width = `${width}px`;
    newDOMElement.style.height = `${length}px`;
    newDOMElement.style.marginLeft = `-${width / 2}px`;
    newDOMElement.style.marginBottom = `-${width / 2}px`;

    const carType = viewConfig.carType || 'default';
    const drawFunction = carDrawers[carType] || carDrawers.default;
    drawFunction(newDOMElement.getContext('2d'), width, length, viewConfig.color);

    return newDOMElement;
  }

  function createCar(viewConfig, carModel) {
    const DOMElement = createCarDOMElement(carModel, viewConfig);
    const transform = jracer.view.DOMProxy(DOMElement.style, 'transform');

    function update() {
      transform.set(calculateTransform(carModel.direction));
    }

    function getDOMElement() {
      return DOMElement;
    }

    return { update, getDOMElement };
  }

  jracer.view.Car = createCar;

  function createStaticCar(viewConfig, carModel) {
    return createCar(viewConfig, carModel);
  }

  jracer.view.StaticCar = createStaticCar;

  function createMovingCar(viewConfig, carModel) {
    const car = createCar(viewConfig, carModel);
    const left = jracer.view.DOMProxy(car.getDOMElement().style, 'left');
    const bottom = jracer.view.DOMProxy(car.getDOMElement().style, 'bottom');

    function update(frameProgress) {
      car.update(frameProgress);
      left.set(`${Math.round(carModel.position.x)}px`);
      bottom.set(`${Math.round(carModel.position.y)}px`);
    }

    return { update, getDOMElement: car.getDOMElement };
  }

  jracer.view.MovingCar = createMovingCar;

})();
