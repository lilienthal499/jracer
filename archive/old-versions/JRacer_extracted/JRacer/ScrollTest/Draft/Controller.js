//In: Tastenbelegnug, Ziel-Thread
//Out: Nur neue? Key-Events an Thread schicken

JRacer.Keys = {
Acc:0;
Dec:1;
Left:2;
Right:3;
}

JRacer.Controller = function(userKeys, Thread){
var keyStatus = [false,false,false,false];

var notifyThread = function (){


Thread.postMessage();

}

document.onkeydown = function(e){

        switch (e.keyCode) {
            case userKeys[JRacer.Keys.Acc].Code:
		if(keyStatus[JRacer.Keys.Acc]) break;
		keyStatus[JRacer.Keys.Acc] = true;
		//Send to Thread
                return false;

            case Key.Decelerate.Code:


                return false;
            case Key.Left.Code:


                return false;
            case Key.Right.Code:


                return false;
        }
}


	document.onkeyup = function(e){
        switch (e.keyCode) {
            case Key.Accelerate.Code:
		keyStatus.acc = false;
		//Send to Thread
            case Key.Decelerate.Code:
		keyStatus.dec = false;


                return false;
            case Key.Left.Code:
		keyStatus.right = false;

                return false;
            case Key.Right.Code:
		keyStatus.left = false;

                return false;
        }

	}

}