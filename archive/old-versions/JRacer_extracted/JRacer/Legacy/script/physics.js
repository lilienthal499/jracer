/**
 * @author Jan
 */
JRacer.Physics = new function(){
    var cars = [];
    this.init = function(){
        var players = JRacer.Game.getPlayers();
        for (var i = 0; i < players.length; i++) {
            cars.push(players[i].getCar());
        }
    }
    
    this.run = function(){
        for (var i = 0; i < cars.length; i++) {
            cars[i].Physics.run();
        }
    }
};

JRacer.Timer.addPermanentListener(JRacer.Physics.run);
