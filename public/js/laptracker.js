import { model } from './model.js';

export function createLapTracker() {
  'use strict';

  const carTrackers = [];

  function createCarLapTracker(carModel) {
    function updateTrackSegment() {
      const segment = model.track.getSegmentAtPosition(carModel.position.x, carModel.position.y);
      carModel.segment = segment;

      if (segment.type === 'offtrack') {
        return;
      }

      // Lap completion detection
      if (carModel.trackSequence === model.track.sequenceOfSegments.length - 1 && segment.getSequenceNumber() === 1) {
        carModel.round += 1;
        carModel.trackSequence = 1;
        // Trigger lap completion callback if registered
        if (carModel.onLapComplete) {
          carModel.onLapComplete(carModel.round);
        }
      }

      // Checkpoint progression
      if (carModel.trackSequence === segment.getSequenceNumber() - 1) {
        carModel.trackSequence += 1;
        carModel.roundTimes.push(model.frameNumber);
      }
    }

    return { updateTrackSegment };
  }

  function updateAllCars() {
    carTrackers.forEach(tracker => {
      tracker.updateTrackSegment();
    });
  }

  return {
    addCar: function (carModel) {
      carTrackers.push(createCarLapTracker(carModel));
    },
    scheduleUpdates: function (frameManager) {
      frameManager.addFrameListener(updateAllCars);
    }
  };
}
