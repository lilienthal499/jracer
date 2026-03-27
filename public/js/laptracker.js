import { model } from './model.js';

export function createLapTracker() {
  'use strict';

  const carTrackers = [];
  const cars = [];
  const bestSegmentEntryFrames = {}; // segmentNumber -> earliest frame any car entered it

  function createCarLapTracker(carModel) {
    function updateTrackSegment() {
      const segment = model.track.getSegmentAtPosition(carModel.position.x, carModel.position.y);
      carModel.segment = segment;

      if (segment.type === 'offtrack') {
        return;
      }

      // Lap completion detection
      if (carModel.trackSequence === model.track.sequenceOfSegments.length && segment.getSequenceNumber() === 1) {
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
        // Update latest checkpoint frame for delta comparison
        carModel.latestCheckpointFrame = model.frameNumber;

        // Track best (earliest) entry frame for this segment
        const segNum = carModel.trackSequence;
        if (bestSegmentEntryFrames[segNum] === undefined || model.frameNumber < bestSegmentEntryFrames[segNum]) {
          bestSegmentEntryFrames[segNum] = model.frameNumber;
        }
      }
    }

    return { updateTrackSegment };
  }

  function calculateRankings() {
    // Sort cars by: trackSequence (desc), then latestCheckpointFrame (asc)
    const sorted = [...cars].sort((a, b) => {
      if (a.trackSequence !== b.trackSequence) {
        return b.trackSequence - a.trackSequence; // Higher segment = better
      }
      const aFrame = a.latestCheckpointFrame || Infinity;
      const bFrame = b.latestCheckpointFrame || Infinity;
      return aFrame - bFrame; // Earlier frame = better
    });

    // Assign ranks
    sorted.forEach((car, index) => {
      car.rank = index + 1;
    });

    return sorted[0]; // Return leader (rank 1)
  }

  function updateComparisons() {
    const leader = calculateRankings();

    if (!leader) {
      return;
    }

    cars.forEach(car => {
      if (car === leader) {
        // Leader compares against second-best car in same segment
        const othersInSameSegment = cars.filter(c => c !== car && c.trackSequence === car.trackSequence);
        if (othersInSameSegment.length > 0) {
          // Find the best (earliest) among others in same segment
          const bestOther = othersInSameSegment.reduce((best, c) => {
            const bestFrame = best.latestCheckpointFrame || Infinity;
            const cFrame = c.latestCheckpointFrame || Infinity;
            return cFrame < bestFrame ? c : best;
          });
          // Negative = leader is ahead (entered earlier)
          car.deltaFrames = car.latestCheckpointFrame - bestOther.latestCheckpointFrame;
        } else {
          // Leader alone: show frames since entering segment (negative)
          car.deltaFrames = -(model.frameNumber - car.latestCheckpointFrame);
        }
      } else {
        // Same segment as leader
        if (car.trackSequence === leader.trackSequence) {
          car.deltaFrames = car.latestCheckpointFrame - leader.latestCheckpointFrame;
        } else {
          // Different segment: minimum time behind
          car.deltaFrames = (model.frameNumber - leader.latestCheckpointFrame) + 1;
        }
      }
    });
  }

  function updateAllCars() {
    carTrackers.forEach(tracker => {
      tracker.updateTrackSegment();
    });

    updateComparisons();
  }

  return {
    addCar: function (carModel) {
      carTrackers.push(createCarLapTracker(carModel));
      cars.push(carModel);
    },
    scheduleUpdates: function (frameManager) {
      frameManager.addFrameListener(updateAllCars);
    }
  };
}
