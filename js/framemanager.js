jracer.FrameManager = function (model) {
  'use strict';

  var running = false,
    lastFrameUpdate,
    frameDuration = model.frameDuration,
    requestAnimationFrameCallback,
    animationFrameId,
    frameListeners = [],
    subFrameListeners = [];

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
  requestAnimationFrameCallback = function (now) {

    // setup
    if (lastFrameUpdate === undefined) {
      lastFrameUpdate = now;
    }

    function getFrameProgress() {
      return (now - lastFrameUpdate) / frameDuration;
    }

    function notifyAboutFrames() {
      while ((now - lastFrameUpdate) >= frameDuration) {
        var index;
        for (index = frameListeners.length - 1; index >= 0; index = index - 1) {
          frameListeners[index]();
        }
        model.frameNumber += 1;
        lastFrameUpdate += frameDuration;
      }
    }

    function notifyAboutSubFrame() {
      var index, subFrameProgress = getFrameProgress();
      for (index = subFrameListeners.length - 1; index >= 0; index = index - 1) {
        subFrameListeners[index](subFrameProgress);
      }
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
