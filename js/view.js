jracer.view = {};

jracer.view.DOMProxy = function (style, property) {
  'use strict';
  let oldValue;

  this.set = function (value) {
    if (value !== oldValue) {
      style[property] = value;
      oldValue = value;
    }
  };

};

jracer.view.SplitScreen = function (viewConfig, screenViews, minimapView) {
  'use strict';

  function createDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'splitScreen';
    return newDOMElement;
  }

  this.update = function (frameProgress) {
    screenViews.forEach((view) => {
      view.update(frameProgress);
    });
  };

  const DOMElement = createDOMElement();

  this.getDOMElement = function () {
    return DOMElement;
  };
  DOMElement.appendChild(minimapView.getDOMElement());
  screenViews.forEach((view) => {
    DOMElement.appendChild(view.getDOMElement());
  });

};


jracer.view.Screen = function (viewConfig, trackView, carView, carModel, tachometerView) {
  'use strict';
  let rotateAndZoom;

  function createRotateAndZoom() {
    let averageScaleCalculator;
    let averageRotateCalculator;

    const transform = new jracer.view.DOMProxy(centralPixelDOMElement.style, 'transform');

    function AverageCalculator(initialValue, numberOfValues) {

      const values = [];
      let sum = 0;

      this.add = function (value) {
        values.unshift(value);
        sum += value;
        sum -= values.pop();
      };

      this.getAverage = function (value) {
        return sum / numberOfValues;
      };

      // eslint-disable-next-line no-restricted-syntax
      for (let index = 0; index < numberOfValues; index += 1) {
        values.push(initialValue);
        sum += initialValue;
      }
    }

    function calculateRotate(carDirection) {

      if (!averageRotateCalculator) {
        averageRotateCalculator = new AverageCalculator(carDirection, 100);
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
        averageScaleCalculator = new AverageCalculator(targetZoomFactor, 100);
      }

      averageScaleCalculator.add(targetZoomFactor);
      targetZoomFactor = Math.round(averageScaleCalculator.getAverage() * 1000) / 1000;
      return `scale(${targetZoomFactor})`;
    }
    return function () {
      transform.set(`${calculateRotate(-carModel.direction)} ${calculateScale(carModel.velocity.forward + Math.abs(carModel.velocity.lateral))}`);
    };
  }

  function createDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'screen';
    // newDOMElement.style.width = viewConfig.width + 'px';
    // newDOMElement.style.height = viewConfig.height + 'px';
    // newDOMElement.style.marginLeft = '-' + (viewConfig.width / 2) + 'px';
    // newDOMElement.style.marginTop = '-' + (viewConfig.height / 2) + 'px';
    return newDOMElement;
  }

  function createCentralPixelDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'centralPixel';
    return newDOMElement;
  }

  const DOMElement = createDOMElement();
  const centralPixelDOMElement = createCentralPixelDOMElement();

  this.update = function (frameProgress) {
    if (rotateAndZoom) {
      rotateAndZoom();
    }

    trackView.update();
    if (carView) {
      carView.update();
    }
    tachometerView.update();
  };

  this.getDOMElement = function () {
    return DOMElement;
  };

  DOMElement.appendChild(centralPixelDOMElement);
  DOMElement.appendChild(tachometerView.getDOMElement());


  centralPixelDOMElement.appendChild(trackView.getDOMElement());
  //centralPixelDOMElement.appendChild(carView.getDOMElement());

  if (viewConfig.rotateAndZoom) {
    rotateAndZoom = createRotateAndZoom();
  }

  // init
  this.update();
};



jracer.view.Car = function (viewConfig, carModel) {
  'use strict';

  function calculateTransfrom(direction) {
    direction = direction % (2 * Math.PI);
    direction = Math.round(direction * 1000) / 1000;
    return `rotate(${direction}rad)`;
  }

  function createDOMElement() {
    const newDOMElement = window.document.createElement('canvas');
    newDOMElement.className = 'car';
    newDOMElement.style.backgroundColor = viewConfig.color;
    const { width, length } = carModel.dimensions;
    newDOMElement.style.width = `${width}px`;
    newDOMElement.style.height = `${length}px`;
    newDOMElement.style.marginLeft = `-${width / 2}px`;
    newDOMElement.style.marginBottom = `-${width / 2}px`;
    return newDOMElement;
  }

  const DOMElement = createDOMElement();
  const transform = new jracer.view.DOMProxy(DOMElement.style, 'transform');

  this.update = function (frameProgress) {
    transform.set(calculateTransfrom(carModel.direction));
  };

  this.getDOMElement = function () {
    return DOMElement;
  };

};



jracer.view.StaticCar = function (viewConfig, carModel) {
  'use strict';

  // Super Constructor
  jracer.view.Car.call(this, viewConfig, carModel);

  // superUpdate = this.update;

  // this.update = function (frameProgress) {
  // superUpdate(frameProgress);
  // };

};

jracer.view.MovingCar = function (viewConfig, carModel) {
  'use strict';

  // Super Constructor
  jracer.view.Car.call(this, viewConfig, carModel);

  const superUpdate = this.update;
  const left = new jracer.view.DOMProxy(this.getDOMElement().style, 'left');
  const bottom = new jracer.view.DOMProxy(this.getDOMElement().style, 'bottom');

  this.update = function (frameProgress) {
    superUpdate(frameProgress);
    left.set(`${Math.round(carModel.position.x)}px`);
    bottom.set(`${Math.round(carModel.position.y)}px`);
  };

};




jracer.view.Track = function (viewConfig, carViews) {
  'use strict';

  function createDOMElement() {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'track';
    /*DOMElement.style.width = jracer.model.track.dimensions.width * jracer.model.track.gridSize + "px";
		DOMElement.style.height = jracer.model.track.dimensions.height * jracer.model.track.gridSize + "px";*/
    return newDOMElement;
  }

  const DOMElement = createDOMElement();

  this.addCarViews = function () {
    carViews.forEach((view) => {
      DOMElement.appendChild(view.getDOMElement());
    });
  };

  this.update = function () {
    carViews.forEach((view) => {
      view.update();
    });
  };

  this.getDOMElement = function () {
    return DOMElement;
  };

};




jracer.view.StaticTrack = function (viewConfig, carViews) {
  'use strict';

  jracer.view.Track.call(this, viewConfig, carViews);
  this.addCarViews();

  this.getDOMElement().style.left = -Math.round(jracer.config.track.startposition.x) + 'px';
  this.getDOMElement().style.bottom = -Math.round(jracer.config.track.startposition.y) + 'px';

};
jracer.view.StaticTrack.prototype = Object.create(jracer.view.Track.prototype);


jracer.view.MovingTrack = function (viewConfig, carModel, carViews, tireTracksView) {
  'use strict';
  const originalOffset = new jracer.Vector(0, 0);
  const rotatedOffset = new jracer.Vector();

  jracer.view.Track.call(this, viewConfig, carViews);

  const left = new jracer.view.DOMProxy(this.getDOMElement().style, 'left');
  const bottom = new jracer.view.DOMProxy(this.getDOMElement().style, 'bottom');

  this.getDOMElement().appendChild(tireTracksView.getDOMElement());
  this.addCarViews();

  const superUpdate = this.update;

  this.update = function () {
    superUpdate();
    rotatedOffset.copyFrom(originalOffset);
    rotatedOffset.rotate(-carModel.direction);
    left.set(`${-Math.round(carModel.position.x + rotatedOffset.x)}px`);
    bottom.set(`${-Math.round(carModel.position.y + rotatedOffset.y)}px`);
  };

  this.update();

};
jracer.view.MovingTrack.prototype = Object.create(jracer.view.Track.prototype);


jracer.view.TireTracks = function (viewConfig, carModels) {
  'use strict';
  const carTireTracks = [];

  function CarTireTracks(carModel, canvas) {
    const drawers = [];

    function createDrawer(offset, alphaSource1, alphaSource2) {

      const startPosition = new jracer.Vector();
      const endPosition = new jracer.Vector();
      const rotatedOffset = new jracer.Vector();

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

    this.update = function () {
      drawers[0]();
      drawers[1]();
      drawers[2]();
      drawers[3]();
    };

    function setUpCanvasDrawers() {
      const { wheelbase, trackWidth } = carModel.dimensions;
      const frontRightOffset = new jracer.Vector(trackWidth / 2, wheelbase / 2);

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
  }


  function createDOMElement(viewConfig) {
    const newDOMElement = window.document.createElement('canvas');
    newDOMElement.className = 'tireTracks';
    newDOMElement.width = jracer.model.track.dimensions.width;
    newDOMElement.height = jracer.model.track.dimensions.height;
    return newDOMElement;
  }

  function createCarTireTracks() {
    carModels.forEach((carModel) => {
      carTireTracks.push(new CarTireTracks(carModel, canvasContext));
    });
  }

  const DOMElement = createDOMElement(viewConfig);
  const canvasContext = DOMElement.getContext('2d');
  createCarTireTracks();

  this.getDOMElement = function () {
    return DOMElement;
  };

  this.update = function () {
    carTireTracks.slice().reverse().forEach((track) => {
      track.update();
    });
  };

  this.getCanvas = function () {
    return canvasContext;
  };

};


jracer.view.HeadUpDisplay = function (viewConfig, carModel) {
  'use strict';
  let speed;
  let round;
  let lastTime;

  function createDOMElement() {
    let label;
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'headupdisplay';

    label = window.document.createElement('label');
    label.appendChild(window.document.createTextNode('像素/秒'));//时速
    newDOMElement.appendChild(label);
    speed = window.document.createElement('span');
    newDOMElement.appendChild(speed);

    label = window.document.createElement('label');
    label.appendChild(window.document.createTextNode('轮'));
    newDOMElement.appendChild(label);
    round = window.document.createElement('span');
    newDOMElement.appendChild(round);


    label = window.document.createElement('label');
    label.appendChild(window.document.createTextNode('Zeit'));
    newDOMElement.appendChild(label);
    lastTime = window.document.createElement('span');
    newDOMElement.appendChild(lastTime);
    return newDOMElement;
  }

  const DOMElement = createDOMElement();

  this.getDOMElement = function () {
    return DOMElement;
  };

  this.update = function () {
    speed.textContent = Math.round(carModel.velocity.forward);
    round.textContent = carModel.round;
    lastTime.textContent = carModel.roundTimes[carModel.roundTimes.length - 1];
    // if (carModel.controls.gasPedal > 0) {
    // speed.style.backgroundColor = 'gainsboro';
    // } else {
    // speed.style.backgroundColor = 'white';
    // }
  };

  this.update();
};

// TODO
jracer.view.MiniMap = function (viewConfig) {
  'use strict';

  function createDOMElement(viewConfig) {
    const newDOMElement = window.document.createElement('div');
    newDOMElement.className = 'miniMap';
    return newDOMElement;
  }

  const DOMElement = createDOMElement();

  this.getDOMElement = function () {
    return DOMElement;
  };
};
