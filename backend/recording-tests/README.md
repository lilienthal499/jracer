# Recording/Playback Tests

This directory contains tests developed to diagnose and fix the recording/playback non-determinism issue.

## The Problem

When recording gameplay in the browser and playing it back, the car would follow a different path than during the original recording, even though control inputs (gas/steering) matched perfectly.

## Root Cause

Keyboard events fired asynchronously at random moments during a frame, causing immediate control changes (e.g., `steeringWheel = 0` when releasing keys). During playback, inputs were applied at frame boundaries, creating sub-frame timing differences that caused physics divergence.

## The Fix

Buffer keyboard inputs and apply them only at frame boundaries, ensuring both recording and playback apply inputs deterministically at the same moment in the frame.

## Test Files

### Core Tests
- **test-determinism.js** - Verifies recording and playback produce identical results
- **test-realistic-keyboard.js** - Simulates browser keyboard events with buffering
- **find-divergence.js** - Detailed analysis showing exact frame where divergence occurred

### Order Investigation
- **test-update-order.js** - Proves execution order doesn't matter (delayed controllers only start progressing on next frame)
- **test-minimal-order.js** - Minimal test showing pressed() doesn't immediately start delayed controller
- **test-order-fix.js** - Original attempt to fix by reordering (proved unnecessary)

### Playback Tests
- **test-playback-determinism.js** - Verifies same recording produces same result twice
- **test-config-recordings.js** - Tests existing recordings from config.json
- **test-lap-export.js** - Tests lap completion export feature

### Debug/Analysis
- **debug-playback.js** - Debug tool showing frame-by-frame playback state
- **debug-recording.js** - Debug tool for recording analysis
- **test-decorator.js** - Tests recording decorator functionality
- **test-recording.js** - Early recording format tests

## Running Tests

All tests can be run with Node.js:
```bash
node backend/recording-tests/test-determinism.js
```

## Key Insights

1. **Sub-frame timing matters**: Even though physics runs at discrete frames, when control changes happen within a frame affects the final state
2. **Buffering is essential**: Asynchronous input must be synchronized to frame boundaries for determinism
3. **Order doesn't matter**: Delayed controllers only progress when update() is called, so input order relative to controller update doesn't affect results
4. **Lap completion export**: Better UX than arbitrary frame count - export recording automatically when player completes a lap
