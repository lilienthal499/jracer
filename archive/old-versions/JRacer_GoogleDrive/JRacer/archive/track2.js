/*jslint browser: true*/
/*global jracer,console*/

jracer.Track2 = function () {
	'use strict';

	this.draw = function (canvas, canvasInstructions) {

        canvas.save();

		// Draw track
		canvas.fillStyle = "rgb(100,100,100)";
		canvas.beginPath();
		canvasInstructions.drawouterCircle(canvas);
		canvas.closePath();
		canvas.fill();

		canvas.globalCompositeOperation = "destination-out";
		canvas.beginPath();
		canvasInstructions.drawinnerCircle(canvas);
		canvas.closePath();
		canvas.fill();


		// Draw lines
		canvas.globalCompositeOperation = "source-over";
		canvas.strokeStyle = "rgba(255,255,255,0.7)";
		canvas.lineWidth = 4;
		canvas.beginPath();
		canvasInstructions.drawouterCircle(canvas);
		canvas.closePath();
		canvas.stroke();

		canvas.beginPath();
		canvasInstructions.drawinnerCircle(canvas);
		canvas.closePath();
		canvas.stroke();

	};
};

jracer.Track.CanvasInstructions = function (sections, startingPosition) {
    "use strict";

	var innerCircle = [],
		outerCircle = [],
		currentDirection = jracer.Track.NORTH,
		currentPosition = startingPosition,
		TRACK_WIDTH_PERCENTAGE = 50,
		gridSize = 100,
		trackWidth = gridSize * (TRACK_WIDTH_PERCENTAGE / 100),
		shoulder = (gridSize - trackWidth) / 2,
		index,
		numberOfTurns = { right: 0, left: 0};

	function moveAhead() {
		switch (currentDirection) {
		case jracer.Track.NORTH:
			currentPosition.y = currentPosition.y + 1;
			break;
		case jracer.Track.EAST:
			currentPosition.x = currentPosition.x + 1;
			break;
		case jracer.Track.SOUTH:
			currentPosition.y = currentPosition.y - 1;
			break;
		case jracer.Track.WEST:
			currentPosition.x = currentPosition.x - 1;
			break;
		default:
			throw "Ungültige Richtung!";
		}
	}

	function drawCircleSegment(clockwise, size) {

		function rotate(rotateClockwise) {
			if (rotateClockwise) {
				currentDirection = currentDirection + 1; // Turn right
			} else {
				currentDirection = currentDirection - 1; // Turn left
			}
			currentDirection = (currentDirection + 4) % 4;
		}

		function directionToAngle(direction) {
			var multiplier;

			switch (direction) {
			case jracer.Track.NORTH:
				multiplier = 0;
				break;
			case jracer.Track.EAST:
				multiplier = 1.5;
				break;
			case jracer.Track.SOUTH:
				multiplier = 1;
				break;
			case jracer.Track.WEST:
				multiplier = 0.5;
				break;
			default:
				throw "Ungültige Richtung!";
			}
			if (clockwise) {
				multiplier = (multiplier + 1) % 2;
			}
			return multiplier * Math.PI;
		}

		function directionToOffset(amount, afterRotate) {
			var offset = new jracer.Vector();

			switch (currentDirection) {
			case jracer.Track.NORTH:
				offset.y = -1;
				break;
			case jracer.Track.EAST:
				offset.x = -1;
				break;
			case jracer.Track.SOUTH:
				offset.y = 1;
				break;
			case jracer.Track.WEST:
				offset.x = 1;
				break;
			}
			if (afterRotate) {
				offset.x *= -1;
				offset.y *= -1;
			}
			offset.x *= amount;
			offset.y *= amount;
			return offset;
		}

		function getArc(centerOfCircle, radius, startAngle, endAngle, anticlockwise) {
			return function (canvas) {
				canvas.arc(centerOfCircle.x, centerOfCircle.y, radius, startAngle, endAngle, anticlockwise);
			};
		}

		var startAngle, fistOffset, secondOffset, centerOfCircle, innerRadius, outerRadius;

		startAngle = directionToAngle(currentDirection);
		centerOfCircle = new jracer.Vector();

		// small, medium and large turns
		switch (size) {
		case 1:
			innerRadius = shoulder;

			fistOffset = directionToOffset(gridSize / 2, false);
			rotate(clockwise);
			secondOffset = directionToOffset(gridSize / 2, true);

			// The center of the circle is the (correct) corner of the current grid
			centerOfCircle.x = ((currentPosition.x) * gridSize) + (gridSize / 2) + fistOffset.x + secondOffset.x;
			centerOfCircle.y = (((currentPosition.y) * gridSize) + (gridSize / 2) + fistOffset.y + secondOffset.y);

			moveAhead();
			break;

		case 2:
			innerRadius = (gridSize / 2) + shoulder;

			fistOffset = directionToOffset(gridSize / 2, false);
			rotate(clockwise);
			secondOffset = directionToOffset(gridSize / 2, true);
			moveAhead();

			centerOfCircle.x = ((currentPosition.x) * gridSize) + (gridSize / 2);
			centerOfCircle.y = ((currentPosition.y) * gridSize) + (gridSize / 2);

			rotate(!clockwise);
			moveAhead();
			rotate(clockwise);
			moveAhead();
			break;

		case 3:
			// innerRadius = gridSize * 1.875 + shoulder;
			innerRadius = gridSize * 2 + shoulder;
			// fistOffset = directionToOffset(gridSize * 0.375, false); 
			fistOffset = directionToOffset(gridSize / 2, false);
			rotate(clockwise);
			// secondOffset = directionToOffset(gridSize * 0.375, true);
			secondOffset = directionToOffset(gridSize / 2, true);

			moveAhead();
			moveAhead();

			centerOfCircle.x = ((currentPosition.x) * gridSize) + (gridSize / 2) + fistOffset.x + secondOffset.x;
			centerOfCircle.y = (((currentPosition.y) * gridSize) + (gridSize / 2) + fistOffset.y + secondOffset.y);



			// centerOfCircle.x = ((currentPosition.x) * gridSize) + (gridSize / 2) + fistOffset.x + secondOffset.x;
			// centerOfCircle.y = ((currentPosition.y) * gridSize) + (gridSize / 2) + fistOffset.y + secondOffset.y;
				// x = ((currentPosition.x - 1) * gridSize) + (gridSize / 2) + Firstoffset.x + directionoffset(gridSize * 0.375, true).x;
				// y = canvasDom.height - (((currentPosition.y - 1) * gridSize) + (gridSize / 2) + Firstoffset.y + directionoffset(gridSize * 0.375, true).y);
				// if (clockwise) {
					// outerCircle.push(getArc(x, y, OuterRadius, startAngle, directionToAngle(currentDirection), !clockwise));
					// innerCircle.unshift(getArc(x, y, InnerRadius, directionToAngle(currentDirection), startAngle, clockwise));
				// }
				// else {
					// outerCircle.push(getArc(x, y, InnerRadius, startAngle, directionToAngle(currentDirection), !clockwise));
					// innerCircle.unshift(getArc(x, y, OuterRadius, directionToAngle(currentDirection), startAngle, clockwise));
				// }
			rotate(!clockwise);
			moveAhead();
			moveAhead();
			rotate(clockwise);
			moveAhead();
			break;
		}

		outerRadius = innerRadius + trackWidth;

		if (clockwise) {
			numberOfTurns.right = numberOfTurns.right + 1;
			outerCircle.push(getArc(centerOfCircle, innerRadius, startAngle, directionToAngle(currentDirection), clockwise));
			innerCircle.unshift(getArc(centerOfCircle, outerRadius, directionToAngle(currentDirection), startAngle, !clockwise));
		} else {
			numberOfTurns.left = numberOfTurns.left + 1;
			outerCircle.push(getArc(centerOfCircle, outerRadius, startAngle, directionToAngle(currentDirection), clockwise));
			innerCircle.unshift(getArc(centerOfCircle, innerRadius, directionToAngle(currentDirection), startAngle, !clockwise));
		}
	} // end of drawCircleSegment

	function drawStart() {
		var x = (startingPosition.x + 1) * gridSize + shoulder,
		    y = (startingPosition.y) * gridSize;
		// outerCircle.push(function (canvas) {
			// canvas.moveTo(x, y);
		// });
		// innerCircle.push(function (canvas) {
			// canvas.lineTo(x + trackWidth, y);
		// });
		moveAhead();
	}

	for (index = 0; index < sections.length; index = index + 1) {
		switch (sections[index]) {
		case jracer.Track.START:
			drawStart();
			break;
		case jracer.Track.FINISH:
			break;
		// case jracer.Track.Custom:
			// break;
		case jracer.Track.LEFT_TURN:
			drawCircleSegment(false, 1);
			break;
		case jracer.Track.RIGHT_TURN:
			drawCircleSegment(true, 1);
			break;
		case jracer.Track.WIDE_LEFT_TURN:
			drawCircleSegment(false, 2);
			break;
		case jracer.Track.WIDE_RIGHT_TURN:
			drawCircleSegment(true, 2);
			break;
		case jracer.Track.EXTRA_WIDE_LEFT_TURN:
			drawCircleSegment(false, 3);
			break;
		case jracer.Track.EXTRA_WIDE_RIGHT_TURN:
			drawCircleSegment(true, 3);
			break;
		case jracer.Track.STRAIGHT_AHEAD:
			moveAhead();
			break;
		}
	}

	if (numberOfTurns.right > numberOfTurns.left) {
		var tmp = innerCircle;
		innerCircle = outerCircle;
		outerCircle = tmp;
	}

	this.drawinnerCircle = function (canvas) {
		var index;
		for (index = 0; index < innerCircle.length; index = index + 1) {
			innerCircle[index](canvas);
		}
	};

	this.drawouterCircle = function (canvas) {
		var index;
		for (index = 0; index < outerCircle.length; index = index + 1) {
			outerCircle[index](canvas);
		}
	};
};
