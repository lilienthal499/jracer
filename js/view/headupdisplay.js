/**
 * Head-Up Display component showing speed, lap count, and lap times.
 *
 * @param {Object} viewConfig - View configuration (unused currently)
 * @param {Object} carModel - Car model with velocity, round, and roundTimes
 * @param {number} playerId - Unique player identifier for generating HTML IDs
 * @param {Object} trackModel - Track model with sequenceOfSegments
 * @returns {Object} Component with getDOMElement() and update() methods
 */

function createCachedPropertySetter(element, property) {
  let oldValue = null;

  function set(value) {
    if (value !== oldValue) {
      element[property] = value;
      oldValue = value;
    }
  }

  return { set };
}

export function HeadUpDisplay(viewConfig, carModel, playerId, trackModel) {
  const DOMElement = document.createElement('div');
  DOMElement.className = 'headupdisplay';

  function createMeterField(name, labelText, min, max) {
    const label = document.createElement('label');
    const meterId = `hud-${playerId}-${name}`;
    label.htmlFor = meterId;
    label.appendChild(document.createTextNode(labelText));
    DOMElement.appendChild(label);

    const meter = document.createElement('meter');
    meter.id = meterId;
    meter.min = min;
    meter.max = max;
    DOMElement.appendChild(meter);

    return createCachedPropertySetter(meter, 'value');
  }

  function createProgressField(name, labelText, max) {
    const label = document.createElement('label');
    const progressId = `hud-${playerId}-${name}`;
    label.htmlFor = progressId;
    label.appendChild(document.createTextNode(labelText));
    DOMElement.appendChild(label);

    const progress = document.createElement('progress');
    progress.id = progressId;
    progress.max = max;
    DOMElement.appendChild(progress);

    return createCachedPropertySetter(progress, 'value');
  }

  function createOutputField(name, labelText) {
    const label = document.createElement('label');
    const outputId = `hud-${playerId}-${name}`;
    label.htmlFor = outputId;
    label.appendChild(document.createTextNode(labelText));
    DOMElement.appendChild(label);

    const output = document.createElement('output');
    output.id = outputId;
    DOMElement.appendChild(output);

    return createCachedPropertySetter(output, 'textContent');
  }

  function createTimeField(name, labelText) {
    const label = document.createElement('label');
    const timeId = `hud-${playerId}-${name}`;
    label.htmlFor = timeId;
    label.appendChild(document.createTextNode(labelText));
    DOMElement.appendChild(label);

    const time = document.createElement('time');
    time.id = timeId;
    DOMElement.appendChild(time);

    return createCachedPropertySetter(time, 'textContent');
  }

  // Get track length from track model
  const trackLength = trackModel.sequenceOfSegments.length;

  const speed = createMeterField('speed', '像素/秒', 0, 400);
  const round = createOutputField('round', '轮');
  const lastTime = createTimeField('lasttime', 'Zeit');
  const currentSegment = createProgressField('currentsegment', 'Current Segment', trackLength);
  const onTrack = createOutputField('ontrack', 'On Track');

  function getDOMElement() {
    return DOMElement;
  }

  function update() {
    speed.set(Math.round(carModel.velocity.forward));
    round.set(carModel.round);
    lastTime.set(carModel.roundTimes[carModel.roundTimes.length - 1]);
    currentSegment.set(carModel.segment.getSequenceNumber());
    onTrack.set(carModel.isOnTrack() ? 'Yes' : 'No');
  }

  update();

  return { getDOMElement, update };
}
