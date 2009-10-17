JRacer.loadControllers = function(){
    delete JRacer.loadControllers;
    var i = 0;
    
    for (var player in JRacer.Config.Player) {
        if (player.Keys) {
            createController(i);
        }
        i++;
    }
    
    function createController(playerId){
    
        var keyStatus = {
            acc: false,
            dec: false,
            left: false,
            right: false
        };
        
        var userKeys = JRacer.Config.Player[playerId].Keys;
        
        document.addEventListener('keydown', keyHandler, false);
        document.addEventListener('keyup', keyHandler, false);
        
        function keyHandler(event){
        
            switch (event.keyCode) {
                case userKeys.acc:
                    sendKeyEvent("acc", event);
                    break;
                case userKeys.dec:
                    sendKeyEvent("dec", event);
                    break;
                case userKeys.left:
                    sendKeyEvent("left", event);
                    break;
                case userKeys.right:
                    sendKeyEvent("right", event);
                    break;
            }
            
            function sendKeyEvent(key, event){
            
                event.preventDefault();
                
                if (!keyStatus[key] && event.type == "keydown") {
                    keyStatus[key] = true;
                    JRacer.Thread.sendKeyStroke(playerId, key, true);
                    return;
                }
                
                if (keyStatus[key] && event.type == "keyup") {
                    keyStatus[key] = false;
                    JRacer.Thread.sendKeyStroke(playerId, key, false);
                }
            }// sendKeyEvent
        }// keyHander
    }// loadController
	return true; //For the assertion
};// loadController
