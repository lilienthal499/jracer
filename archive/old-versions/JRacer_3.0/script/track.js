/**
 * @author Jan
 */
JRacer.Track = function(Size, StartingPosition, Sections){
    var Size = Size, StartingPosition = StartingPosition, Sections = Sections;
    var self = this;
    this.TrackClockwise;
    this.Loop;
    this.getWidth = function(){
        return Size.x;
    }
    this.getHeight = function(){
        return Size.y;
    }
    
    this.getStartingPosition = function(){
        return StartingPosition;
    }
    
    
    this.getCanvasInstructions = function(canvasDom, gridSize, trackWidthPercentage){
    
        var Instructions = {}, InnerCircle = [], OuterCircle = [], canvas = canvasDom.getContext('2d'), currentDirection = JRacer.Track.North;
        var currentPosition = {
            x: StartingPosition.x,
            y: StartingPosition.y
        };
        if (trackWidthPercentage > 50) 
            trackWidthPercentage = 50;
        
        var TrackWidth = gridSize * (trackWidthPercentage / 100);
        var Shoulder = (gridSize - TrackWidth) / 2;
        
        var moveAhead = function(){
            switch (currentDirection) {
                case JRacer.Track.North:
                    currentPosition.y++;
                    break;
                case JRacer.Track.East:
                    currentPosition.x++;
                    break;
                case JRacer.Track.South:
                    currentPosition.y--;
                    break;
                case JRacer.Track.West:
                    currentPosition.x--;
                    break;
                default:
                    throw "Ungültige Richtung!"
            }
        }
        var drawCircleSegment = function(clockwise, size){
            var rotate = function(){
                if (clockwise) 
                    currentDirection++;
                else 
                    currentDirection--;
                currentDirection = (currentDirection + 4) % 4;
            }
            
            var DirectionToAngle = function(direction){
                var Multiplier = 0;
                switch (direction) {
                    case JRacer.Track.North:
                        Multiplier = 1;
                        break;
                    case JRacer.Track.East:
                        Multiplier = 1.5;
                        break;
                    case JRacer.Track.South:
                        Multiplier = 0;
                        break;
                    case JRacer.Track.West:
                        Multiplier = 0.5;
                        break;
                }
                if (!clockwise) 
                    Multiplier = (Multiplier + 1) % 2;
                return Multiplier * Math.PI;
            }
            var directionOffset = function(Amount, AfterRotate){
                var Offset = {
                    x: 0,
                    y: 0
                };
                switch (currentDirection) {
                    case JRacer.Track.North:
                        Offset.y = -1;
                        break;
                    case JRacer.Track.East:
                        Offset.x = -1;
                        break;
                    case JRacer.Track.South:
                        Offset.y = 1;
                        break;
                    case JRacer.Track.West:
                        Offset.x = 1;
                        break;
                }
                if (AfterRotate) {
                    Offset.x *= -1;
                    Offset.y *= -1;
                }
                Offset.x *= Amount;
                Offset.y *= Amount;
                return Offset;
            }
            
            var getArc = function(x, y, radius, startAngle, endAngle, anticlockwise){
                return function(){
                    canvas.arc(x, y, radius, startAngle, endAngle, anticlockwise);
                }
            }
            var StartAngle = DirectionToAngle(currentDirection);
            var FirstOffset;
            var x, y;
            
            switch (size) {
                case 1:
                    var InnerRadius = Shoulder;
                    var OuterRadius = InnerRadius + TrackWidth;
                    FirstOffset = directionOffset(gridSize / 2);
                    rotate();
                    x = ((currentPosition.x - 1) * gridSize) + (gridSize / 2) + FirstOffset.x + directionOffset(gridSize / 2, true).x;
                    y = canvasDom.height - (((currentPosition.y - 1) * gridSize) + (gridSize / 2) + FirstOffset.y + directionOffset(gridSize / 2, true).y);
                    
                    if (clockwise) {
                        OuterCircle.push(getArc(x, y, OuterRadius, StartAngle, DirectionToAngle(currentDirection), !clockwise));
                        InnerCircle.unshift(getArc(x, y, InnerRadius, DirectionToAngle(currentDirection), StartAngle, clockwise));
                    }
                    else {
                        OuterCircle.push(getArc(x, y, InnerRadius, StartAngle, DirectionToAngle(currentDirection), !clockwise));
                        InnerCircle.unshift(getArc(x, y, OuterRadius, DirectionToAngle(currentDirection), StartAngle, clockwise));
                    }
                    moveAhead();
                    break;
                case 2:
                    var InnerRadius = (gridSize / 2) + Shoulder;
                    var OuterRadius = InnerRadius + TrackWidth;
                    rotate();
                    moveAhead();
                    x = ((currentPosition.x - 1) * gridSize) + (gridSize / 2);
                    y = canvasDom.height - ((currentPosition.y - 1) * gridSize) - (gridSize / 2);
                    
                    if (clockwise) {
                        OuterCircle.push(getArc(x, y, OuterRadius, StartAngle, DirectionToAngle(currentDirection), !clockwise));
                        InnerCircle.unshift(getArc(x, y, InnerRadius, DirectionToAngle(currentDirection), StartAngle, clockwise));
                    }
                    else {
                        OuterCircle.push(getArc(x, y, InnerRadius, StartAngle, DirectionToAngle(currentDirection), !clockwise));
                        InnerCircle.unshift(getArc(x, y, OuterRadius, DirectionToAngle(currentDirection), StartAngle, clockwise));
                    }
                    clockwise = !clockwise;
                    rotate();
                    moveAhead();
                    clockwise = !clockwise;
                    rotate();
                    moveAhead();
                    break;
                case 3:
                    var InnerRadius = gridSize * 1.875 + Shoulder;
                    var OuterRadius = InnerRadius + TrackWidth;
                    FirstOffset = directionOffset(gridSize * 0.375);
                    rotate();
                    moveAhead();
                    moveAhead();
                    x = ((currentPosition.x - 1) * gridSize) + (gridSize / 2) + FirstOffset.x + directionOffset(gridSize * 0.375, true).x;
                    y = canvasDom.height - (((currentPosition.y - 1) * gridSize) + (gridSize / 2) + FirstOffset.y + directionOffset(gridSize * 0.375, true).y);
                    if (clockwise) {
                        OuterCircle.push(getArc(x, y, OuterRadius, StartAngle, DirectionToAngle(currentDirection), !clockwise));
                        InnerCircle.unshift(getArc(x, y, InnerRadius, DirectionToAngle(currentDirection), StartAngle, clockwise));
                    }
                    else {
                        OuterCircle.push(getArc(x, y, InnerRadius, StartAngle, DirectionToAngle(currentDirection), !clockwise));
                        InnerCircle.unshift(getArc(x, y, OuterRadius, DirectionToAngle(currentDirection), StartAngle, clockwise));
                    }
                    clockwise = !clockwise;
                    rotate();
                    moveAhead();
                    moveAhead();
                    clockwise = !clockwise;
                    rotate();
                    moveAhead();
                    break;
            }
            var EndAngle = DirectionToAngle(currentDirection);
        }
        var drawFinish = function(){
            var x, y, x2, y2;
            switch (currentDirection) {
                case JRacer.Track.North:
                    //TODO
                    break;
                case JRacer.Track.East:
                    break;
                case JRacer.Track.South:
                    x = (currentPosition.x - 1) * gridSize + Shoulder;
                    y = canvasDom.height - (currentPosition.y - 1) * gridSize;
                    x2 = (currentPosition.x - 1) * gridSize + Shoulder + TrackWidth;
                    y2 = canvasDom.height - (currentPosition.y) * gridSize;
                    OuterCircle.push(function(){
                        canvas.lineTo(x2, y);
                    });
                    
                    OuterCircle.push(function(){
                        canvas.lineTo(x, y);
                    });
                    OuterCircle.push(function(){
                        canvas.lineTo(x, y2);
                    });
                    break;
                case JRacer.Track.West:
                    break;
            }
        }
        
        
        
        for (var i = 0; i < Sections.length; i++) {
            switch (Sections[i]) {
                case JRacer.Track.Start:
                    var x = (StartingPosition.x - 1) * gridSize + Shoulder;
                    var y = canvasDom.height - (StartingPosition.y - 1) * gridSize;
                    OuterCircle.push(function(){
                        canvas.moveTo(x, y);
                    });
                    InnerCircle.push(function(){
                        canvas.lineTo(x + TrackWidth, y);
                    });
                    moveAhead();
                    break;
                case JRacer.Track.Finish:
                    if (!self.Loop) {
                        drawFinish();
                    }
                    break;
                case JRacer.Track.Custom:
                    break;
                case JRacer.Track.LeftTurn:
                    drawCircleSegment(false, 1);
                    break;
                case JRacer.Track.RightTurn:
                    drawCircleSegment(true, 1);
                    break;
                case JRacer.Track.WideLeftTurn:
                    drawCircleSegment(false, 2);
                    break;
                case JRacer.Track.WideRightTurn:
                    drawCircleSegment(true, 2);
                    break;
                case JRacer.Track.ExtraWideLeftTurn:
                    drawCircleSegment(false, 3);
                    break;
                case JRacer.Track.ExtraWideRightTurn:
                    drawCircleSegment(true, 3);
                    break;
                case JRacer.Track.StraightAhead:
                    moveAhead();
                    break;
            }
        }
        
        if (self.Loop) {
            if (!self.TrackClockwise) {
                var tmp = InnerCircle;
                InnerCircle = OuterCircle;
                OuterCircle = tmp;
            }
            
            Instructions.drawInnerCircle = function(){
                for (var i = 0; i < InnerCircle.length; i++) {
                    InnerCircle[i]();
                }
            }
            Instructions.drawOuterCircle = function(){
                for (var i = 0; i < OuterCircle.length; i++) {
                    OuterCircle[i]();
                }
            }
        }
        else {
            Instructions.drawOutline = function(){
                for (var i = 0; i < OuterCircle.length; i++) {
                    OuterCircle[i]();
                }
                for (var i = 0; i < InnerCircle.length; i++) {
                    InnerCircle[i]();
                }
                canvas.closePath();
            }
        }
        
        
        return Instructions;
    }
    var verifiy = function(self){
        var trackArea = new Array(Size.x);
        
        var currentDirection = JRacer.Track.North;
        var currentPosition = {
            x: StartingPosition.x,
            y: StartingPosition.y
        };
        
        var Turns = {
            Right: 0,
            Left: 0
        };
        if (Sections[0] != JRacer.Track.Start) 
            throw "Strecke fängt nicht mit Start an!"
        
        if (Sections[Sections.length - 1] != JRacer.Track.Finish) 
            throw "Strecke hört nicht mit Finish auf!"
        
        for (var i = 0; i < trackArea.length; i++) {
            trackArea[i] = new Array(Size.y);
        }
        
        for (var i = 0; i < trackArea.length; i++) {
            for (var j = 0; j < trackArea[i].length; j++) {
                trackArea[i][j] = true;
            }
        }
        
        
        
        var turn = function(clockwise, size){
            if (clockwise) 
                Turns.Right++
            else 
                Turns.Left++
            
            var rotate = function(){
                if (clockwise) 
                    currentDirection++;
                else 
                    currentDirection--;
                currentDirection = (currentDirection + 4) % 4;
            }
            
            switch (size) {
                case 1:
                    rotate();
                    moveAhead();
                    break;
                case 2:
                    moveAhead();
                    rotate();
                    moveAhead();
                    moveAhead();
                    break;
                case 3:
                    moveAhead();
                    rotate();
                    moveAhead();
                    clockwise = !clockwise;
                    rotate();
                    moveAhead();
                    clockwise = !clockwise;
                    rotate();
                    moveAhead();
                    moveAhead();
                    break;
            }
            
            
        };
        
        var StraightAhead = function(){
        
        }
        
        var moveAhead = function(){
            switch (currentDirection) {
                case JRacer.Track.North:
                    currentPosition.y++;
                    break;
                case JRacer.Track.East:
                    currentPosition.x++;
                    break;
                case JRacer.Track.South:
                    currentPosition.y--;
                    break;
                case JRacer.Track.West:
                    currentPosition.x--;
                    break;
                default:
                    throw "Ungültige Richtung!"
            }
            markPosition();
        }
        
        var markPosition = function(){
            if (trackArea[currentPosition.x - 1][currentPosition.y - 1]) { //gültige Stelle
                trackArea[currentPosition.x - 1][currentPosition.y - 1] = false;
            }
            else {
                if (currentPosition.x == StartingPosition.x && currentPosition.y == StartingPosition.y && currentDirection == JRacer.Track.North) {
                    self.Loop = true;
                }
                else {
                    console.dir(trackArea);
                    throw "Kreuzung oder Out of Bounce"
                }
            }
        }
        
        for (var i = 0; i < Sections.length; i++) {
            switch (Sections[i]) {
                case JRacer.Track.Start:
                    markPosition();
                    moveAhead();
                    break;
                case JRacer.Track.Finish:
                    if (i != Sections.length - 1) 
                        throw "Strecke endet vorzeitig!"
                    break;
                case JRacer.Track.Custom:
                    //TODO
                    break;
                case JRacer.Track.LeftTurn:
                    turn(false, 1);
                    break;
                case JRacer.Track.RightTurn:
                    turn(true, 1);
                    break;
                case JRacer.Track.WideLeftTurn:
                    turn(false, 2);
                    break;
                case JRacer.Track.WideRightTurn:
                    turn(true, 2);
                    break;
                case JRacer.Track.ExtraWideLeftTurn:
                    turn(false, 3);
                    break;
                case JRacer.Track.ExtraWideRightTurn:
                    turn(true, 3);
                    break;
                case JRacer.Track.StraightAhead:
                    moveAhead();
                    break;
                default:
                    throw "Ungültiger Streckenabschnitt: " + Sections[i];
            }
        }
        
        if (Turns.Right - 4 == Turns.Left) 
            self.TrackClockwise = true;
        else 
            if (Turns.Right == Turns.Left - 4) 
                self.TrackClockwise = false;
            else 
                self.TrackClockwise = null;
    }
    
    
    var constructor = function(self){
        verifiy(self);
    }
    constructor(this);
}
JRacer.Track.Start = 0;
JRacer.Track.Finish = 1;
JRacer.Track.Custom = 2;
JRacer.Track.LeftTurn = 3;
JRacer.Track.RightTurn = 4;
JRacer.Track.StraightAhead = 5;
JRacer.Track.WideLeftTurn = 6;
JRacer.Track.WideRightTurn = 7;
JRacer.Track.ExtraWideLeftTurn = 8;
JRacer.Track.ExtraWideRightTurn = 9;

JRacer.Track.North = 0;
JRacer.Track.East = 1;
JRacer.Track.South = 2;
JRacer.Track.West = 3;

JRacer.Map = function(GridSize, track){
    this.getWidth = function(){
        return track.getWidth() * GridSize;
    }
    
    this.getHeight = function(){
        return track.getHeight() * GridSize;
    }
    this.getStartingPositionX = function(){
        return ((track.getStartingPosition().x - 1) * GridSize) + (GridSize / 2);
    }
    this.getStartingPositionY = function(){
        return (track.getHeight() - (track.getStartingPosition().y)) * GridSize + (7 * GridSize / 8);
    }
    
    this.draw = function(canvasDom){
        var canvas = canvasDom.getContext('2d');
        canvas.save();
        canvasDom.width = track.getWidth() * GridSize;
        canvasDom.height = track.getHeight() * GridSize;
        var drawMe = track.getCanvasInstructions(canvasDom, GridSize, 45);
        var img = new Image(); //  Create new Image object
        img.src = 'images/asphalt.jpg'; //  Set source path
        var ptrn = canvas.createPattern(img, 'repeat');
        canvas.fillStyle = ptrn;
        
        if (track.Loop) {
        
            canvas.beginPath();
            drawMe.drawOuterCircle();
            canvas.fill();
            
            canvas.globalCompositeOperation = "destination-out";
            canvas.beginPath();
            drawMe.drawInnerCircle();
            canvas.fill();
            
            canvas.globalCompositeOperation = "source-over";
            canvas.strokeStyle = "rgba(255,255,255,0.7)";
            canvas.lineWidth = 4;
            canvas.beginPath();
            drawMe.drawOuterCircle();
            canvas.closePath();
            canvas.stroke();
            
            canvas.beginPath();
            drawMe.drawInnerCircle();
            canvas.closePath();
            canvas.stroke();
        }
        else {
            canvas.beginPath();
            drawMe.drawOutline();
            canvas.fill();
            
            canvas.globalCompositeOperation = "source-over";
            canvas.strokeStyle = "rgba(255,255,255,0.7)";
            canvas.lineWidth = 4;
            canvas.beginPath();
            drawMe.drawOutline();
            canvas.stroke();
        }
        canvas.restore();
    }
}
