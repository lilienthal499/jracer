import { model } from './model.js';

function createFrameManager(modelInstance) {
  'use strict';

  let running = false;
  let lastFrameUpdate;
  const frameDuration = modelInstance.frameDuration;
  let animationFrameId;
  const frameListeners = [];
  const subFrameListeners = [];

  function cancelNextUpdate() {
    if (animationFrameId !== undefined) {
      // BROWSER DEPENDENCY: window.cancelAnimationFrame
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = undefined;
    }
  }

  function requestAnimationFrameCallback(now) {
    // setup
    if (lastFrameUpdate === undefined) {
      lastFrameUpdate = now;
    }

    function getFrameProgress() {
      return (now - lastFrameUpdate) / frameDuration;
    }

    function notifyAboutFrames() {
      while (now - lastFrameUpdate >= frameDuration) {
        frameListeners.forEach(listener => {
          listener();
        });
        modelInstance.frameNumber += 1;
        lastFrameUpdate += frameDuration;
      }
    }

    function notifyAboutSubFrame() {
      const subFrameProgress = getFrameProgress();
      subFrameListeners.forEach(listener => {
        listener(subFrameProgress);
      });
    }

    notifyAboutFrames();
    notifyAboutSubFrame();
    scheduleNextUpdate();
  }

  function scheduleNextUpdate() {
    // BROWSER DEPENDENCY: window.requestAnimationFrame
    animationFrameId = window.requestAnimationFrame(requestAnimationFrameCallback);
  }

  return {
    start: function () {
      if (running === false) {
        running = true;
        scheduleNextUpdate();
        console.log('Frame Manager started.');
      }
    },

    stop: function () {
      if (running === true) {
        running = false;
        cancelNextUpdate();
        console.log('Frame Manager stopped.');
      }
    },

    addFrameListener: function (frameListener) {
      frameListeners.push(frameListener);
    },

    addSubFrameListener: function (subFrameListener) {
      subFrameListeners.push(subFrameListener);
    }
  };
}

export const frameManager = createFrameManager(model);
