# JRacer Ideas Backlog

This file tracks potential features, improvements, and ideas for the JRacer project.

## Current Ideas

- [ ] **Live timing: Determine faster driver with segment-by-segment time differences** (like skiing split times - show +0.5s or -0.3s per segment)
- [ ] **Send fastest lap to backend/leaderboard** (POST recording + time to server for persistent leaderboard)
- [ ] Complete the minimap implementation
- [ ] On vs off track detection
- [ ] Multiple car models
- [ ] Automated tests
- [ ] Map editor
- [ ] AI driver that always tries to follow the median
- [ ] Replay (record and replay key strokes) - framemanager is prepared for this
- [ ] Lap time leaderboard (localStorage persistence)
- [ ] Ghost car from best lap (pairs perfectly with replay system)
- [ ] Countdown timer at race start (3-2-1-GO)
- [ ] Speed penalty when off-track (natural extension of off-track detection)
- [ ] Network multiplayer using WebRTC (multiple browsers, same race)

---

## Done

- [x] **Replay system** - Record and replay key strokes (2024-2025)
  - Frame-based recording format
  - Deterministic playback via input buffering
  - Toggle-based compression (minimal storage)
  - Automatic export on lap completion

---

**Note:** This backlog is for brainstorming and planning. Items can be added, removed, or reprioritized based on project goals.
