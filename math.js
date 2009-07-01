/*
function turnx(x, y, alpha){
return Math.cos(degtorad(alpha)) * x + -Math.sin(degtorad(alpha)) * y;
}


function turny(x, y, alpha){
return Math.sin(degtorad(alpha)) * x + Math.cos(degtorad(alpha)) * y;
}

*/


function degtorad(alpha)
{
return (alpha / 360) * 2 * Math.PI;
}



function Vector(x, y)
{

 this.x = x;

 this.y = y;

 
 this.rotate = rotate;
 this.rerotate = rerotate;
}


function rotate(alpha)
{
var alpharad = degtorad(-alpha);

this.ahead = Math.cos(alpharad) * this.x - Math.sin(alpharad) * this.y;

//DEBUG
document.getElementById("aheadv").style.width = Math.abs(this.ahead*50);
document.getElementById("ahead").value = this.ahead;


this.sidewise = Math.sin(alpharad) * this.x + Math.cos(alpharad) * this.y;

//DEBUG
document.getElementById("sidewisev").style.width = Math.abs(this.sidewise*50);
document.getElementById("sidewise").value = this.sidewise;
}


function rerotate(alpha)
{
var alpharad = degtorad(alpha);

this.x = Math.cos(alpharad) * this.ahead - Math.sin(alpharad) * this.sidewise;

//DEBUG
document.getElementById("vxv").style.width = Math.abs(this.x*50);
document.getElementById("vx").value = v.x;

this.y = Math.sin(alpharad) * this.ahead + Math.cos(alpharad) * this.sidewise;

//DEBUG
document.getElementById("vyv").style.width = Math.abs(this.y*50);
document.getElementById("vy").value = v.y;

}