var accelerate = false;
var decelerate = false;
var left = false;
var right = false;



function keydown(Event) 
{
 if (!Event)
   Event = window.event;


if(Event.keyCode == 38) accelerate = true;

if(Event.keyCode == 40) decelerate = true;

if(Event.keyCode == 37) left = true;

if(Event.keyCode == 39) right = true;


//DEBUG
document.getElementById("key").value = "Keydown: " + Event.keyCode;

}



function keyup(Event) 
{
 if (!Event)
   Event = window.event;

if(Event.keyCode == 38) accelerate = false;

if(Event.keyCode == 40) decelerate = false;

if(Event.keyCode == 37) left = false;

if(Event.keyCode == 39) right = false;


//DEBUG
document.getElementById("key").value = "Keyup: " + Event.keyCode;

}


document.onkeydown = keydown;
document.onkeyup = keyup;