import { model } from '../model.js';

/**
 * Draws the racing track to a canvas element.
 * Renders track curves, road markings, and optional debug grid.
 *
 * @param {CanvasRenderingContext2D} canvas - Canvas 2D context to draw on
 * @param {Array} sequenceOfComponents - Track components from model (turns, straights)
 * @param {number} gridSize - Size of one grid cell in pixels
 * @param {boolean} showGrid - Whether to draw debug grid lines
 */
export function Drawer(canvas, sequenceOfComponents, gridSize, showGrid) {
  'use strict';

  /**
   * Draw a single turn component as a circular arc.
   * Draws both inner and outer loop depending on innerLoop parameter.
   *
   * @param {Object} turn - Turn component from model with centerOfCircle, angles, size
   * @param {boolean} innerLoop - True for outer edge, false for inner edge
   */
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
    // Flip angles for counter-clockwise turns
    if (!turn.clockwise) {
      startAngle = (startAngle + Math.PI) % (2 * Math.PI);
      endAngle = (endAngle + Math.PI) % (2 * Math.PI);
    }

    // Calculate radius based on turn size and which edge (inner/outer)
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

  /**
   * Draw road markings: red edge lines, dashed white center, and thin white outline.
   */
  function drawRoadMarkings() {
    // Red edge lines
    canvas.strokeStyle = 'rgb(200,30,30)';
    canvas.lineWidth = gridSize / 10;
    canvas.stroke();

    // Dashed white center line
    canvas.setLineDash([gridSize / 8, gridSize / 8]);
    canvas.strokeStyle = 'rgb(255,255,255)';
    canvas.lineWidth = gridSize / 10;
    canvas.stroke();
    canvas.setLineDash([]);

    // Thin white outer line
    canvas.strokeStyle = 'rgb(255,255,255)';
    canvas.lineWidth = gridSize / 25;
    canvas.stroke();
  }

  /**
   * Draw debug grid lines showing the track grid structure.
   */
  function drawGridLines() {
    canvas.strokeStyle = 'rgba(0,0,0,0.9)';
    canvas.lineWidth = 3;
    const width = model.track.dimensions.width;
    const height = model.track.dimensions.height;

    // Vertical grid lines
    let x = 0;
    while (x <= width) {
      canvas.beginPath();
      canvas.moveTo(x, 0);
      canvas.lineTo(x, height);
      canvas.stroke();
      x += gridSize;
    }

    // Horizontal grid lines
    let y = 0;
    while (y <= height) {
      canvas.beginPath();
      canvas.moveTo(0, y);
      canvas.lineTo(width, y);
      canvas.stroke();
      y += gridSize;
    }
  }

  /**
   * Main drawing routine - renders complete track with multiple passes.
   * Uses canvas compositing operations to create track with inner/outer edges.
   */
  function draw() {
    // Draw outer edges of all turns
    canvas.beginPath();

    sequenceOfComponents.forEach(component => {
      if (component.type === 'turn') {
        drawTurn(component, true);
      }
    });

    canvas.closePath();

    canvas.globalCompositeOperation = 'source-over';

    // Fill track with radial gradient (darker at edges)
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

    // Draw road markings on outer edge
    drawRoadMarkings();

    // Draw inner edges of all turns (creates hollow center)
    canvas.beginPath();

    sequenceOfComponents.forEach(component => {
      if (component.type === 'turn') {
        drawTurn(component, false);
      }
    });
    canvas.closePath();
    // Cut out inner track area
    canvas.globalCompositeOperation = 'destination-out';
    canvas.fill();

    canvas.globalCompositeOperation = 'source-atop';

    // Draw road markings on inner edge
    drawRoadMarkings();

    // Optionally draw debug grid
    if (showGrid) {
      drawGridLines();
    }
  }

  draw();
}
