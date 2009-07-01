function getCollision()
{

var damping = 0.9;


if(x>800){
x = 800;
v.x = -damping * v.x;
}

if(x>100 && x<700 && y>100 && y<500){
//if(x<200)
//x = 100;
//if(x<600)
//x = 700;	
v.x = -damping * v.x;
v.y = -damping * v.y;
}

if(x<0){
x = 0;
v.x = -damping * v.x;	
}


if(y>600){
v.y = -damping * v.y;
y = 600;
}



if(y<0){
v.y = -damping * v.y;
y = 0;
}


}