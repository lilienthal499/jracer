jracer.config = {
  screen: {
    height: 600,
    width: 800,
    split: false
  },
  track: {
    number: 1, // Which track to load from tracks/ directory
    gridSize: 400, // Will be overridden by track data
    sections: [], // Will be populated from track JSON
    grid: []
  },
  players: [
    {
      name: '田阳',
      controls: [
        { key: jracer.controller.Keys.UP, code: 87 }, // w
        { key: jracer.controller.Keys.DOWN, code: 83 }, // s
        { key: jracer.controller.Keys.LEFT, code: 65 }, // a
        { key: jracer.controller.Keys.RIGHT, code: 68 }
      ], // d
      view: { color: 'DarkSeaGreen', rotateAndZoom: false },
      maxSteeringAngle: 0.2
    },
    {
      name: '田南',
      controls: [
        { key: jracer.controller.Keys.UP, code: 38 },
        { key: jracer.controller.Keys.DOWN, code: 40 },
        { key: jracer.controller.Keys.LEFT, code: 37 },
        { key: jracer.controller.Keys.RIGHT, code: 39 }
      ],
      view: { color: 'Maroon', rotateAndZoom: true },
      maxSteeringAngle: 0.17
    },
    {
      name: 'Dummy',
      controls: [
        { key: jracer.controller.Keys.UP, code: 73 }, // i
        { key: jracer.controller.Keys.DOWN, code: 75 }, // k
        { key: jracer.controller.Keys.LEFT, code: 74 }, // j
        { key: jracer.controller.Keys.RIGHT, code: 76 }
      ], // l
      view: { color: 'Olive' },
      maxSteeringAngle: 0.15
    }
  ]
};
