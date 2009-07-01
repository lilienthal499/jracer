// Konstanten

// Zeitintervall für Physik Engine
var speed = 10;

// Beschleunigung
var avor = 0.01;

//Faktor, wie gut die Reifen sind sinnvolles max: 1 
var aruck = 0.5; 

// Haft, Gleit und Rollreibung 
var fhaft = 0.05;
var fgleit = fhaft * 0.8;
var froll = 0.001;

// Luftwiderstand
var fluft = 0.001;

// Rotation
var awinkel = 2;	// Maximale winkeländerung pro Zeinteiheit
var fwinkel =  0.05;	// Winkelgeschwindigkeitsreduktionsfaktor



// Veränderliche Variablen
var v = new Vector(0, 0);
var vwinkel = 0;



//Erweiterung
//var keycount = 0;	// Anzahl der Milisekunden die die Taste gedrückt war

var maxcount = 300;	// Dauer in ms bis die Lenkung voll greift
var mincount = 10;	// Minimale Lenkgeschwindigkeit in %

maxcount /= speed; 
mincount = (maxcount / 100) * mincount;

var keycount = new keys();

function keys(){
this.ahead = 30;
this.back = 30;
this.left = 0;
this.right = 0;
}



function physics()
{

updateSpeed();
updateAngel();





//Winkel ändern
alpha += vwinkel * v.ahead;




// Positionsupdate
x += v.x;
y += v.y;


getCollision();


//Winkel auf 0<alpha<360 korrigieren
alpha = alpha % 360;
if(alpha < 0) 
{
alpha = 360 - alpha;
}

roundtime();
/*
// Gamefunktionen
if(!slide && slideLegth){
driftrace(false);}
else{
if(slide){
driftrace(true);} 
}
*/

}







function updateSpeed()
{

slide = false;

//Geschwindigkeitsvektor  drehen
v.rotate(alpha);



if(v.ahead > froll){
v.ahead -= froll;}
else{
if(v.ahead < -froll){
v.ahead += froll;}
else{
v.ahead = 0;}
}


// Luftwiederstand (Beide Richtungen)
if(v.ahead>0){
v.ahead -= v.ahead * v.ahead * fluft;
}
else{
if(v.ahead<0){
v.ahead -= v.ahead * v.ahead * fluft;
}}




// Haft-Gleitreibung (In seitlicher Richtung)
if(v.sidewise > fhaft){
v.sidewise -= fgleit;
slide = true;}
else{
if(v.sidewise < -fhaft){
slide = true;
v.sidewise = v.sidewise + fgleit;}
else{
v.sidewise = 0;}
}

//DEBUG
document.getElementById("slide").value = slide;
document.getElementById("slides").style.display = slide?"block":"none";





// Beschleunigung und Abbremsen
if(accelerate && !decelerate){// && !slide){
v.ahead += avor;}
else{

if(decelerate && !accelerate && v.ahead>fhaft){
v.ahead -= ( fgleit * aruck );
//slide = true;
}

else{
if(decelerate && !accelerate && v.ahead<0){
v.ahead = 0;}
}
}






// Geschwindigkeitsvektoren zurück drehen
v.rerotate(alpha);

}


function updateAngel()
{
//Erweiterung: Inkrementelle Lenkung
if(keycount.left>mincount)
keycount.left--;

if(left && !right && keycount.left<maxcount)
{ keycount.left += 2; }


if(keycount.right>mincount)
keycount.right--;

if(right && !left && keycount.right<maxcount)
{ keycount.right += 2; }




//DEBUG
document.getElementById("right").value = right;
document.getElementById("left").value = left;



// Winkelgeschwindigkeitsreduktion aus seitlicher "Reibung"
if(vwinkel > fwinkel){
vwinkel = vwinkel - fwinkel;
//DEBUG
document.getElementById("vwinkelstate").value = "Verringern: "+vwinkel;}

else{
if(vwinkel < -fwinkel){
//DEBUG
document.getElementById("vwinkelstate").value = "Erhöhen: "+vwinkel;
vwinkel = vwinkel + fwinkel;}

else{
//DEBUG
document.getElementById("vwinkelstate").value = "Gleich null";
vwinkel = 0;}
}




//DEBUG
document.getElementById("vwinkel").value = vwinkel;



if(!slide){
if(right && !left){
vwinkel = -awinkel*( keycount.right / maxcount )}

if(left && !right){ 
vwinkel = awinkel*( keycount.left / maxcount )}
}}






