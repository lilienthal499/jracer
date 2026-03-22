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
   * Create an asphalt texture pattern using canvas noise.
   *
   * Process:
   * 1. Create temp canvas with solid gray
   * 2. Extract pixel data as flat RGBA byte array
   * 3. Add random brightness variation to each pixel's RGB
   * 4. Return as tileable pattern
   *
   * @returns {CanvasPattern} Repeatable noise pattern for asphalt texture
   */
  function createAsphaltTexture() {
    // Create small canvas for texture
    const textureSize = 100;
    const textureCanvas = document.createElement('canvas');
    textureCanvas.width = textureSize;
    textureCanvas.height = textureSize;
    const textureCtx = textureCanvas.getContext('2d');

    // Base dark gray
    textureCtx.fillStyle = 'rgb(65,65,65)';
    textureCtx.fillRect(0, 0, textureSize, textureSize);

    // Get raw pixel data and add noise to make it look like grainy asphalt
    const imageData = textureCtx.getImageData(0, 0, textureSize, textureSize);
    const data = imageData.data; // Flat array: [R,G,B,A, R,G,B,A, ...]

    // Step through pixels (4 bytes each) and randomize brightness
    // ImageData is a flat array: [R,G,B,A, R,G,B,A, ...] so step by 4 to process each pixel
    for (let i = 0; i < data.length; i += 4) {
      // Random brightness variation for each pixel
      const variation = (Math.random() - 0.5) * 20;
      const redIndex = i;
      const greenIndex = i + 1;
      const blueIndex = i + 2;
      // alphaIndex = i + 3 would be alpha, left unchanged

      data[redIndex] += variation;
      data[greenIndex] += variation;
      data[blueIndex] += variation;
    }

    // Write modified pixel data back to canvas
    textureCtx.putImageData(imageData, 0, 0);

    // Create repeating pattern from noisy canvas
    return canvas.createPattern(textureCanvas, 'repeat');
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

    // Fill track with asphalt texture
    const asphaltTexture = createAsphaltTexture();
    canvas.fillStyle = asphaltTexture;
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
