/**
 * @author Jan
 */
JRacer.View = new function(){
    var map, mapobject, screen, scale;
    var StartingPositionX, StartingPositionY;
    var cars = [];
    var displayCar = function(car){
        car.View.draw();
    }
    var initCar = function(car){
        var jqueryelm = $("<canvas></canvas>");
        var canvasSize = Math.ceil(Math.sqrt(Math.pow(car.image.width, 2) + Math.pow(car.image.height, 2)));
        
        jqueryelm.attr("width", canvasSize);
        jqueryelm.attr("height", canvasSize);
        
        jqueryelm.css("position", "absolute");
        jqueryelm.css("left", JRacer.Config.Display.Dimension.X / 2 - canvasSize / 2);
        jqueryelm.css("top", JRacer.Config.Display.Dimension.Y / 2 - canvasSize / 2);
        
        car.image.left = Math.round((canvasSize - car.image.width) / 2);
        car.image.top = Math.round((canvasSize - car.image.height) / 2);
        
        scale = car.dimensions.LengthInMeters / car.dimensions.Length;
        
        screen.append(jqueryelm);
        car.dom = jqueryelm.get(0);
        car.canvas = car.dom.getContext('2d');
        car.canvas.translate(Math.round(canvasSize / 2), Math.round(canvasSize / 2));
        car.canvas.drawImage(car.image, -10, -15);
    }
    
    this.drawUpdate = function(){
        map.style.top = Math.floor(cars[0].position.y) + (JRacer.Config.Display.Dimension.Y / 2) - StartingPositionY + "px";
        map.style.left = (JRacer.Config.Display.Dimension.X / 2) - Math.floor(cars[0].position.x) - StartingPositionX + "px";
        for (var i = 0; i < cars.length; i++) {
            displayCar(cars[i]);
        }
    }
	
    this.init = function(){
        var centerDiv = $("<div></div>");
        centerDiv.css("position", "absolute");
        centerDiv.css("width", "1px");
        centerDiv.css("height", "1px");
        centerDiv.css("left", "50%");
        centerDiv.css("top", "50%");
        centerDiv.css("overflow", "visible");
        $("body").append(centerDiv);
        
        screen = $("<div></div>");
        screen.css("position", "absolute");
        screen.css("width", JRacer.Config.Display.Dimension.X + "px");
        screen.css("height", JRacer.Config.Display.Dimension.Y + "px");
        screen.css("left", -JRacer.Config.Display.Dimension.X / 2);
        screen.css("top", -JRacer.Config.Display.Dimension.Y / 2);
        screen.css("overflow", "hidden");
        screen.css("border", "2px outset scrollbar");
        screen.css("backgound-color", "white");
        centerDiv.append(screen);
        
        
        map = $("<div></div>");
        mapobject = JRacer.Game.getMap();
        map.css("position", "absolute");
        map.css("width", mapobject.getWidth());
        map.css("height", mapobject.getHeight());
        map.css("backgroundImage", "url(images/grass.jpg)")
        screen.append(map);
        
        var mainCanvas = $("<canvas></canvas>");
        mainCanvas.css("position", "absolute");
        mainCanvas.attr("width", mapobject.getWidth())
        mainCanvas.attr("height", mapobject.getHeight())
        map.append(mainCanvas);
        mapobject.draw(mainCanvas.get(0));
        
        map = map.get(0);
        
        StartingPositionX = mapobject.getStartingPositionX();
        StartingPositionY = mapobject.getStartingPositionY();
        
        var players = JRacer.Game.getPlayers();
        for (var i = 0; i < players.length; i++) {
            cars.push(players[i].getCar());
        }
        
        for (var i = 0; i < cars.length; i++) {
            initCar(cars[i]);
        }
        
    }    
}

JRacer.Timer.addPermanentListener(JRacer.View.drawUpdate);

