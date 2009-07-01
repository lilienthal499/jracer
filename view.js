var x = 50;
var y = 250;
var alpha = 90;
var slide = false;

var window_heigth;
var fps = 24;

var i = 0;

var carlength = 15;
var carwidth = 8;
var carcolor = "#FF0000";
var car = new Array(carwidth);

var debug;

function createCar(carwidth, carlength){
var carContainer = document.getElementById("cars");


// Array für Autoteile erstellen
for(i = 0; i<car.length; i++){
	car[i] = new Array(carlength);
}




//Elemente erstellen
for  (i = 0; i<car.length; i++)
{
  for  (j = 0; j<car[i].length; j++)
  {		
	car[i][j] = document.createElement("div");
    car[i][j].style.overflow = "hidden";
    car[i][j].style.position = "absolute";
    car[i][j].style.width = "1px";
    car[i][j].style.height = "1px";
  	carContainer.appendChild(car[i][j]);
  	
  	
  	 car[i][j].style.backgroundColor = carcolor;

if(i==0 || i==7)
    car[i][j].style.display = "none";   

    
if((i<=1 || i>=6) && ((j>=9 && j<=12)||(j>=1 && j<=3))){
    car[i][j].style.backgroundColor = "black";      
    car[i][j].style.display = "inline";   }

  }
}


debug = document.createElement("div");
    debug.style.overflow = "hidden";
    debug.style.position = "absolute";
    debug.style.width = "2px";
    debug.style.height = "2px";
    debug.style.backgroundColor = "blue";
	carContainer.appendChild(debug);
}



function view()
{

var x_screen = x;
var y_screen = window_heigth - y;


document.getElementById("racetrack").style.left  = 320-x_screen; 
document.getElementById("racetrack").style.top = 240-y_screen;

var faktor1 = Math.sin(degtorad(alpha+90));
var faktor2 = Math.sin(degtorad(alpha+180));
var faktor3 = Math.sin(degtorad(-alpha));
var faktor4 = Math.sin(degtorad(-90-alpha));






if(slide == true){
	
var afaktor1 = 0.5 * (carlength - 3) * faktor1;
var afaktor2 = 0.5 * (carwidth - 3) * faktor2;
var afaktor3 = 0.5 * (carlength - 3) * faktor3;
var afaktor4 = 0.5 * (carwidth - 3) * faktor4;

var attrition = document.createElement("span");
attrition.className = "attrition"; 
attrition.style.left = x_screen - afaktor1 - afaktor2 - 1 + "px";
attrition.style.top = y_screen - afaktor3 - afaktor4 - 1 + "px";
document.getElementById("effect").appendChild(attrition); 

attrition = document.createElement("span");
attrition.className = "attrition"; 
attrition.style.left = x_screen + 0.5 * (carlength - 3) * faktor1 - 0.5 * (carwidth - 3) * faktor2 - 1 + "px";
attrition.style.top = y_screen + 0.5 * (carlength - 3) * faktor3 - 0.5 * (carwidth - 3) * faktor4 - 1 + "px";
document.getElementById("effect").appendChild(attrition); 

attrition = document.createElement("span");
attrition.className = "attrition"; 
attrition.style.left = x_screen - 0.5 * (carlength - 3) * faktor1 + 0.5 * (carwidth - 3) * faktor2 - 1 + "px";
attrition.style.top = y_screen - 0.5 * (carlength - 3) * faktor3 + 0.5 * (carwidth - 3) * faktor4 - 1 + "px";
document.getElementById("effect").appendChild(attrition); 

attrition = document.createElement("span");
attrition.className = "attrition"; 
attrition.style.left = x_screen + 0.5 * (carlength - 3) * faktor1 + 0.5 * (carwidth - 3) * faktor2 - 1 + "px";
attrition.style.top = y_screen + 0.5 * (carlength - 3) * faktor3 + 0.5 * (carwidth - 3) * faktor4 - 1 + "px";
document.getElementById("effect").appendChild(attrition); 



}


//DEBUG:
document.getElementById("tmt").innerText= document.getElementById("effect").getElementsByTagName("span").length;


//Überschüssige Reifenspuren löschen
for (var i = document.getElementById("effect").getElementsByTagName("span").length; i > 200; i--){
document.getElementById("effect").removeChild(document.getElementById("effect").firstChild);
}







x_screen = 320;
y_screen = 240;

/*
debug.style.left = 320-1+"px";
debug.style.top = 240-1+"px";
*/
for  (i = 0; i<car.length; i++)
{
  for  (j = 0; j<car[i].length; j++)
  {		
    car[i][j].style.left = x_screen - (0.5 * carlength -  j) * faktor1 - (0.5 * carwidth - i) * faktor2 - 1 + "px";
    car[i][j].style.top = y_screen - (0.5 * carlength -  j) * faktor3 - (0.5 * carwidth - i) * faktor4 - 1 + "px";
  }
}

/*
document.getElementById("ar").style.left = x_screen - carlength * faktor1 - carwidth * faktor2 - 1 + "px";
document.getElementById("ar").style.top = y_screen - carlength * faktor3 - carwidth * faktor4 - 1 + "px";
document.getElementById("debug").innerText = document.getElementById("br").style.left + car[0][0].style.left;

//alert(document.getElementById("br").style.top + car[0][0].style.top);




document.getElementById("ar").style.left = x_screen + carlength * faktor1 - carwidth * faktor2 - 1 + "px";
document.getElementById("ar").style.top = y_screen + carlength * faktor3 - carwidth * faktor4 - 1 + "px";

document.getElementById("al").style.left = x_screen + carlength * faktor1 + carwidth * faktor2 - 1 + "px";
document.getElementById("al").style.top = y_screen + carlength * faktor3 + carwidth * faktor4 - 1 + "px";

document.getElementById("bl").style.left = x_screen - carlength * faktor1 + carwidth * faktor2 - 1 + "px";
document.getElementById("bl").style.top = y_screen - carlength * faktor3 + carwidth * faktor4 - 1 + "px";

document.getElementById("middle").style.left = x_screen -3 + "px";
document.getElementById("middle").style.top = y_screen -3 + "px";
*/
/*
document.getElementById("middle").style.left = x_screen -3 + "px";
document.getElementById("middle").style.top = y_screen -3 + "px";

document.getElementById("br").style.left = x_screen - carlength * Math.sin(degtorad(alpha+90)) - carwidth * Math.sin(degtorad(alpha+180)) - 1 + "px";
document.getElementById("br").style.top = y_screen - carlength * Math.sin(degtorad(-alpha)) - carwidth * Math.sin(degtorad(-90-alpha)) - 1 + "px";

document.getElementById("bl").style.left = x_screen - carwidth * Math.sin(degtorad(alpha)) - carlength * Math.sin(degtorad(alpha+90)) - 1 + "px";
document.getElementById("bl").style.top = y_screen - carwidth * Math.sin(degtorad(90-alpha)) - carlength * Math.sin(degtorad(-alpha)) - 1 + "px";

document.getElementById("ar").style.left = x_screen - carlength * Math.sin(degtorad(alpha-90)) - carwidth * Math.sin(degtorad(alpha+180)) - 1 + "px";
document.getElementById("ar").style.top = y_screen - carlength * Math.sin(degtorad(180-alpha)) - carwidth * Math.sin(degtorad(-90-alpha)) - 1 + "px";

document.getElementById("al").style.left = x_screen - carwidth * Math.sin(degtorad(alpha)) - carlength * Math.sin(degtorad(alpha-90)) - 1 + "px";
document.getElementById("al").style.top = y_screen - carwidth * Math.sin(degtorad(90-alpha)) - carlength * Math.sin(degtorad(180-alpha)) - 1 + "px";
*/


document.getElementById("esp").style.display = slide?"inline":"none";
document.getElementById("speedo").style.width = Math.abs(v.ahead*100);

//DEBUG
document.getElementById("x").value = x;
document.getElementById("y").value = y;
document.getElementById("alpha").value = alpha;

}

function addMessage(message)
{
var MessageArea = document.getElementById("MessageArea");
var newElement = document.createElement("li"); 
var newText = document.createTextNode(message);
newElement.appendChild(newText);
if(MessageArea.hasChildNodes()){
MessageArea.insertBefore(newElement, MessageArea.firstChild);}
else{
	MessageArea.appendChild(newElement);}	
}

function setBestzeit(zeit)
{
var bestzeitContainer =	document.getElementById("bestZeit");
		
	if(bestzeitContainer.hasChildNodes()){
	bestzeitContainer.removeChild(bestzeitContainer.firstChild);
	}	
	bestzeitContainer.appendChild(document.createTextNode(zeit));
}