/**
 * Copyright (c) 2009 Jan Schulte-Rebbelmund, Licensed under the MIT license.
 */
JRacer.load = function(){
    delete JRacer.load;
    
    if (typeof(window["console"]) == "undefined") {
        console = {
            log: function(){
            },
            dir: function(){
            },
            info: function(){
            },
            warn: function(){
            },
            assert: function(epx, msg){
                if (!msg) {
                    alert("Assertion failed: " + msg)
                }
            }
        };
    }
    
    //console.info("Loading JRacer...");
    
    JRacer.Display.createImageLoader(onImagesLoaded);
    console.assert(JRacer.Display.Images, "Image Loader failed to load.");
    JRacer.loadConfig(onConfigLoaded);
    createThreadInterface();
    console.assert(JRacer.Thread, "Thread Loader failed to load.");
    
    
    function onConfigLoaded(){
        console.assert(JRacer.Config, "Configuration failed to load.");
        
        JRacer.loadTimer();
        console.assert(JRacer.Timer, "Timer failed to load.");
        JRacer.Timer.addPermanentListener(JRacer.Thread.triggerTimer);
        console.assert(JRacer.loadControllers(), "Timer failed to load.");
        console.assert(JRacer.Display.loadViews(), "Views failed to load.");
        
        JRacer.Thread.sendConfig(JRacer.Config);
        JRacer.Thread.sendMessage("Message for thread!");
    }
    
    
    
    function onImagesLoaded(){
        // console.info("All images are ready.");
    }
    
    
    
    function createThreadInterface(){
        JRacer.Thread = (function(){
            var worker = new Worker('js/backend/thread.js');
            
            worker.onmessage = function(event){
                var data = event.data;
                if (data.drawupdate) {
                    JRacer.Display.sendData(data.drawupdate);
                    return;
                }
                if (typeof data.log !== "undefined") {
                    console.log(data.log);
                    return;
                }
                if (data.dir) {
                    console.dir(data.dir);
                    return;
                }
                console.warn("Unidentified Message from Thread: " + data);
            };
            
            return {
                sendConfig: function(config){
                    worker.postMessage({
                        configuration: config
                    });
                    
                },
                sendKeyStroke: function(playerid, key, down){
                    worker.postMessage({
                        keystroke: {
                            playerid: playerid,
                            key: key,
                            down: down
                        }
                    });
                    
                },
                sendMessage: function(msg){
                    worker.postMessage(msg);
                },
                
                start: function(){
                    worker.postMessage("start");
                },
                
                stop: function(){
                    worker.postMessage("stop");
                },
                
                triggerTimer: function(){
                    worker.postMessage("timer");
                }
            };
        })();
    }
};

document.addEventListener("DOMContentLoaded", JRacer.load, false);
