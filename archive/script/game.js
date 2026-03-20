/**
 * @author Jan
 */
JRacer.Player = function(Car, Controller){
    this.getCar = function(){
        return Car;
    }
};

JRacer.Game = new function(){
    var players = [];
    var map;
    this.addPlayer = function(player){
        players.push(player);
    }
    this.getPlayers = function(){
        return players;
    }
    
    this.setMap = function(Map){
        map = Map;
    }
    
    this.getMap = function(){
        return map;
    }
    
};
JRacer.Vector = function(x, y){
    this.x = x;
    this.y = y;
    this.rotate = function(angle){
        var x = Math.cos(angle) * this.x - Math.sin(angle) * this.y;
        var y = Math.sin(angle) * this.x + Math.cos(angle) * this.y;
        return new JRacer.Vector(x, y);
    }
}

JRacer.Car = function(controls, dimensions, image, engine){
    this.dimensions = dimensions;
    this.velocity = 0;
    this.direction = 0;
    this.position = new JRacer.Vector(0, 0);
    
    this.image = image;
    this.controls = controls;
    this.engine = engine;
    var car = this;
    var steeringWheelTurnMax = JRacer.Math.DegreeToRadian(30);
    
    this.View = new function(){
        var lastDirection = 0;
        
        this.draw = function(){
            if (lastDirection == car.direction) 
                return;
            var currentRotation = car.direction - lastDirection;
            lastDirection = car.direction;
            car.canvas.clearRect(-18.5, -18.5, 37, 37);
            car.canvas.rotate(currentRotation);
            car.canvas.drawImage(car.image, -10, -15);
        }
    }
    
    this.Physics = new function(){
        var angularVelocity = 0;
        var Velocity = new JRacer.Vector(0, 0);
        
        var rollingResistance = 10;
        var staticFriction = 300;
        var slidingFriction = staticFriction * 0.8;
        var aerodynamicResistanceFront = .0009;
        var aerodynamicResistanceSide = 0;
        var turningFriction = 1;
        var turningFrictionSlide = turningFriction * 0.9;
        
        var isSliding = false;
        var dt = JRacer.Timer.FrameDuration;
        
        var calcTurnRadius = function(){
            if ((controls.getRight() + controls.getLeft()) == 0) 
                return 0;
            var turn = 0.5 * Math.PI - (steeringWheelTurnMax * (controls.getRight() + controls.getLeft()));
            
            return car.dimensions.Wheelbase / Math.cos(turn);
        }
        var calcTragetAngularVelocity = function(TurnRadius){
            if (TurnRadius == 0) 
                return 0;
            var tragetAngularVelocity = car.velocity / TurnRadius
            if (controls.getLeft() > 0) 
                tragetAngularVelocity *= -1;
            return tragetAngularVelocity;
        }
        
        var updatePostion = function(){
            var positonChange = Velocity.rotate(-car.direction);
            positonChange.x *= dt;
            positonChange.y *= dt;
            car.position.x += positonChange.x;
            car.position.y += positonChange.y
            
            car.direction += angularVelocity * dt;
            
            Velocity = Velocity.rotate(angularVelocity * dt);
            car.velocity = Velocity.y;
            
            
        }
        
        this.run = function(){
            var TurnRadius = calcTurnRadius();
            var tragetAngularVelocity = calcTragetAngularVelocity(TurnRadius);
            var Acceleration = new JRacer.Vector(0, 0);
            if (Math.abs(tragetAngularVelocity - angularVelocity) < turningFriction) {
                angularVelocity += (tragetAngularVelocity - angularVelocity);
                
            }
            else {
                angularVelocity += tragetAngularVelocity - angularVelocity < 0 ? -turningFrictionSlide : turningFrictionSlide;
            }
            
            Acceleration.y -= controls.getDec() * staticFriction;
            Acceleration.y -= Math.pow(car.velocity, 2) * aerodynamicResistanceFront;
            Acceleration.y -= rollingResistance;
            
            if (Acceleration.y + car.engine.accelerate(controls.getAcc()) <= staticFriction) 
                Acceleration.y += car.engine.accelerate(controls.getAcc());
            else 
                Acceleration.y = staticFriction;
            
            Velocity.y = JRacer.Math.ChangeValueNotNull(Velocity.y, Acceleration.y * dt);
            Velocity.x = JRacer.Math.DecreaseValue(Velocity.x, staticFriction * dt);

            updatePostion();
        }
    }
}

JRacer.Car.Dimensions = function(Width, Length, Wheelbase, TrackWidth, FrontOverhang, RearOverhang, SideOverhang, LengthInMeters){
    this.Width = Width;
    this.Length = Width;
    this.Wheelbase = Wheelbase;
    this.TrackWidth = TrackWidth;
    this.FrontOverhang = FrontOverhang;
    this.RearOverhang = RearOverhang;
    this.SideOverhang = SideOverhang;
    this.LengthInMeters = LengthInMeters;
}
JRacer.Car.Engine = function(){
    var power = 95;
    
    this.accelerate = function(percentage){
        return percentage * power;
    }
}
