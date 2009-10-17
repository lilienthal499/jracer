/**
 * @author Jan
 */
JRacer.Controls = function(){
    var acc = 0, dec = 0, left = 0, right = 0;
    
    this.setAcc = function(accin){
        acc = accin > 1 ? 1 : accin;
    }
    this.setDec = function(decin){
        dec = decin > 1 ? 1 : decin;
    }
    this.setLeft = function(leftin){
        left = leftin > 1 ? 1 : leftin;
    }
    this.setRight = function(rightin){
        right = rightin > 1 ? 1 : rightin;
    }
    
    this.getAcc = function(){
        return acc;
    }
    this.getDec = function(){
        return dec;
    }
    
    this.getLeft = function(){
        return left;
    }
    
    this.getRight = function(){
        return right;
    }
}

JRacer.Controller = function(Controls){
    var acc = false, dec = false, left = false, right = false;
    var status = {
        acc: false,
        dec: false,
        left: false,
        right: false
    };
    
    var delayedControllers = {
        acc: null,
        dec: null,
        left: null,
        right: null
    }
    
    this.acc = function(down){
        if (!status.acc && (down || (down == undefined))) {//Wir geben noch kein Gas
            delayedControllers.acc = CreateDelayedInput(0.9, 100, Controls.setAcc);
            status.acc = true;
            if (status.dec) {
                JRacer.Timer.removeTemporaryListener(delayedControllers.dec);
                Controls.setDec(0);
            }
        }
        else {
            if (status.acc && (!down || (down == undefined))) {
                JRacer.Timer.removeTemporaryListener(delayedControllers.acc);
                Controls.setAcc(0);
                status.acc = false;
                if (status.dec && Controls.getDec() == 0) 
                    delayedControllers.dec = CreateDelayedInput(0.7, 500, Controls.setDec)
            }
        }
    }
    
    this.dec = function(down){
        if (!status.dec && (down || (down == undefined))) {
            delayedControllers.dec = CreateDelayedInput(0.7, 500, Controls.setDec)
            status.dec = true;
            if (status.acc) {
                JRacer.Timer.removeTemporaryListener(delayedControllers.acc);
                Controls.setAcc(0);
            }
        }
        else {
            if (status.dec && (!down || (down == undefined))) {
                JRacer.Timer.removeTemporaryListener(delayedControllers.dec);
                Controls.setDec(0);
                status.dec = false;
                if (status.acc && Controls.getAcc() == 0) 
                    delayedControllers.acc = CreateDelayedInput(0.9, 100, Controls.setAcc);
            }
        }
    }
    this.right = function(down){
        if (!status.right && (down || (down == undefined))) {
            delayedControllers.right = CreateDelayedInput(0.4, 800, Controls.setRight);
            status.right = true;
            if (status.left) {
                JRacer.Timer.removeTemporaryListener(delayedControllers.left);
                Controls.setLeft(0);
            }
        }
        else {
            if (status.right && (!down || (down == undefined))) {
                JRacer.Timer.removeTemporaryListener(delayedControllers.right);
                Controls.setRight(0);
                status.right = false;
                if (status.left && Controls.getLeft() == 0) 
                    delayedControllers.left = CreateDelayedInput(0.4, 800, Controls.setLeft)
            }
        }
    }
    this.left = function(down){
        if (!status.left && (down || (down == undefined))) {
            delayedControllers.left = CreateDelayedInput(0.4, 800, Controls.setLeft)
            status.left = true;
            if (status.right) {
                JRacer.Timer.removeTemporaryListener(delayedControllers.right);
                Controls.setRight(0);
            }
        }
        else {
            if (status.left && (!down || (down == undefined))) {
                JRacer.Timer.removeTemporaryListener(delayedControllers.left);
                Controls.setLeft(0);
                status.left = false;
                if (status.right && Controls.getRight() == 0) 
                    delayedControllers.right = CreateDelayedInput(0.4, 800, Controls.setRight);
            }
        }
    }
    var CreateDelayedInput = function(startIn, Time, Setter){
        var timeStepCount = Math.floor(Time / (JRacer.Timer.FrameDuration * 1000));
        var stepsize = (1 - startIn) / timeStepCount;
        var currentValue = startIn;
        var runIt = function(){
            if (currentValue > 1) {
                currentValue = 1;
                JRacer.Timer.removeTemporaryListener(runIt);
            }
            Setter(currentValue);
            currentValue += stepsize;
        }
        JRacer.Timer.addTemporaryListener(runIt);
        return runIt;
    }
    
}

