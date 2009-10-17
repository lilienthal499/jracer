/**
 * @author Jan
 */
console = {
    log: function(data){
        postMessage({
            log: data
        });
    },
    dir: function(data){
        postMessage({
            dir: data
        });
    }
};

Thread = {};
importScripts('../shared/collection.js');
importScripts('timer.js');
importScripts('physics.js');
importScripts('controller.js');

onmessage = function(event){
    var data = event.data;
    if (data === "timer") {
        Thread.Timer.trigger();
        return;
    }
    if (data.keystroke) {
        console.log(data.keystroke.playerid + " " + data.keystroke.key + " " +
        data.keystroke.down);
        return;
    }
    if (data === "start") {
        Thread.Timer.start();
        return;
    }
    if (data === "stop") {
        Thread.Timer.stop();
        return;
    }
    if (data.configuration) {
        Thread.Config = data.configuration;
        Thread.loadTimer();
        Thread.loadPhysics();
        return;
    }
    
    console.log("Unidentified message from Browser: " + data);
};

Thread.drawUpdate = function(cars){
    postMessage({
        drawupdate: cars
    });
}
