# Browser Dependencies in JRacer

This document lists all browser-specific APIs and DOM dependencies in the codebase. These prevent certain modules from running in Node.js without adaptation.

## Core Modules (js/)

### framemanager.js
**Purpose**: Game loop using browser's animation frame API

Browser dependencies:
- `window.requestAnimationFrame` (line 53) - Schedules next frame update
- `window.cancelAnimationFrame` (line 15) - Cancels scheduled frame

**Why needed**: Syncs game loop with browser's repaint cycle for smooth 60fps rendering

**Backend alternative**: `backend/simulate.js` uses a simple for loop instead

---

### application.js
**Purpose**: Main application entry point and initialization

Browser dependencies:
- `fetch()` API (lines 15, 18) - Loads config.json and track data files
- `document.addEventListener()` (lines 77-78) - Registers keyboard event handlers
- `window.document.createElement()` (line 146) - Creates dummy input element
- `window.document.body.appendChild()` (lines 142, 149) - Adds elements to DOM
- `window.setTimeout()` (line 154) - Delays game start by 1 second

**Why needed**:
- Fetch: Load configuration asynchronously
- DOM events: Capture keyboard input from user
- DOM manipulation: Display game UI
- setTimeout: Give browser time to render UI before starting physics

**Backend alternative**:
- Use `fs.readFileSync()` instead of fetch
- Skip keyboard/DOM setup for playback-only simulation
- Call `frameManager.start()` directly without delay

---

### controller.js
**Purpose**: Input handling (keyboard, playback, recording)

Browser dependencies:
- **None** - This module is browser-independent!
- Note: `createKeyboardController` handles keyboard events, but the events themselves come from `application.js` via `document.addEventListener()`

**Why this matters**: Controller logic can run in Node.js for testing. Only the event source (keyboard) is browser-specific.

---

## View Modules (js/view/)

All view modules contain extensive browser dependencies for DOM manipulation and rendering:

### view.js, car.js, headupdisplay.js, track.js, tiretracks.js
**Purpose**: Visual rendering using DOM and Canvas

Common browser dependencies:
- `document.createElement()` - Create DOM elements
- `canvas.getContext('2d')` - Get canvas rendering context
- Direct DOM manipulation (setting `element.style`, `innerHTML`, etc.)
- Canvas 2D rendering API

**Why needed**: All visual output

**Backend note**: Not needed for headless simulation

---

## Summary by Category

### Essential for Physics (needed in backend):
- ✅ **model.js** - No browser dependencies
- ✅ **physicsengine.js** - No browser dependencies
- ✅ **track.js** - No browser dependencies
- ✅ **vector.js** - No browser dependencies
- ✅ **controller.js** - No browser dependencies (core logic)

### Browser-Only (not needed in backend):
- ❌ **framemanager.js** - Uses `requestAnimationFrame`
- ❌ **application.js** (partially) - Uses fetch, DOM, setTimeout
- ❌ **All view/** modules - Extensive DOM/Canvas usage

### Hybrid (can work in both with adaptation):
- 🔄 **application.js** - Core logic (`initializeGame`) is portable, but `startup()` and `attachInputSources()` use browser APIs
- 🔄 **controller.js** - Core controllers are portable, keyboard event handling requires browser

---

## Running Without Browser

To run the physics simulation in Node.js:

1. **Replace frameManager** with simple loop (see `backend/simulate.js`)
2. **Replace fetch** with `fs.readFileSync()`
3. **Skip view modules** entirely
4. **Skip keyboard input** - use playback controller instead
5. **Call physics/controller updates** manually in loop

Example: `backend/simulate.js` demonstrates a complete headless simulation.

---

## Design Philosophy

The architecture cleanly separates:
- **Physics/Logic** (browser-independent) → Can run in Node.js for testing
- **Input/Timing** (browser-dependent) → Requires adaptation for backend
- **Rendering** (heavily browser-dependent) → Skip entirely for headless simulation

This separation enables:
- ✅ Unit testing physics in Node.js
- ✅ Recording/playback validation without rendering
- ✅ Deterministic replay for debugging
- ✅ Potential server-side simulation (multiplayer, AI training, etc.)
