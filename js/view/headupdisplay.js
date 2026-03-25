import { createCachedValueSetter } from './view.js';

/**
 * Head-Up Display component showing speed, lap count, and lap times.
 *
 * @param {Object} viewConfig - View configuration (unused currently)
 * @param {Object} carModel - Car model with velocity, round, and roundTimes
 * @param {number} playerId - Unique player identifier for generating HTML IDs
 * @returns {Object} Component with getDOMElement() and update() methods
 */
export function HeadUpDisplay(viewConfig, carModel, playerId) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'headupdisplay';

  function createField(name, labelText) {
    const label = document.createElement('label');
    const inputId = `hud-${playerId}-${name}`;
    label.htmlFor = inputId;
    label.appendChild(document.createTextNode(labelText));
    DOMElement.appendChild(label);

    const input = document.createElement('input');
    input.id = inputId;
    input.type = 'text';
    input.readOnly = true;
    DOMElement.appendChild(input);

    return createCachedValueSetter(input);
  }

  const speed = createField('speed', '像素/秒');
  const round = createField('round', '轮');
  const lastTime = createField('lasttime', 'Zeit');

  function getDOMElement() {
    return DOMElement;
  }

  function update() {
    speed.set(Math.round(carModel.velocity.forward));
    round.set(carModel.round);
    lastTime.set(carModel.roundTimes[carModel.roundTimes.length - 1]);
  }

  update();

  return { getDOMElement, update };
}
