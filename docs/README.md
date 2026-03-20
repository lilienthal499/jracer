# JRacer - JavaScript Racing Game 🏎️

My first coding project from 20 years ago (2009-2015)!

## What is JRacer?

A browser-based racing game built entirely in JavaScript with realistic physics simulation. Drive a car around tracks, count laps, and try to beat your best times!

## Version History

### JRacer 2.0 (July 2009)
- My very first version
- Basic physics and rendering
- Simple game loop
- Contains mysterious `sheep.jpg` 🐑

### JRacer 3.0 (October 2009)
- Complete rewrite with modular architecture
- Advanced physics with vectors
- Track builder system
- Published to schulte-rebbelmund.de
- jQuery-based rendering
- This version went live on the web!

### JRacer 3.x Experimental (October 2009)
- Web Workers implementation (cutting edge for 2009!)
- Multi-threaded physics calculations
- Backend/client separation
- Never published - too experimental

### JRacer 4.0 (2014-2015) ⭐ **Final Version**
- Complete professional rewrite after 5 years
- Modern JavaScript patterns with 'use strict'
- No framework dependencies
- JSLint compliant
- **LAP COUNTING!** Finally implemented!
- Grid-based track validation
- Chinese/German bilingual interface
- Sophisticated physics engine

## Features (v4.0)

- ✅ Realistic car physics with forward/lateral velocity
- ✅ Lap counting and timing
- ✅ Track sequence validation (prevents cheating!)
- ✅ Head-Up Display showing speed, lap, and time
- ✅ Grid-based track system
- ✅ Smooth frame management
- ✅ Keyboard controls
- ✅ Multiple tracks support

## Technology

- Pure JavaScript (no frameworks in v4.0!)
- HTML5 Canvas for rendering
- Custom physics engine
- MVC architecture

## Running the Game

Simply open `index.html` in a modern web browser!

Controls:
- Arrow keys to steer
- Accelerate/brake controls

## Development Journey

**2009**: First learned to code, created JRacer 2.0 → 3.0
**2009-2013**: Life happened, career grew
**2014**: Returned to coding with better skills
**2015**: Final version with lap counting - mission accomplished!

The Chinese labels (像素/秒 = pixels/second, 轮 = lap) were added for my wife who I met between versions 3 and 4. ❤️

## File Structure

```
jracer/
├── index.html          Main entry point
├── css/
│   ├── style.css       Game styles
│   ├── main.css        UI framework
│   └── normalize.css   Cross-browser reset
└── js/
    ├── application.js  Bootstrap & MVC controller
    ├── model.js        Data model (car, track, state)
    ├── view.js         Rendering layer & HUD
    ├── controller.js   Keyboard input handling
    ├── physicsengine.js Physics calculations
    ├── framemanager.js Game loop management
    ├── track.js        Track generation
    └── config.js       Configuration
```

## License

This is my personal learning project from 20 years ago. Feel free to learn from it!

## Nostalgia

This project represents my journey from beginner to professional developer. Looking back at the 2009 code makes me smile - I've learned so much! But I'm also proud of what I accomplished back then with limited knowledge.

The fact that I came back 5 years later to finish what I started (lap counting!) shows that good ideas stick with you. 🎯

---

*"My first coding project, preserved for history!"*
