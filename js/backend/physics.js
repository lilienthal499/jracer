/*! Copyright (c) 2009 Jan Schulte-Rebbelmund
 * Licensed under the MIT license.
 */
Thread.loadPhysics = function() {
	var cars = [ {
		id : 1,
		x : 150,
		y : 450,
		angle : 0
	}, {
		id : 2,
		x : 150,
		y : 490,
		angle : 10
	}, {
		id : 3,
		x : 150,
		y : 530,
		angle : 20
	} ];

	var counter = 0;

	Thread.Timer.addPermanentListener(function() {
		counter +=0-.1;
		counter %= 360;
		var i = 0;
		for (car in cars) {
			i++;
			car.y = 450 + Math.sin((counter+i*10)/(Math.PI*2))*150;
			car.x = 150 + Math.cos((counter+i*10)/(Math.PI*2))*150;
			
			car.angle = (2-counter)*Math.PI*2;
		}

		Thread.drawUpdate(cars);
	});
};