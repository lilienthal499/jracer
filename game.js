var score = 0;
var run = 0;
var slideLegth = false;
var faktor = 0;

function driftrace(slides){

if(slides){
faktor++;
document.getElementById("driftbar").style.backgroundColor = "#"+Math.round(faktor)+Math.round(faktor)+Math.round(faktor);
run += v.ahead;}
else{
score += (run * faktor)/100;
document.getElementById("driftbar").style.width = Math.abs(score) + "px";
document.getElementById("driftbar").innerText = Math.round(score);
run = 0;
faktor = 0;}

slideLegth = slides;
}


var timestamp;
var progress = 0;
var started = false;
var checkpoint = false;
var highscore = new highscore();

function roundtime(){

if(x>0 && x<100 && y>400 && v.y>0 && progress==0){
addMessage("Rennen gestarted!");	
timestamp = new Date();
progress++;
}


if(y>500 && y<600 && x>400 && v.x>0 && progress==1){	
var time = 	new Date().getTime()-timestamp.getTime();
addMessage("Kontrollpunkt "+progress+": \t"+time/1000+"\t"+highscore.setHighscore(progress, time));	
progress++;
}


if(x>700 && x<800 && y<300 && v.y<0 && progress==2){
var time = 	new Date().getTime()-timestamp.getTime();
addMessage("Kontrollpunkt "+progress+": \t"+time/1000+"\t"+highscore.setHighscore(progress, time));	
progress++;
}


if(y>0 && y<100 && x<400 && v.x<0 && progress==3){
var time = 	new Date().getTime()-timestamp.getTime();
addMessage("Kontrollpunkt "+progress+": \t"+time/1000+"\t"+highscore.setHighscore(progress, time));	
progress++;
}


if(x>0 && x<100 && y>400 && v.y>0 && progress==4){
var time = 	new Date().getTime()-timestamp.getTime();
addMessage("Ziel: \t\t"+time/1000+"\t"+highscore.setHighscore(4, time));	
progress=0;
}
		

}

function highscore(){
var interimTime = new Array(4);


  this.setHighscore = function(interim, time) {
  	
  	interim--;
  	
    if(!interimTime[interim]){
    	interimTime[interim]=time; 
    	if(interim==3)
    	setBestzeit(time/1000);
    	
    	return 0;}
    	
    if(interimTime[interim]>time){
    	var tmp = interimTime[interim]-time
    	interimTime[interim]=time;
    	
    	if(interim==3)
    	setBestzeit(time/1000);
    	    	
    	 return "-"+tmp/1000;}
    	
    if(interimTime[interim]<time){
    	return (interimTime[interim]-time)/-1000;}

return 0;
    };

	
}