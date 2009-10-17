/**
 * @author Jan
 */
Thread.loadTimer = function(){
    delete Thread.loadTimer;
    Thread.Timer = {};
    
    var fps = Thread.Config.Game.fps;
    var timerFunction, frameNumber = 0;
    var permanentListeners = [];
    var temporaryListeners = new Collection.Set();
    var frameDuration = Math.floor(1000 / fps);
    
    var timerFunction = function(){
        frameNumber++;
        
        for (var f in permanentListeners) 
            f(frameNumber);
        
        for (var f in temporaryListeners) 
            f(frameNumber);
    }
    
    Thread.Timer.getFrameDurationInSeconds = function(){
        return frameDuration / 1000;
    }
    
    Thread.Timer.addPermanentListener = function(listener){
        permanentListeners.add(listener);
    }
    
    Thread.Timer.addTemporaryListener = function(listener){
        temporaryListeners.add(listener);
    }
    
    Thread.Timer.removeTemporaryListener = function(listener){
        temporaryListeners.remove(listener);
    }
    
    Thread.Timer.trigger = function(){
        timerFunction();
    }
}
