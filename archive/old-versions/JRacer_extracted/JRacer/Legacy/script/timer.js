/**
 * @author Jan
 */
JRacer.Timer = new function(){
    var FPS, self = this, timeout = null, FrameNumber = 0, permanentListeners = [], temporaryListeners = new JRacer.Collection.List();
    
	
	
    var olddate, newdate;
    var timerFunction = function(){
        /*
         newdate = new Date().getMilliseconds();
         var dt = newdate - olddate;
         dt = dt > 0 ? dt : dt + 1000;
         self.currentFPS = Math.round(((1 / dt) * 1000));
         
         document.getElementById("fps").value = self.currentFPS;
         olddate = newdate;
         */
        FrameNumber++;
        for (var i = 0; i < permanentListeners.length; i++) 
            permanentListeners[i](FrameNumber);
        for (var i = 0; i < temporaryListeners.getAll().length; i++) 
            temporaryListeners.getAll()[i](FrameNumber);
    }
    
    this.FrameDuration = 0;
    this.currentFPS = 25;
    
    this.setFPS = function(FPSi){
        FPS = FPSi;
        self.FrameDuration = Math.floor(1000 / FPS) / 1000;
    }
    
    this.start = function(){
        olddate = new Date().getMilliseconds();
        timeout = window.setInterval(timerFunction, self.FrameDuration * 1000);
    };
    
    this.stop = function(){
        if (timeout) 
            window.clearInterval(timeout);
    }
    
    this.addPermanentListener = function(listener){
        if (typeof listener == "function") 
            permanentListeners.push(listener);
    }
    this.addTemporaryListener = function(listener){
        if (typeof listener == "function") 
            temporaryListeners.add(listener);
    }
    this.removeTemporaryListener = function(listener){
        temporaryListeners.remove(listener);
    }
}
