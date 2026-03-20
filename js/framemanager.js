jracer.FrameManager = function (model) {
  'use strict';

  let running = false;
  let lastFrameUpdate;
  const frameDuration = model.frameDuration;
  let animationFrameId;
  const frameListeners = [];
  const subFrameListeners = [];

  function cancelNextupdate() {
    if (animationFrameId !== undefined) {
      window.cancelAnimationFrame(animationFrameId);
      animationFrameId = undefined;
    }
  }

  function sheduleNextUpdate() {
    animationFrameId = window.requestAnimationFrame(requestAnimationFrameCallback);
  }

  // defined via var to allow usage in "sheduleNextUpdate" AND use "sheduleNextUpdate"
  const requestAnimationFrameCallback = function (now) {

    // setup
    if (lastFrameUpdate === undefined) {
      lastFrameUpdate = now;
    }

    function getFrameProgress() {
      return (now - lastFrameUpdate) / frameDuration;
    }

    function notifyAboutFrames() {
      while ((now - lastFrameUpdate) >= frameDuration) {
        frameListeners.forEach((listener) => {
          listener();
        });
        model.frameNumber += 1;
        lastFrameUpdate += frameDuration;
      }
    }

    function notifyAboutSubFrame() {
      const subFrameProgress = getFrameProgress();
      subFrameListeners.forEach((listener) => {
        listener(subFrameProgress);
      });
    }

    notifyAboutFrames();
    notifyAboutSubFrame();
    sheduleNextUpdate();

  };

  return {
    start: function () {
      if (running === false) {
        running = true;
        sheduleNextUpdate();
        console.log('Frame Manager startet.');
      }
    },

    stop: function () {
      if (running === true) {
        running = false;
        cancelNextupdate();
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

};

jracer.frameManager = new jracer.FrameManager(jracer.model);
