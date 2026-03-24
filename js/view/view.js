import { Vector } from '../vector.js';
import { model } from '../model.js';

'use strict';

export function createCachedStyleSetter(style, property) {
  let oldValue = null;

  function set(value) {
    if (value !== oldValue) {
      style[property] = value;
      oldValue = value;
    }
  }

  return { set };
}

export function SplitScreen(viewConfig, screenViews, minimapView) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'splitScreen';

  DOMElement.appendChild(minimapView.getDOMElement());
  screenViews.forEach((view) => {
    DOMElement.appendChild(view.getDOMElement());
  });

  function update(frameProgress) {
    screenViews.forEach((view) => {
      view.update(frameProgress);
    });
  }

  function getDOMElement() {
    return DOMElement;
  }

  return { update, getDOMElement };
}

function createAverageCalculator(initialValue, numberOfValues) {
  const values = [];
  let sum = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (let index = 0; index < numberOfValues; index += 1) {
    values.push(initialValue);
    sum += initialValue;
  }

  function add(value) {
    values.unshift(value);
    sum += value;
    sum -= values.pop();
  }

  function getAverage() {
    return sum / numberOfValues;
  }

  return { add, getAverage };
}

export function Screen(viewConfig, trackView, carView, carModel, tachometerView) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'screen';

  const centralPixelDOMElement = document.createElement('div');
  centralPixelDOMElement.className = 'centralPixel';

  DOMElement.appendChild(centralPixelDOMElement);
  DOMElement.appendChild(tachometerView.getDOMElement());
  centralPixelDOMElement.appendChild(trackView.getDOMElement());

  const rotateAndZoom = viewConfig.rotateAndZoom ? createRotateAndZoom() : null;

  function createRotateAndZoom() {
    let averageScaleCalculator;
    let averageRotateCalculator;

    const transform = createCachedStyleSetter(centralPixelDOMElement.style, 'transform');

    function calculateRotate(carDirection) {
      if (!averageRotateCalculator) {
        averageRotateCalculator = createAverageCalculator(carDirection, 100);
      }

      averageRotateCalculator.add(carDirection);
      carDirection = Math.round(averageRotateCalculator.getAverage() * 1000) / 1000;
      return `rotate(${carDirection}rad)`;
    }

    function calculateScale(velocity) {
      const MAX_ZOOM_FACTOR = 0.7;
      const MIN_ZOOM_FACTOR = 1;
      let targetZoomFactor;

      targetZoomFactor = 1 - velocity / 800;

      if (targetZoomFactor < MAX_ZOOM_FACTOR) {
        targetZoomFactor = MAX_ZOOM_FACTOR;
      }

      if (targetZoomFactor > MIN_ZOOM_FACTOR) {
        targetZoomFactor = MIN_ZOOM_FACTOR;
      }

      if (!averageScaleCalculator) {
        averageScaleCalculator = createAverageCalculator(targetZoomFactor, 100);
      }

      averageScaleCalculator.add(targetZoomFactor);
      targetZoomFactor = Math.round(averageScaleCalculator.getAverage() * 1000) / 1000;
      return `scale(${targetZoomFactor})`;
    }

    return function () {
      transform.set(`${calculateRotate(-carModel.direction)} ${calculateScale(carModel.velocity.forward + Math.abs(carModel.velocity.lateral))}`);
    };
  }

  function update(frameProgress) {
    if (rotateAndZoom) {
      rotateAndZoom();
    }

    trackView.update();
    if (carView) {
      carView.update();
    }
    tachometerView.update();
  }

  function getDOMElement() {
    return DOMElement;
  }

  update();

  return { update, getDOMElement };
}

function createTrack(carViews) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'track';

  function addCarViews() {
    carViews.forEach((view) => {
      DOMElement.appendChild(view.getDOMElement());
    });
  }

  function update() {
    carViews.forEach((view) => {
      view.update();
    });
  }

  function getDOMElement() {
    return DOMElement;
  }

  return { addCarViews, update, getDOMElement };
}

export function MovingTrack(viewConfig, carModel, carViews, tireTracksView) {
  const track = createTrack(carViews);
  const originalOffset = new Vector(0, 0);
  const rotatedOffset = new Vector();

  const left = createCachedStyleSetter(track.getDOMElement().style, 'left');
  const bottom = createCachedStyleSetter(track.getDOMElement().style, 'bottom');

  track.getDOMElement().appendChild(tireTracksView.getDOMElement());
  track.addCarViews();

  function update() {
    track.update();
    rotatedOffset.copyFrom(originalOffset);
    rotatedOffset.rotate(-carModel.direction);
    left.set(`${-Math.round(carModel.position.x + rotatedOffset.x)}px`);
    bottom.set(`${-Math.round(carModel.position.y + rotatedOffset.y)}px`);
  }

  update();

  return { update, getDOMElement: track.getDOMElement };
}

/**
 * Creates a tire track rendering system for a single car.
 *
 * This function generates visual tire marks on the track canvas that persist across frames,
 * creating realistic skid marks when the car drifts or slides laterally. Each of the car's
 * four wheels leaves its own track based on the car's lateral velocity (sideways sliding).
 *
 * Architecture:
 * - Creates 4 independent "drawer" functions, one per wheel (FR, BR, BL, FL)
 * - Each drawer tracks the wheel's position from frame to frame
 * - Draws lines between consecutive positions when the car is drifting
 * - Opacity scales with lateral velocity (faster sideways motion = darker marks)
 *
 * Rendering technique:
 * - Uses Canvas2D persistent drawing (tire tracks accumulate on canvas)
 * - Two-layer composite approach for visual depth:
 *   1. Black stroke with 'source-atop' (clips to track boundaries)
 *   2. Dark green stroke with 'destination-over' (background layer for depth)
 * - Alpha channel varies from 0 (no drift) to 0.5 (heavy drift)
 *
 * Alpha calculation logic:
 * - Based on car's lateral velocity (sideways movement perpendicular to direction)
 * - Formula: abs(lateral_velocity) / 1000, capped at 0.5
 * - Left/right wheels get 2x multiplier when sliding in their respective directions
 * - Front/back wheel contributions currently disabled (TODO in code)
 *
 * Physics integration:
 * - Lateral velocity comes from PhysicsEngine decomposition of car velocity
 * - When lateral velocity > 0: car sliding right (left wheels mark more)
 * - When lateral velocity < 0: car sliding left (right wheels mark more)
 * - Related to carModel.velocity.drifting flag set by physics engine
 *
 * @param {Object} carModel - The car model from jracer.model containing:
 *   - position: Current car position {x, y}
 *   - direction: Car heading angle in radians
 *   - velocity.lateral: Sideways velocity component (drives opacity)
 *   - dimensions: {wheelbase, trackWidth} for wheel positioning
 * @param {CanvasRenderingContext2D} canvas - 2D rendering context for persistent track canvas
 * @returns {Object} API with update() method called each frame to draw new tire marks
 */
function createCarTireTracks(carModel, canvas) {
  const drawers = [];

  /**
   * Creates a drawer function for a single wheel's tire track.
   *
   * This closure maintains state for one wheel position across frames, drawing
   * line segments to connect consecutive wheel positions when drifting occurs.
   *
   * @param {Vector} offset - Wheel position relative to car center (before rotation)
   * @param {Function} alphaSource1 - Front/back alpha contribution (currently unused)
   * @param {Function} alphaSource2 - Left/right alpha contribution (based on lateral velocity)
   * @returns {Function} Update function that draws tire track segment for current frame
   */
  function createDrawer(offset, alphaSource1, alphaSource2) {
    // Track wheel position from previous frame to current frame
    const startPosition = new Vector();
    const endPosition = new Vector();
    const rotatedOffset = new Vector();

    return function () {
      // Combine front/back and left/right contributions (range: 0 to 0.5)
      const globalAlpha = alphaSource1() + alphaSource2();

      // Shift current position to become start of next segment
      startPosition.copyFrom(endPosition);

      // Calculate wheel's world position by rotating offset by car direction
      rotatedOffset.copyFrom(offset);
      rotatedOffset.rotate(-carModel.direction); // Negative for coordinate system

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
          canvas.globalCompositeOperation = 'source-atop'; // Only draw on existing track
          canvas.stroke();

          // Layer 2: Dark green shadow for depth effect
          canvas.globalAlpha = globalAlpha * 0.9;
          canvas.strokeStyle = 'rgb(0,100,0)';
          canvas.globalCompositeOperation = 'destination-over'; // Draw behind black
          canvas.stroke();
        }
      }
    };
  }

  /**
   * Base alpha calculation from velocity magnitude.
   * Converts velocity (px/s) to opacity value (0-1).
   *
   * @param {number} velocity - Velocity component in pixels/second
   * @returns {number} Alpha value between 0 and 1
   */
  function calculateGlobalAlpha(velocity) {
    return Math.min(Math.abs(velocity) / 1000, 1);
  }

  /**
   * Front wheel tire track contribution (currently disabled).
   * TODO: Could be based on forward acceleration/braking
   */
  function calculateFrontGlobalAlpha() {
    return 0;//TODO
  }

  /**
   * Back wheel tire track contribution (currently disabled).
   * TODO: Could be based on rear wheel drive/braking
   */
  function calculateBackGlobalAlpha() {
    return 0;//TODO
  }

  /**
   * Left wheel tire track opacity based on lateral velocity.
   * Left wheels mark more when car slides RIGHT (positive lateral velocity).
   *
   * @returns {number} Alpha value 0-0.5
   */
  function calculateLeftGlobalAlpha() {
    let globalAlpha = calculateGlobalAlpha(carModel.velocity.lateral);
    globalAlpha *= carModel.velocity.lateral > 0 ? 2 : 1; // 2x when sliding right
    return Math.min(globalAlpha, 0.5); // Cap at 0.5
  }

  /**
   * Right wheel tire track opacity based on lateral velocity.
   * Right wheels mark more when car slides LEFT (negative lateral velocity).
   *
   * @returns {number} Alpha value 0-0.5
   */
  function calculateRightGlobalAlpha() {
    let globalAlpha = calculateGlobalAlpha(carModel.velocity.lateral);
    globalAlpha *= carModel.velocity.lateral < 0 ? 2 : 1; // 2x when sliding left
    return Math.min(globalAlpha, 0.5); // Cap at 0.5
  }

  /**
   * Initialize the four wheel drawers with their positions and alpha functions.
   *
   * Wheel layout (from car's perspective):
   *   FL --- FR    (front)
   *    |  ^  |
   *   BL --- BR    (back)
   *
   * Each wheel gets:
   * - Offset position relative to car center (±trackWidth/2, ±wheelbase/2)
   * - Front/back alpha function (currently returns 0)
   * - Left/right alpha function (responds to lateral velocity)
   */
  function setUpCanvasDrawers() {
    const { wheelbase, trackWidth } = carModel.dimensions;

    // Start with front-right, then derive others by negating components
    const frontRightOffset = new Vector(trackWidth / 2, wheelbase / 2);

    const frontLeftOffset = frontRightOffset.copy();
    frontRightOffset.x = -frontRightOffset.x; // Flip to left side

    const backRightOffset = frontRightOffset.copy();
    backRightOffset.y = -backRightOffset.y; // Move to back

    const backLeftOffset = backRightOffset.copy();
    backLeftOffset.x = -backLeftOffset.x; // Flip to left side

    // Create drawer for each wheel with appropriate alpha functions
    drawers.push(createDrawer(frontRightOffset, calculateFrontGlobalAlpha, calculateRightGlobalAlpha));
    drawers.push(createDrawer(backRightOffset, calculateBackGlobalAlpha, calculateRightGlobalAlpha));
    drawers.push(createDrawer(backLeftOffset, calculateBackGlobalAlpha, calculateLeftGlobalAlpha));
    drawers.push(createDrawer(frontLeftOffset, calculateFrontGlobalAlpha, calculateLeftGlobalAlpha));
  }

  setUpCanvasDrawers();
  canvas.lineCap = 'butt'; // Square line endings for tire tracks

  /**
   * Update function called each frame to draw new tire track segments.
   * Calls all four wheel drawers in sequence.
   */
  function update() {
    drawers[0](); // Front right
    drawers[1](); // Back right
    drawers[2](); // Back left
    drawers[3](); // Front left
  }

  return { update };
}

/**
 * TireTracks component - manages the persistent canvas for all cars' tire marks.
 *
 * Creates a full-screen canvas that accumulates tire tracks across all frames.
 * Each car gets its own tire track renderer via createCarTireTracks().
 *
 * Rendering order:
 * - Cars updated in REVERSE order (last car drawn first)
 * - This ensures proper z-ordering when cars overlap
 *
 * Canvas properties:
 * - Size matches full track dimensions (model.track.dimensions)
 * - Positioned absolutely to align with track coordinate system
 * - Never cleared - tire marks persist throughout the race
 *
 * Integration:
 * - Created by Screen component during viewport setup
 * - update() called each frame by frame manager sub-frame listener
 * - Canvas context shared among all car tire track renderers
 *
 * @param {Object} viewConfig - View configuration (currently unused by tire tracks)
 * @param {Array<Object>} carModels - Array of car model objects from jracer.model
 * @returns {Object} API with getDOMElement(), update(), and getCanvas() methods
 */
export function TireTracks(viewConfig, carModels) {
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

export function HeadUpDisplay(viewConfig, carModel) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'headupdisplay';

  let label;

  label = document.createElement('label');
  label.appendChild(document.createTextNode('像素/秒'));
  DOMElement.appendChild(label);
  const speed = document.createElement('span');
  DOMElement.appendChild(speed);

  label = document.createElement('label');
  label.appendChild(document.createTextNode('轮'));
  DOMElement.appendChild(label);
  const round = document.createElement('span');
  DOMElement.appendChild(round);

  label = document.createElement('label');
  label.appendChild(document.createTextNode('Zeit'));
  DOMElement.appendChild(label);
  const lastTime = document.createElement('span');
  DOMElement.appendChild(lastTime);

  function getDOMElement() {
    return DOMElement;
  }

  function update() {
    speed.textContent = Math.round(carModel.velocity.forward);
    round.textContent = carModel.round;
    lastTime.textContent = carModel.roundTimes[carModel.roundTimes.length - 1];
  }

  update();

  return { getDOMElement, update };
}

export function MiniMap(viewConfig) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'miniMap';

  function getDOMElement() {
    return DOMElement;
  }

  return { getDOMElement };
}
