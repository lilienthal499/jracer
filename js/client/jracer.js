/**
 * Copyright (c) 2009 Jan Schulte-Rebbelmund, Licensed under the MIT license.
 */
var JRacer = (function(){
    var isRunning = false;
    return {
        start: function(){
            if (isRunning) 
                throw "JRacerAlreadyRunning";
            isRunning = true;
            JRacer.Timer.start();
            // JRacer.Thread.start();
            // JRacer.Display.start();
            console.info("JRacer started.");
        },
        stop: function(){
            if (!isRunning) 
                throw "JRacerNotRunning";
            isRunning = false;
            JRacer.Timer.stop();
            // JRacer.Thread.stop();
            // JRacer.Display.stop() ;
            console.info("JRacer stopped.");
        }
    }
})();
