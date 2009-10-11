/**
 * @author Jan
 */
JRacer = {};

JRacer.init = function(){
    JRacer.Physics.init();
}

JRacer.Math = {};
JRacer.Math.RadianToDegree = function(angle){
    return (angle / Math.PI) * 180;
}
JRacer.Math.DegreeToRadian = function(angle){
    return (angle / 180) * Math.PI;
}
JRacer.Math.DecreaseValue = function(value, cutback){
    var newValue = 0;
    if (value >= 0) {
        newValue = value - cutback;
        if (newValue < 0) 
            newValue = 0;
    }
    
    if (value < 0) {
        newValue = value + cutback;
        if (newValue > 0) 
            newValue = 0;
    }
    return newValue;
}
JRacer.Math.ChangeValueNotNull = function(value, change){
    var newValue = value + change;
    if ((value >= 0 && newValue < 0) || (value < 0 && newValue > 0)) 
        newValue = 0;
    return newValue;
}
JRacer.Math.ChangeValueNotOverNull = function(value, change){
    var newValue = value + change;
    if ((value > 0 && newValue < 0) || (value < 0 && newValue > 0)) 
        newValue = 0;
    return newValue;
}
JRacer.Math.IncreaseUpTo = function(max, value){
    if (value > max) 
        return max;
    return value;
}
