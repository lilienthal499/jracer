jracer.TrackLoader = function () {
  'use strict';

  // Legacy XMLHttpRequest approach (callback-based)
  this.loadTrack = function (trackNumber, callback) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `tracks/${trackNumber}.json`, true);

    xhr.onload = function () {
      if (xhr.status === 200) {
        try {
          const trackData = JSON.parse(xhr.responseText);
          callback(null, trackData);
        } catch (error) {
          callback(error, null);
        }
      } else {
        callback(new Error(`Failed to load track ${trackNumber}: ${xhr.status}`), null);
      }
    };

    xhr.onerror = function () {
      callback(new Error(`Network error loading track ${trackNumber}`), null);
    };

    xhr.send();
  };

  // Modern fetch approach (Promise-based)
  this.loadTrackSync = function (trackNumber) {
    return fetch(`tracks/${trackNumber}.json`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load track ${trackNumber}: ${response.status}`);
        }
        return response.json();
      });
  };
};
