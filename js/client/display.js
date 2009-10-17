/**
 * Copyright (c) 2009 Jan Schulte-Rebbelmund, Licensed under the MIT license.
 */

JRacer.Display = {};


JRacer.Display.loadViews = function () {
	delete JRacer.Display.loadViews;
	
    var sentData = null;
    var initial = true;
    var redrawFunctions = new Collection.Set();
    var ViewManager = (function () {
        return {
            add: function (domElement) {
                document.getElementsByTagName("body")[0].insertBefore(domElement, document.getElementsByTagName("body")[0].firstChild);
            }
        }
    })();


    function loadViews() {
        for (var view in JRacer.Config.View) {
            if (view.type === "standard") createStandardView(view.playerid, view.Resolution.height, view.Resolution.width, view.rotate);
        }
    }
	loadViews();

    function updateViews() {
        for (var fn in redrawFunctions) {
            fn();
        }
    }
	
    JRacer.Timer.addPermanentListener(updateViews);
	

    function createStandardView(playerid, height, width, rotate) {
        var cars = new Collection.Map();

        var screen = document.createElement("div");
        screen.className = "standardView";
        screen.style.height = height + "px";
        screen.style.width = width + "px";

        var map = document.createElement("div");
        map.className = "map";
        screen.appendChild(map);

        /*  var track = document.createElement("canvas");
		track.width = 1800;
		track.height = 1800;
		track.style.margin = "300px 400px" 
        map.appendChild(track);*/
        var track = getTmpCanvas()

        track.style.margin = height / 2 + "px " + width / 2 + "px";

        map.appendChild(track);

        for (var player in JRacer.Config.Player) {
            var img = JRacer.Display.Images.get(JRacer.Config.Cars.get(player.id).Image.src);
            img.className = "car",
            map.appendChild(img);
            cars.add(player.id, img);
        }

        redrawFunctions.add(function () {
            for (var carData in sentData) {
                var carImg = cars.get(carData.id);
                carImg.style.left = (carData.x + width / 2 - carImg.width / 2) + "px";
                carImg.style.bottom = (carData.y + height / 2) + "px";
                carImg.style.MozTransform = 'rotate(' + carData.angle + 'deg)';

                if (carData.id === playerid) {
                    screen.scrollTop = track.height - carData.y;
                    screen.scrollLeft = carData.x;
                    if(rotate){					
					var orix = carData.x+ width/2;
					var oriy = track.height - carData.y + height/2;
					map.style.MozTransformOrigin = orix+'px '+oriy+'px';
					map.style.MozTransform = 'rotate(-'+carData.angle+'deg)';
					}
                }
            }
        });



        function setSize(height, width) {

        };



        function getTmpCanvas() {
            return JRacer.Display.Images.get("img/track.png");
        }

        ViewManager.add(screen);
    }
	
    JRacer.Display.start = function () {
        Timer.start();
    }
    JRacer.Display.stop = function () {
        Timer.stop();
    },
    JRacer.Display.sendData = function (data) {
        sentData = data;
    }
	return true; //for assertion
};

JRacer.Display.createImageLoader = function (callback) {
    delete JRacer.Display.createImageLoader;

    var map = new Collection.Map();
    var loadedImagesCount = 0;



    function checkComplete() {
        if (map.size() == loadedImagesCount) callback();
    }

    JRacer.Display.Images = {
        add: function (filename) {
            var image = new Image();
            image.onload = function () {
                ++loadedImagesCount;
                checkComplete();
            }

            image.onerror = function () {
                console.warn("Image \"" + filename + "\" not found.");
                ++loadedImagesCount;
                checkComplete();
            }

            image.src = filename;
            try {
                map.add(filename, image);
            }
            catch(e
            if e == "DuplicateKey") {}
        },
        get: function (filename) {

            return map.get(filename).cloneNode(true);
        }
    };
};


    /*
    var Timer = (function () {
        var lastFrameTime;
        var targetFPS = 10;
        var targetTimeout = 1000 / targetFPS;
        var running = false;

        return {
            start: function () {
                if (running) throw "DisplayTimerAlreadyRunning";
                running = true;
                update();
            },
            stop: function () {
                running = false;
            },

            enterFrame: function () {
                var thisFrameTime = new Date().getTime();
               // document.getElementById("fps_in").style.width = Math.round((thisFrameTime - lastFrameTime)) + "px";
			   if(Math.round((thisFrameTime - lastFrameTime))>40)
			   console.warn("Thread: "+ Math.round((thisFrameTime - lastFrameTime)));
                lastFrameTime = thisFrameTime;
            },

            leaveFrame: function () {
                var thisFrameTime = new Date().getTime();
                var diff = thisFrameTime - lastFrameTime;
               // document.getElementById("fps_out").style.width = Math.round(diff) + "px";
			   if(Math.round(diff)>5)
			   console.warn("View: "+ Math.round(diff));
			   
                var thisTimeout;
                lastFrameTime = thisFrameTime;
                if (targetTimeout > diff) {
                    thisTimeout = targetTimeout - diff
                } else {
                    thisTimeout = 0;
                    console.warn("FPS Problem!");
                }
              //  if (running) window.setTimeout(update, thisTimeout);
            }

        }
    })();
*/