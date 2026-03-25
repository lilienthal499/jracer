import { Vector } from '../vector.js';
import { model } from '../model.js';

/**
 * Tire track rendering system.
 *
 * Renders persistent skid marks when cars drift. Each car's four wheels leave independent
 * tracks with opacity based on lateral velocity (sideways sliding).
 *
 * Rendering: Two-layer canvas composite for depth effect:
 * - Black stroke with 'source-atop' (clips to track)
 * - Dark green stroke with 'destination-over' (shadow layer)
 *
 * Alpha calculation: abs(lateral_velocity) / 1000, capped at 0.5
 * - Left wheels: 2x when sliding right (lateral velocity > 0)
 * - Right wheels: 2x when sliding left (lateral velocity < 0)
 */

/**
 * Creates tire track renderer for a single car.
 * Tracks four wheel positions frame-to-frame and draws line segments when drifting.
 */
function createCarTireTracks(carModel, canvas) {
  const drawers = [];

  // Creates drawer for a single wheel that tracks position and draws line segments
  function createDrawer(offset, alphaSource) {
    const startPosition = new Vector();
    const endPosition = new Vector();
    const rotatedOffset = new Vector();

    return function () {
      const globalAlpha = alphaSource();

      // Shift current position to become start of next segment
      startPosition.copyFrom(endPosition);

      // Calculate wheel's world position by rotating offset by car direction
      rotatedOffset.copyFrom(offset);
      rotatedOffset.rotate(-carModel.direction);

      endPosition.x = carModel.position.x + rotatedOffset.x;
      endPosition.y = carModel.position.y + rotatedOffset.y;

      // Only draw if wheel moved AND is drifting (alpha > threshold)
      if (!startPosition.equals(endPosition)) {
        if (globalAlpha > 0.01) {
          canvas.beginPath();
          canvas.moveTo(startPosition.x, startPosition.y);
          canvas.lineTo(endPosition.x, endPosition.y);

          // Layer 1: Black tire mark clipped to track bounds
          canvas.lineWidth = 3;
          canvas.globalAlpha = globalAlpha;
          canvas.strokeStyle = 'rgb(0,0,0)';
          canvas.globalCompositeOperation = 'source-atop';
          canvas.stroke();

          // Layer 2: Dark green shadow for depth effect
          canvas.globalAlpha = globalAlpha * 0.9;
          canvas.strokeStyle = 'rgb(0,100,0)';
          canvas.globalCompositeOperation = 'destination-over';
          canvas.stroke();
        }
      }
    };
  }

  function calculateGlobalAlpha(velocity) {
    return Math.min(Math.abs(velocity) / 1000, 1);
  }

  function calculateLeftGlobalAlpha() {
    let globalAlpha = calculateGlobalAlpha(carModel.velocity.lateral);
    globalAlpha *= carModel.velocity.lateral > 0 ? 2 : 1; // 2x when sliding right
    return Math.min(globalAlpha, 0.5);
  }

  function calculateRightGlobalAlpha() {
    let globalAlpha = calculateGlobalAlpha(carModel.velocity.lateral);
    globalAlpha *= carModel.velocity.lateral < 0 ? 2 : 1; // 2x when sliding left
    return Math.min(globalAlpha, 0.5);
  }

  // Initialize four wheel drawers: FL, FR, BL, BR
  function setUpCanvasDrawers() {
    const { wheelbase, trackWidth } = carModel.dimensions;

    // Calculate wheel offsets from car center
    const frontRightOffset = new Vector(trackWidth / 2, wheelbase / 2);
    const frontLeftOffset = new Vector(-trackWidth / 2, wheelbase / 2);
    const backRightOffset = new Vector(trackWidth / 2, -wheelbase / 2);
    const backLeftOffset = new Vector(-trackWidth / 2, -wheelbase / 2);

    // Create drawer for each wheel
    drawers.push(createDrawer(frontRightOffset, calculateRightGlobalAlpha));
    drawers.push(createDrawer(backRightOffset, calculateRightGlobalAlpha));
    drawers.push(createDrawer(backLeftOffset, calculateLeftGlobalAlpha));
    drawers.push(createDrawer(frontLeftOffset, calculateLeftGlobalAlpha));
  }

  setUpCanvasDrawers();
  canvas.lineCap = 'butt';

  return {
    update() {
      drawers.forEach(drawer => drawer());
    }
  };
}

/**
 * TireTracks component - manages persistent canvas for all cars' tire marks.
 *
 * Creates full-screen canvas that accumulates tire tracks across frames.
 * Cars rendered in reverse order for proper z-ordering.
 * Canvas never cleared - tire marks persist throughout race.
 */
export function TireTracks(carModels) {
  const carTireTracks = [];

  const DOMElement = document.createElement('canvas');
  DOMElement.className = 'tireTracks';
  DOMElement.width = model.track.dimensions.width;
  DOMElement.height = model.track.dimensions.height;

  const canvasContext = DOMElement.getContext('2d');

  carModels.forEach((carModel) => {
    carTireTracks.push(createCarTireTracks(carModel, canvasContext));
  });

  function getDOMElement() {
    return DOMElement;
  }

  function update() {
    carTireTracks.slice().reverse().forEach((track) => {
      track.update();
    });
  }

  function getCanvas() {
    return canvasContext;
  }

  return { getDOMElement, update, getCanvas };
}
