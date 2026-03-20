# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

JRacer is a browser-based JavaScript racing game with realistic physics simulation, originally developed 2009-2015. This is a pure vanilla JavaScript project with no framework dependencies, using classic MVC architecture and a custom physics engine.

## Essential Commands

```bash
# Development
npm start              # Start dev server at localhost:5500 (auto-opens browser)
npm run dev           # Start dev server without opening browser

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Auto-fix ESLint issues
npm run format        # Format all code with Prettier
npm run validate      # Run both lint and format checks

# VS Code
code jracer.code-workspace  # Open workspace with proper settings
```

## Architecture & Code Organization

### Module Loading Order (Critical)
JavaScript files are loaded via `<script>` tags in `index.html` in **strict dependency order**. This order must be maintained:

1. `application.js` - Creates global `jracer` namespace
2. `model.js` - Game state and data structures
3. `view.js` - Rendering components
4. `framemanager.js` - Game loop timing
5. `controller.js` - Input handling
6. `physicsengine.js` - Physics simulation
7. `track.js` - Track generation system
8. `config.js` - Game configuration (players, track layout)

Bootstrap: `jracer.startup(jracer.config)` is called inline after all scripts load.

### Global Namespace Pattern
All code uses the `jracer` global namespace object to avoid conflicts:
```javascript
jracer.ComponentName = function() { ... }
jracer.subnamespace = {};
jracer.subnamespace.Component = function() { ... }
```

**Do not introduce ES6 modules** - the project intentionally uses classic script loading for compatibility.

### Core Architecture Components

#### Frame Manager (`framemanager.js`)
- Game loop using `requestAnimationFrame`
- Runs at 60 FPS (configurable in `model.js`)
- Two update cycles per frame:
  - **Frame updates** (`addFrameListener`): Physics calculations, discrete logic updates
  - **Sub-frame updates** (`addSubFrameListener`): Interpolated rendering for smooth visuals
- Sub-frame updates receive a `progress` parameter (0-1) for interpolation between frames

#### Physics Engine (`physicsengine.js`)
- Custom realistic car physics (no external library)
- Key systems:
  - **CarPhysicsController**: Per-car physics state machine
  - Tire friction (static vs drifting)
  - Aerodynamic resistance
  - Angular velocity for steering
  - Velocity decomposition (forward/lateral)
- Physics updates happen on frame boundaries, rendering interpolates between states
- Fixed time step: `model.frameDurationInSeconds`

#### Track System (`track.js`)
- **Procedural track generation** from component array
- Components: `START`, `FINISH`, `STRAIGHT`, `LEFT_TURN`, `RIGHT_TURN`, `WIDE_*_TURN`, `EXTRA_WIDE_*_TURN`
- Track generation process:
  1. `SizeMeter` pass: Calculate bounding box
  2. `ModelCreator` pass: Generate grid and sequence
  3. `Track.Drawer`: Render to canvas with visual styling
- **Grid-based collision detection**: Track divided into grid cells, cars query current grid position
- **Sequence tracking**: Each track component has a sequence number for lap counting

#### View System (`view.js`)
- Component-based rendering using DOM manipulation
- Key view types:
  - `SplitScreen`: Multi-player viewport management
  - `Screen`: Individual player view with optional rotate/zoom
  - `MovingTrack` / `StaticTrack`: Two camera modes
  - `Car`: Car rendering with rotation transforms
  - `TireTracks`: Canvas-based tire mark rendering (with drift detection)
  - `HeadUpDisplay`: Speed, lap count, lap times
  - `MiniMap`: Placeholder for track overview
- **DOMProxy pattern**: Caches DOM property values to avoid unnecessary reflows

#### Model (`model.js`)
- Central game state in `jracer.model` object
- `Car` constructor: position, velocity, direction, controls, dimensions, lap tracking
- Frame timing constants (60 FPS default)
- Track grid and dimensions

#### Controller (`controller.js`)
- Keyboard input mapping to car controls
- `Keys` enum: `UP`, `DOWN`, `LEFT`, `RIGHT`
- Maps key codes to control values (-1, 0, 1)
- Multiple players with different key bindings defined in `config.js`

### Data Flow

1. **Input** → Controller updates car control state in model
2. **Frame Update** → PhysicsEngine calculates new car positions/velocities
3. **Track Query** → Cars query track grid for current component (lap detection)
4. **Sub-frame Update** → Views interpolate between last/next frame states
5. **Render** → DOM updates via DOMProxy, canvas drawing for tracks/tire marks

### Configuration (`config.js`)

- Player definitions (names, key bindings, colors, steering sensitivity)
- Track layout as array of component constants
- Camera settings (`rotateAndZoom` per player)

## Code Style Conventions

- **Strict mode**: All functions use `'use strict';`
- **Constructor functions**: Capital case (`jracer.ComponentName`)
- **Private functions**: Nested function declarations
- **Namespace attachment**: All APIs exposed via `this.method = function() {...}` or return objects
- **No arrow functions**: Original codebase predates ES6, maintain consistency
- **Spelling quirks**: Function names like `scheduleNextUpdate` (not "shedule"), `firstOffset` (not "fist") - these typos were recently fixed but watch for similar patterns

## Testing & Debugging

- No automated tests currently implemented
- Manual testing: Run game and verify physics behavior, rendering, lap counting
- VS Code debugging: Launch configurations in `jracer.code-workspace` for Chrome/Firefox
- Browser console logging: Many `console.log` and `console.dir` statements (some commented out)

## Important Implementation Notes

### Physics Gotchas
- `calculateDirection()` must be called before `calculateAcceleration()` in physics update
- Angular velocity persists between frames (car has momentum in turns)
- `notRealizedAcceleration` tracks forces that exceed tire friction (causes drifting)

### Track Generation
- Track must form a closed loop (FINISH returns to START position/direction)
- Grid size determines track scale (default 400px per component)
- Track components use a `Cursor` to track position/direction during generation
- Turn components calculate circle centers for canvas arc rendering

### Rendering Performance
- `DOMProxy` pattern critical for performance - bypasses DOM writes when value unchanged
- Tire tracks drawn to persistent canvas (not cleared each frame)
- Transform matrix caching via DOMProxy for rotations

### Multi-Player Split Screen
- Each player can have independent camera mode (static vs moving, rotating vs fixed)
- `SplitScreen` component orchestrates multiple `Screen` views
- Cars render in each other's views as `MovingCar` instances

## Common Modification Patterns

**Adding a new track component type:**
1. Define constant in `track.js` (e.g., `jracer.Track.HAIRPIN = 'HAIRPIN'`)
2. Add parsing case in `parseSequenceOfComponents()`
3. Create component constructor extending `jracer.Track.Component`
4. Implement cursor movement logic
5. Add rendering logic in `Track.Drawer`

**Adding new physics behavior:**
1. Modify `CarPhysicsController` in `physicsengine.js`
2. Update `calculateAcceleration()` or `calculateDirection()`
3. Ensure changes work with fixed time step
4. Test with different frame rates (modify `model.framesPerSecond`)

**Adding new HUD elements:**
1. Extend `HeadUpDisplay` in `view.js`
2. Create DOM elements in `createDOMElement()`
3. Update values in `this.update()` method
4. Style in `css/style.css`

## Historical Context

This is a personal project from 2009-2015, preserved for historical/educational purposes. The code reflects JavaScript practices from that era:
- Pre-ES6 syntax
- Constructor functions instead of classes
- Manual namespace management
- No module bundler
- Direct DOM manipulation

When modernizing, preserve the vanilla JavaScript nature - this is a learning project demonstrating fundamentals without frameworks.
