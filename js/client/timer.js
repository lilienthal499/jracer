/**
 * @author Jan
 */
JRacer.loadTimer = function(){
    delete JRacer.loadTimer;
    JRacer.Timer = {};
    
    var fps = JRacer.Config.Game.fps;
    var timerFunction, interval, frameNumber = 0;
    var permanentListeners = [];
    var temporaryListeners = new Collection.Set();
    var frameDuration = Math.floor(1000 / fps);
    
    var fpsManager = (function(){
        var totalTime;
        var enteringTime;
        var leavingTime;
        var waitingTime;
        var workingTime;
        var actualFPS;
        var notInTime = 1;
        var inTime = 9;
        
        
        return {
            enter: function(lateness){
                enteringTime = new Date().getTime();
                waitingTime = enteringTime - leavingTime;
                
                //   document.getElementById("wait").textContent = waitingTime;
                //   document.getElementById("lag").textContent = lateness;
            },
            leave: function(frameNumber){
                var oldLeavingTime = leavingTime;
                leavingTime = new Date().getTime();
                
                workingTime = leavingTime - enteringTime;
                // document.getElementById("work").textContent = workingTime;
                
                
                totalTime = leavingTime - oldLeavingTime;
                actualFPS = Math.floor(1000 / totalTime);
                //     document.getElementById("fps").textContent = actualFPS;
                if (frameNumber % 20 == 0) {
                    //		console.log("Reset:"+notInTime+" "+inTime);
                    notInTime = notInTime / 1.2;
                    inTime = inTime / 1.2;
                }
                
                if (actualFPS < fps) {
                    notInTime++;
                }
                else {
                    inTime++;
                }
                document.getElementById("fpsmeterdiplay").style.width = 100 - (notInTime / (notInTime + inTime) * 100) + "%";
                document.getElementById("fpsmeterdiplay").textContent = Math.round(100 - (notInTime / (notInTime + inTime) * 100)) + " %";
                
                
            }
        }
    })();
    
    var timerFunction = function(lateness){
        fpsManager.enter(lateness);
        
        frameNumber++;
        
        for (var f in permanentListeners) 
            f(frameNumber);
        
        for (var f in temporaryListeners) 
            f(frameNumber);
        
        fpsManager.leave(frameNumber);
    }
    
    JRacer.Timer.getFrameDurationInSeconds = function(){
        return frameDuration / 1000;
    }
    
    JRacer.Timer.addPermanentListener = function(listener){
        permanentListeners.add(listener);
    }
    
    JRacer.Timer.addTemporaryListener = function(listener){
        temporaryListeners.add(listener);
    }
    
    JRacer.Timer.removeTemporaryListener = function(listener){
        temporaryListeners.remove(listener);
    }
    
    JRacer.Timer.start = function(){
        if (interval === undefined) 
            interval = setInterval(timerFunction, frameDuration);
    }
    
    JRacer.Timer.stop = function(){
        clearInterval(interval);
        interval = undefined;
    }
}
