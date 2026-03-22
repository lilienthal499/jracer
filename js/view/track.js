import { model } from '../model.js';

export function Drawer(canvas, sequenceOfComponents, gridSize, showGrid) {
  'use strict';
  function drawTurn(turn, innerLoop) {
    let turnSize = turn.size;
    let startAngle;
    let endAngle;
    let radius;
    if (turn.size === 2) {
      turnSize = 2;
    }
    startAngle = turn.startCardinalDirection;
    endAngle = turn.endCardinalDirection;
    if (!turn.clockwise) {
      startAngle = (startAngle + Math.PI) % (2 * Math.PI);
      endAngle = (endAngle + Math.PI) % (2 * Math.PI);
    }

    if (innerLoop !== turn.clockwise) {
      radius = gridSize * (turnSize - 0.7);
    } else {
      radius = gridSize * (turnSize - 0.3);
    }

    canvas.arc(
      turn.centerOfCircle.x * gridSize,
      turn.centerOfCircle.y * gridSize,
      radius,
      startAngle,
      endAngle,
      turn.clockwise
    );
  }

  function drawGridLines() {
    canvas.strokeStyle = 'rgba(0,0,0,0.9)';
    canvas.lineWidth = 3;
    const width = model.track.dimensions.width;
    const height = model.track.dimensions.height;

    let x = 0;
    while (x <= width) {
      canvas.beginPath();
      canvas.moveTo(x, 0);
      canvas.lineTo(x, height);
      canvas.stroke();
      x += gridSize;
    }

    let y = 0;
    while (y <= height) {
      canvas.beginPath();
      canvas.moveTo(0, y);
      canvas.lineTo(width, y);
      canvas.stroke();
      y += gridSize;
    }
  }

  function draw() {
    canvas.beginPath();

    sequenceOfComponents.forEach(component => {
      if (component.type === 'turn') {
        drawTurn(component, true);
      }
    });

    canvas.closePath();

    canvas.globalCompositeOperation = 'source-over';

    const gradient = canvas.createRadialGradient(
      model.track.dimensions.width / 2,
      model.track.dimensions.height / 2,
      100,
      model.track.dimensions.width / 2,
      model.track.dimensions.height / 2,
      Math.max(
        model.track.dimensions.width,
        model.track.dimensions.height
      )
    );
    gradient.addColorStop(0, 'rgb(75,75,75)');
    gradient.addColorStop(0.5, 'rgb(60,60,60)');
    gradient.addColorStop(1, 'rgb(50,50,50)');
    canvas.fillStyle = gradient;
    canvas.fill();

    canvas.globalCompositeOperation = 'source-atop';

    canvas.strokeStyle = 'rgb(200,30,30)';
    canvas.lineWidth = gridSize / 10;
    canvas.stroke();

    canvas.setLineDash([gridSize / 8, gridSize / 8]);
    canvas.strokeStyle = 'rgb(255,255,255)';
    canvas.lineWidth = gridSize / 10;
    canvas.stroke();
    canvas.setLineDash([]);

    canvas.strokeStyle = 'rgb(255,255,255)';
    canvas.lineWidth = gridSize / 25;
    canvas.stroke();

    canvas.beginPath();

    sequenceOfComponents.forEach(component => {
      if (component.type === 'turn') {
        drawTurn(component, false);
      }
    });
    canvas.closePath();
    canvas.globalCompositeOperation = 'destination-out';
    canvas.fill();

    canvas.globalCompositeOperation = 'source-atop';

    canvas.strokeStyle = 'rgb(200,30,30)';
    canvas.lineWidth = gridSize / 10;
    canvas.stroke();

    canvas.setLineDash([gridSize / 8, gridSize / 8]);
    canvas.strokeStyle = 'rgb(255,255,255)';
    canvas.lineWidth = gridSize / 10;
    canvas.stroke();
    canvas.setLineDash([]);

    canvas.strokeStyle = 'rgb(255,255,255)';
    canvas.lineWidth = gridSize / 25;
    canvas.stroke();

    if (showGrid) {
      drawGridLines();
    }
  }

  draw();
}
