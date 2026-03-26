# JRacer Ideas Backlog

This file tracks potential features, improvements, and ideas for the JRacer project.

## Current Ideas

- [ ] **Live timing: Determine faster driver with segment-by-segment time differences** (like skiing split times - show +0.5s or -0.3s per segment)
- [ ] **Send fastest lap to backend/leaderboard** (POST recording + time to server for persistent leaderboard)
- [ ] Complete the minimap implementation
- [ ] Multiple car models
- [ ] Automated tests
- [ ] Map editor
- [ ] AI driver that always tries to follow the median
- [ ] Lap time leaderboard (localStorage persistence)
- [ ] Ghost car from best lap (pairs perfectly with replay system)
- [ ] Countdown timer at race start (3-2-1-GO)
- [ ] Network multiplayer using WebRTC (multiple browsers, same race)

---

## Done

- [x] **On vs off track detection** (Original 2009-2015)
  - Grid-based segment lookup with `offTrackSegment` fallback
  - Per-segment collision detection (`isOnTrack()` methods)
  - Physics penalties: high friction (150 vs 30/45) and rolling resistance
  - HUD display showing "On Track: Yes/No"
  - Unit tests for straight and turn segments
  - See: `docs/OFF_TRACK_DETECTION.md`

- [x] **Speed penalty when off-track** (Original 2009-2015)
  - Already implemented via physics engine!
  - `OFF_TRACK_RESISTANCE = 150` applies high friction/drag
  - Cars naturally slow down when leaving track

- [x] **Replay system** - Record and replay key strokes (2024-2025)
  - Frame-based recording format
  - Deterministic playback via input buffering
  - Toggle-based compression (minimal storage)
  - Automatic export on lap completion

---

**Note:** This backlog is for brainstorming and planning. Items can be added, removed, or reprioritized based on project goals.
