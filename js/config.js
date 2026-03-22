import { Keys } from './controller.js';

export const config = {
  screen: {
    height: 600,
    width: 800,
    split: false
  },
  track: {
    number: 2, // Which track to load from tracks/ directory
    gridSize: 400, // Will be overridden by track data
    sections: [], // Will be populated from track JSON
    grid: [],
    showGrid: true
  },
  players: [
    {
      name: '田阳',
      controls: [
        { key: Keys.UP, code: 87 }, // w
        { key: Keys.DOWN, code: 83 }, // s
        { key: Keys.LEFT, code: 65 }, // a
        { key: Keys.RIGHT, code: 68 }
      ], // d
      view: { color: 'DarkSeaGreen', rotateAndZoom: false },
      maxSteeringAngle: 0.2
    },
    {
      name: '田南',
      controls: [
        { key: Keys.UP, code: 38 },
        { key: Keys.DOWN, code: 40 },
        { key: Keys.LEFT, code: 37 },
        { key: Keys.RIGHT, code: 39 }
      ],
      view: { color: 'Maroon', rotateAndZoom: true },
      maxSteeringAngle: 0.17
    },
    {
      name: 'Dummy',
      controls: [
        { key: Keys.UP, code: 73 }, // i
        { key: Keys.DOWN, code: 75 }, // k
        { key: Keys.LEFT, code: 74 }, // j
        { key: Keys.RIGHT, code: 76 }
      ], // l
      view: { color: 'Olive' },
      maxSteeringAngle: 0.15
    }
  ]
};
