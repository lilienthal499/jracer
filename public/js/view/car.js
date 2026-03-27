/**
 * Car rendering system - draws cars on canvas and manages their DOM representation.
 * Cars are drawn once to a canvas element, then rotated/positioned via CSS transforms.
 */

import { createCachedStyleSetter } from './view.js';

('use strict');

// Registry of car drawing functions - allows for different car types/styles
const carDrawers = {
  // Classic sedan with detailed features
  sedan(ctx, width, length, color) {
    drawBody(ctx, width, length, color);
    drawWindshield(ctx, width, 6, 8);
    drawRearWindow(ctx, width, length, 8);
    drawHeadlights(ctx, width);
    drawTaillights(ctx, width, length);
    drawSideMirrors(ctx, width, length);
  },

  // Formula 1 style - sleek single-seater with narrow body (rectangles only!)
  formula(ctx, width, length, color) {
    // Front wheels (rectangular, exposed on sides)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fillRect(0, length * 0.15, width * 0.12, length * 0.15);
    ctx.fillRect(width * 0.88, length * 0.15, width * 0.12, length * 0.15);

    // Rear wheels (rectangular, exposed on sides)
    ctx.fillRect(0, length * 0.7, width * 0.12, length * 0.2);
    ctx.fillRect(width * 0.88, length * 0.7, width * 0.12, length * 0.2);

    // Nose cone (front pointed section)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(width * 0.35, length * 0.15);
    ctx.lineTo(width * 0.5, 0);
    ctx.lineTo(width * 0.65, length * 0.15);
    ctx.closePath();
    ctx.fill();

    // Front wing (horizontal bar)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width * 0.15, length * 0.12, width * 0.7, 2);

    // Main cockpit body (narrow center section)
    ctx.fillStyle = color;
    ctx.fillRect(width * 0.3, length * 0.15, width * 0.4, length * 0.6);

    // Sidepods (wider sections on sides)
    ctx.fillRect(width * 0.12, length * 0.3, width * 0.15, length * 0.4);
    ctx.fillRect(width * 0.73, length * 0.3, width * 0.15, length * 0.4);

    // Engine cover (rear section)
    ctx.fillRect(width * 0.32, length * 0.75, width * 0.36, length * 0.15);

    // Cockpit opening (driver visible area)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(width * 0.38, length * 0.35, width * 0.24, length * 0.25);

    // Rear wing struts (thin vertical supports)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(width * 0.25, length * 0.88, 2, length * 0.1);
    ctx.fillRect(width * 0.73, length * 0.88, 2, length * 0.1);

    // Rear wing (horizontal aerodynamic element)
    ctx.fillRect(width * 0.15, length * 0.95, width * 0.7, 3);

    // Headlights (small LED strips)
    ctx.fillStyle = 'white';
    ctx.fillRect(width * 0.38, 2, width * 0.1, 3);
    ctx.fillRect(width * 0.55, 2, width * 0.1, 3);

    // Taillights (red rear lights)
    ctx.fillStyle = 'red';
    ctx.fillRect(width * 0.35, length - 3, 4, 2);
    ctx.fillRect(width * 0.61, length - 3, 4, 2);
  },

  // Rally car - boxy, aggressive with racing stripes
  rally(ctx, width, length, color) {
    // Main body with slight rounded corners
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, length);

    // Racing stripes down the center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(width * 0.4, 0, width * 0.08, length);
    ctx.fillRect(width * 0.52, 0, width * 0.08, length);

    // Roll cage (black X pattern visible through windshield)
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.2, length * 0.1);
    ctx.lineTo(width * 0.8, length * 0.4);
    ctx.moveTo(width * 0.8, length * 0.1);
    ctx.lineTo(width * 0.2, length * 0.4);
    ctx.stroke();

    // Roof scoop (air intake)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(width * 0.3, length * 0.45, width * 0.4, length * 0.15);

    // Aggressive headlights (yellow rally lights)
    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(width * 0.25, length * 0.05, 3, 0, 2 * Math.PI);
    ctx.arc(width * 0.75, length * 0.05, 3, 0, 2 * Math.PI);
    ctx.fill();

    // Large taillights
    ctx.fillStyle = 'red';
    ctx.fillRect(2, length - 8, width * 0.3, 6);
    ctx.fillRect(width * 0.7 - 2, length - 8, width * 0.3, 6);

    // Mud flaps
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, length * 0.9, width * 0.15, length * 0.1);
    ctx.fillRect(width * 0.85, length * 0.9, width * 0.15, length * 0.1);
  }
};

/**
 * Draw the main car body rectangle.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Car width in pixels
 * @param {number} length - Car length in pixels
 * @param {string} color - CSS color for car body
 */
function drawBody(ctx, width, length, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, length);
}

/**
 * Draw semi-transparent windshield at front of car.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Car width
 * @param {number} offsetTop - Distance from front of car
 * @param {number} height - Windshield height
 */
function drawWindshield(ctx, width, offsetTop, height) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(2, offsetTop, width - 4, height);
}

/**
 * Draw semi-transparent rear window at back of car.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Car width
 * @param {number} length - Car length
 * @param {number} height - Window height
 */
function drawRearWindow(ctx, width, length, height) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(2, length - 14, width - 4, height);
}

/**
 * Draw white headlights at front corners.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Car width
 */
function drawHeadlights(ctx, width) {
  ctx.fillStyle = 'white';
  ctx.fillRect(1, 1, 4, 4);
  ctx.fillRect(width - 5, 1, 4, 4);
}

/**
 * Draw red taillights at rear corners.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Car width
 * @param {number} length - Car length
 */
function drawTaillights(ctx, width, length) {
  ctx.fillStyle = 'red';
  ctx.fillRect(1, length - 5, 4, 4);
  ctx.fillRect(width - 5, length - 5, 4, 4);
}

/**
 * Draw side mirrors protruding from car body.
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Car width
 * @param {number} length - Car length
 */
function drawSideMirrors(ctx, width, length) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.fillRect(-1, length / 2 - 2, 2, 4);
  ctx.fillRect(width - 1, length / 2 - 2, 2, 4);
}

/**
 * Calculate CSS transform string for car rotation.
 * Normalizes angle and rounds for performance.
 *
 * @param {number} direction - Car direction in radians
 * @returns {string} CSS transform value
 */
function calculateTransform(direction) {
  direction = direction % (2 * Math.PI);
  direction = Math.round(direction * 1000) / 1000;
  return `rotate(${direction}rad)`;
}

/**
 * Create a canvas element with the car drawn on it.
 * The car is drawn once at creation time, not re-rendered each frame.
 *
 * @param {Object} carModel - Car model with dimensions
 * @param {Object} viewConfig - View config with color and optional carType
 * @returns {HTMLCanvasElement} Canvas element with car drawn on it
 */
function createCarDOMElement(carModel, viewConfig) {
  const newDOMElement = window.document.createElement('canvas');
  newDOMElement.className = 'car';
  const { width, length } = carModel.dimensions;
  newDOMElement.width = width;
  newDOMElement.height = length;
  // Center the car on its position by offsetting half its dimensions
  newDOMElement.style.marginLeft = `-${width / 2}px`;
  newDOMElement.style.marginBottom = `-${width / 2}px`;

  // Select drawing function based on car type (allows for different car styles)
  const carType = viewConfig.carType || 'sedan';
  carDrawers[carType](newDOMElement.getContext('2d'), width, length, viewConfig.color);

  return newDOMElement;
}

/**
 * Create a car view component with rotation updates.
 * Base component that only updates car rotation, not position.
 *
 * @param {Object} viewConfig - View configuration (color, carType)
 * @param {Object} carModel - Car model (direction, dimensions, position)
 * @returns {Object} Component with update() and getDOMElement() methods
 */
function createCar(viewConfig, carModel) {
  const DOMElement = createCarDOMElement(carModel, viewConfig);
  const transform = createCachedStyleSetter(DOMElement.style, 'transform');

  function update() {
    transform.set(calculateTransform(carModel.direction));
  }

  function getDOMElement() {
    return DOMElement;
  }

  return { update, getDOMElement };
}

/**
 * Static car view - updates rotation only, not position.
 * Used for the player's own car in their viewport (positioned at center).
 *
 * @param {Object} viewConfig - View configuration
 * @param {Object} carModel - Car model
 * @returns {Object} Car component
 */
export function StaticCar(viewConfig, carModel) {
  return createCar(viewConfig, carModel);
}

/**
 * Moving car view - updates both rotation and position.
 * Used for other players' cars or the player's car in other viewports.
 *
 * @param {Object} viewConfig - View configuration
 * @param {Object} carModel - Car model
 * @returns {Object} Car component with position updates
 */
export function MovingCar(viewConfig, carModel) {
  const car = createCar(viewConfig, carModel);
  const left = createCachedStyleSetter(car.getDOMElement().style, 'left');
  const bottom = createCachedStyleSetter(car.getDOMElement().style, 'bottom');

  function update(frameProgress) {
    car.update(frameProgress);
    // Update position based on car model (rounded to avoid sub-pixel rendering)
    left.set(`${Math.round(carModel.position.x)}px`);
    bottom.set(`${Math.round(carModel.position.y)}px`);
  }

  return { update, getDOMElement: car.getDOMElement };
}
