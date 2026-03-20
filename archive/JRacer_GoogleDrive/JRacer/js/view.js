/*jslint browser: true*/
/*global jracer,console*/
jracer.view = {};

jracer.view.DOMProxy = function (style, property) {
    'use strict';
    var oldValue;

    this.set = function (value) {
        if (value !== oldValue) {
            style[property] = value;
            oldValue = value;
        }
    };

};

jracer.view.SplitScreen = function (viewConfig, screenViews, minimapView) {
	'use strict';
	var DOMElement, index;

    function createDOMElement() {
        var newDOMElement = window.document.createElement('div');
        newDOMElement.className = 'splitScreen';
        return newDOMElement;
    }

    this.update = function (frameProgress) {
        var index;
        for (index = 0; index < screenViews.length; index += 1) {
            screenViews[index].update(frameProgress);
        }
    };

    this.getDOMElement = function () {
        return DOMElement;
    };

    DOMElement = createDOMElement();
    DOMElement.appendChild(minimapView.getDOMElement());
    for (index = 0; index < screenViews.length; index += 1) {
        DOMElement.appendChild(screenViews[index].getDOMElement());
    }
	
};


jracer.view.Screen = function (viewConfig, trackView, carView, carModel, tachometerView) {
	'use strict';
	var DOMElement, centralPixelDOMElement, rotateAndZoom;
	
	function createRotateAndZoom() {
		var transform, averageScaleCalculator, averageRotateCalculator;
	
		transform = new jracer.view.DOMProxy(centralPixelDOMElement.style, "transform");
	
		function AverageCalculator(initialValue, numberOfValues) {
			
			var values = [], index, average, sum = 0;
			
			this.add = function (value) {
				values.unshift(value);
				sum += value;				
				sum -= values.pop();
			};
			
			this.getAverage = function (value) {
				return sum / numberOfValues;
			};

			for (index = 0; index < numberOfValues; index += 1) {
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
			return 'rotate(' + carDirection + 'rad)';
		}


		function calculateScale(velocity) {	    
			
			var MAX_ZOOM_FACTOR = 0.7, MIN_ZOOM_FACTOR = 1, targetZoomFactor; 
			
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
			return "scale(" + targetZoomFactor + ")";
		}	
		return function () {
			transform.set(calculateRotate(-carModel.direction) + " " + calculateScale((carModel.velocity.forward + Math.abs(carModel.velocity.lateral))));
		};
	}

	function createDOMElement() {
		var newDOMElement = window.document.createElement('div');
		newDOMElement.className = 'screen';
		// newDOMElement.style.width = viewConfig.width + 'px';
		// newDOMElement.style.height = viewConfig.height + 'px';
		// newDOMElement.style.marginLeft = '-' + (viewConfig.width / 2) + 'px';
		// newDOMElement.style.marginTop = '-' + (viewConfig.height / 2) + 'px';
		return newDOMElement;
	}

	function createCentralPixelDOMElement() {
		var newDOMElement = window.document.createElement('div');
		newDOMElement.className = 'centralPixel';
		return newDOMElement;
	}
	

	this.update = function (frameProgress) {
		if(rotateAndZoom) {
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

	DOMElement = createDOMElement();
	centralPixelDOMElement = createCentralPixelDOMElement();

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
	var transform, DOMElement;

	function calculateTransfrom(direction) {
        direction = direction % (2 * Math.PI);
        direction = Math.round(direction * 1000) / 1000;
        return 'rotate(' + direction + 'rad)';
	}

	function createDOMElement() {
		DOMElement = window.document.createElement('canvas');
		DOMElement.className = 'car';
		DOMElement.style.backgroundColor = viewConfig.color;
		DOMElement.style.width = carModel.dimensions.width + 'px';
		DOMElement.style.height = carModel.dimensions.length + 'px';
		DOMElement.style.marginLeft = '-' + (carModel.dimensions.width / 2) + 'px';
		DOMElement.style.marginBottom = '-' + (carModel.dimensions.width / 2) + 'px';
	}

	this.update = function (frameProgress) {
        transform.set(calculateTransfrom(carModel.direction));
	};

    this.getDOMElement = function () {
        return DOMElement;
    };

    createDOMElement();
    transform = new jracer.view.DOMProxy(DOMElement.style, "transform");

};



jracer.view.StaticCar = function (viewConfig, carModel) {
	'use strict';
	var DOMElement, transform, superUpdate;

    // Super Constructor
    jracer.view.Car.call(this, viewConfig, carModel);

    // superUpdate = this.update;  

	// this.update = function (frameProgress) {
	    // superUpdate(frameProgress);
	// };

};

jracer.view.MovingCar = function (viewConfig, carModel) {
	'use strict';
	var DOMElement, transform, left, bottom, superUpdate;

	// Super Constructor
    jracer.view.Car.call(this, viewConfig, carModel);

	superUpdate = this.update;

	this.update = function (frameProgress) {
        superUpdate(frameProgress);
		left.set(Math.round(carModel.position.x)  + 'px');
		bottom.set(Math.round(carModel.position.y) + 'px');
	};

    left = new jracer.view.DOMProxy(this.getDOMElement().style, "left");
    bottom = new jracer.view.DOMProxy(this.getDOMElement().style, "bottom");

};




jracer.view.Track = function (viewConfig, carViews) {
	'use strict';

	var DOMElement;

    function createDOMElement() {
		DOMElement = window.document.createElement('div');
		DOMElement.className = 'track';
		/*DOMElement.style.width = jracer.model.track.dimensions.width * jracer.model.track.gridSize + "px";
		DOMElement.style.height = jracer.model.track.dimensions.height * jracer.model.track.gridSize + "px";*/
	}
 
    createDOMElement();

	this.addCarViews = function () {
		var index;
		for (index = 0; index < carViews.length; index += 1) {
			DOMElement.appendChild(carViews[index].getDOMElement());
		}
	};

    this.update = function () {
        var index;
        for (index = 0; index < carViews.length; index += 1) {
            carViews[index].update();
        }
    };

    this.getDOMElement = function () {
        return DOMElement;
    };

};




jracer.view.StaticTrack = function (viewConfig, carViews) {
	'use strict';
	var DOMElement;

    jracer.view.Track.call(this, viewConfig, carViews);
	this.addCarViews();

    this.getDOMElement().style.left = -Math.round(jracer.config.track.startposition.x) + 'px';
    this.getDOMElement().style.bottom = -Math.round(jracer.config.track.startposition.y) + 'px';

};
jracer.view.StaticTrack.prototype = Object.create(jracer.view.Track.prototype);


jracer.view.MovingTrack = function (viewConfig, carModel, carViews, tireTracksView) {
	'use strict';
	var DOMElement, left, bottom, superUpdate, originalOffset = new jracer.Vector(0, 0), rotatedOffset = new jracer.Vector();

    jracer.view.Track.call(this, viewConfig, carViews);

    left = new jracer.view.DOMProxy(this.getDOMElement().style, "left");
    bottom = new jracer.view.DOMProxy(this.getDOMElement().style, "bottom");

    this.getDOMElement().appendChild(tireTracksView.getDOMElement());
	this.addCarViews();

    superUpdate = this.update;

	this.update = function () {
        superUpdate();
        rotatedOffset.copyFrom(originalOffset);
        rotatedOffset.rotate(-carModel.direction);
		left.set(-Math.round(carModel.position.x + rotatedOffset.x) + 'px');
		bottom.set(-Math.round(carModel.position.y + rotatedOffset.y) + 'px');
	};
	
    this.update();

};
jracer.view.MovingTrack.prototype = Object.create(jracer.view.Track.prototype);


jracer.view.TireTracks = function (viewConfig, carModels) {
	'use strict';
	var DOMElement, canvasContext, carTireTracks = [];

    function CarTireTracks(carModel, canvas) {
        var drawers = [];
    
        function createDrawer(offset, alphaSource1, alphaSource2) {
    
            var startPosition = new jracer.Vector(), endPosition = new jracer.Vector(), rotatedOffset = new jracer.Vector();
    
            return function () {
                var globalAlpha = alphaSource1() + alphaSource2();
    
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
            var globalAlpha = Math.abs(velocity) / 1000;
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
            var globalAlpha;
            globalAlpha = calculateGlobalAlpha(carModel.velocity.lateral);
            globalAlpha *= carModel.velocity.lateral > 0 ? 2 : 1;
            globalAlpha = globalAlpha > 0.5 ? 0.5 : globalAlpha;
            return globalAlpha;
        }
    
        function calculateRightGlobalAlpha() {
            var globalAlpha;
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
            var frontRightOffset,
                frontLeftOffset,
                backRightOffset,
                backLeftOffset;
    
            frontRightOffset = new jracer.Vector(carModel.dimensions.trackWidth / 2, carModel.dimensions.wheelbase / 2);
    
            frontLeftOffset = frontRightOffset.copy();
            frontRightOffset.x = -frontRightOffset.x;
    
            backRightOffset = frontRightOffset.copy();
            backRightOffset.y = -backRightOffset.y;
    
            backLeftOffset = backRightOffset.copy();
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
		var newDOMElement = window.document.createElement('canvas');
		newDOMElement.className = 'tireTracks';
		newDOMElement.width = jracer.model.track.dimensions.width;
		newDOMElement.height = jracer.model.track.dimensions.height;
		return newDOMElement;
	}

	function createCarTireTracks() {
		var index;
		for (index = 0; index < carModels.length; index += 1) {
			carTireTracks.push(new CarTireTracks(carModels[index], canvasContext));
		}
	}

    DOMElement = createDOMElement(viewConfig);
    canvasContext = DOMElement.getContext('2d');
    createCarTireTracks();
    
	this.getDOMElement = function () {
		return DOMElement;
	};

	this.update = function () {
		var index;
		for (index = carTireTracks.length - 1; index >= 0; index -= 1){
			carTireTracks[index].update();
		}
	};

    this.getCanvas = function () {
        return canvasContext;    
    };

};


jracer.view.HeadUpDisplay = function (viewConfig, carModel) {
	'use strict';
	var DOMElement, speed, round, lastTime;

	function createDOMElement() {
		var label;
		DOMElement = window.document.createElement('div');
		DOMElement.className = 'headupdisplay';

		label = window.document.createElement('label');
		label.appendChild(window.document.createTextNode("像素/秒"));//时速 
		DOMElement.appendChild(label);
		speed = window.document.createElement('span');
		DOMElement.appendChild(speed);
		
		label = window.document.createElement('label');
		label.appendChild(window.document.createTextNode("轮"));
		DOMElement.appendChild(label);
		round = window.document.createElement('span');		
		DOMElement.appendChild(round);
		
		
        label = window.document.createElement('label');
        label.appendChild(window.document.createTextNode("Zeit"));
        DOMElement.appendChild(label);
        lastTime = window.document.createElement('span');
        DOMElement.appendChild(lastTime);
	}

	this.getDOMElement = function () {
		return DOMElement;
	};

	this.update = function () {
		speed.textContent = Math.round(carModel.velocity.forward);
		round.textContent = carModel.round;
		lastTime.textContent = carModel.roundTimes[carModel.roundTimes.length-1];
		// if (carModel.controls.gasPedal > 0) {
			// speed.style.backgroundColor = 'gainsboro';
		// } else {
			// speed.style.backgroundColor = 'white';
		// }
	};

	createDOMElement();
	this.update();
};

// TODO
jracer.view.MiniMap = function (viewConfig) {
	'use strict';
	var DOMElement;

	function createDOMElement(viewConfig) {
		var newDOMElement = window.document.createElement('div');
		newDOMElement.className = 'miniMap';
		return newDOMElement;
	}
	
	DOMElement = createDOMElement();
	
	this.getDOMElement = function () {
		return DOMElement;
	};
};