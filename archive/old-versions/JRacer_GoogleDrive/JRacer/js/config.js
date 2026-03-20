/*global jracer*/
jracer.config = {
	screen: {
		height: 600,
		width: 800,
		split: false
	},
	track: {
		/*height: 2000,
		width: 2000,
		startposition: {
			x: 1000,
			y: 1000
		},*/
		gridSize: 400,
		sections: [
            // jracer.Track.START,
            // jracer.Track.RIGHT_TURN,
            // jracer.Track.STRAIGHT,
            // jracer.Track.RIGHT_TURN,
            // jracer.Track.STRAIGHT,
            // jracer.Track.RIGHT_TURN,
            // jracer.Track.STRAIGHT,
            // jracer.Track.RIGHT_TURN,
            // jracer.Track.FINISH],
            jracer.Track.START,
            jracer.Track.LEFT_TURN,
            jracer.Track.RIGHT_TURN,
            jracer.Track.RIGHT_TURN,
            jracer.Track.WIDE_RIGHT_TURN,
            jracer.Track.LEFT_TURN,
            jracer.Track.LEFT_TURN,
            jracer.Track.STRAIGHT,
            jracer.Track.RIGHT_TURN,
            jracer.Track.RIGHT_TURN,
            jracer.Track.LEFT_TURN,
            jracer.Track.RIGHT_TURN,
            jracer.Track.EXTRA_WIDE_RIGHT_TURN,
            jracer.Track.WIDE_RIGHT_TURN,
            jracer.Track.FINISH],
		grid: []
	},
	players : [        
        {
            name: '田阳',
            controls: [ { key: jracer.controller.Keys.UP, code: 87 },       // w
                        { key: jracer.controller.Keys.DOWN, code: 83 },     // s
                        { key: jracer.controller.Keys.LEFT, code: 65 },     // a
                        { key: jracer.controller.Keys.RIGHT, code: 68 } ],  // d
            view: { color: "DarkSeaGreen",
                    rotateAndZoom: false },
            maxSteeringAngle: 0.2
        },
        {
            name: '田南',
            controls: [ { key: jracer.controller.Keys.UP, code: 38 },
                        { key: jracer.controller.Keys.DOWN, code: 40 },
                        { key: jracer.controller.Keys.LEFT, code: 37 },
                        { key: jracer.controller.Keys.RIGHT, code: 39 } ],
            view: { color: "Maroon",
					rotateAndZoom: true },
            maxSteeringAngle: 0.17
        },
		{
			name: 'Dummy',
			controls: [ { key: jracer.controller.Keys.UP, code: 73 },		// i
						{ key: jracer.controller.Keys.DOWN, code: 75 },		// k
						{ key: jracer.controller.Keys.LEFT, code: 74 },		// j
						{ key: jracer.controller.Keys.RIGHT, code: 76 } ],	// l
			view: { color: "Olive" },
			maxSteeringAngle: 0.15
		}
	]
};