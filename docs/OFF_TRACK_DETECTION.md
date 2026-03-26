# Off-Track Detection

Off-track detection is **fully implemented** in JRacer. The system detects when cars leave the track and applies physical penalties.

## How It Works

### 1. Track Segment Architecture

Every position on the track grid maps to a **segment**:
- **On-track segments**: `straight`, `turn`, `homestraight`, `finishline`
- **Off-track segment**: Special singleton with `type = 'offtrack'` and `sequenceNumber = 0`

**Key function**: `getSegmentAtPosition(x, y)` (track.js:65-72)
- Returns the segment at pixel coordinates (x, y)
- Returns `offTrackSegment` if position is outside track bounds or in empty grid cell

### 2. Collision Detection per Segment

Each track segment has an `isOnTrack(position)` method:

**Straight segments** (track.js:452-456):
- Checks if position is within perpendicular distance from track centerline
- Track width = `gridSize * trackWidth` (e.g., 200px * 0.4 = 80px on each side)

**Turn segments** (track.js:511-539):
- Calculates distance from center of turn circle
- On-track if distance is between inner and outer radius (annulus/donut shape)
- Inner radius: `radius - halfWidth`
- Outer radius: `radius + halfWidth`

**Off-track segment** (track.js:636-638):
- Always returns `false`

### 3. Car Model Integration

**model.js:36-38**:
```javascript
isOnTrack: function () {
  return this.segment.isOnTrack(this.position);
}
```

The car's current segment is updated each frame by physics engine (physicsengine.js:191).

### 4. Physics Penalties

**physicsengine.js:96-99, 120-121**:

When off-track, cars experience:
1. **High friction**: `OFF_TRACK_RESISTANCE = 150` (vs normal 30/45)
   - Applied to lateral velocity, preventing tight turns
2. **High rolling resistance**: Increased drag slowing forward velocity
   - Much harder to maintain speed off-track

Result: Cars naturally slow down when they leave the track.

### 5. Visual Feedback

**Head-Up Display** (headupdisplay.js:94, 105):
- Shows "On Track: Yes/No" indicator
- Updates every frame based on `carModel.isOnTrack()`

**Tire Tracks** (tiretracks.js:58):
- Dark green marks for grass/off-track tire marks
- Visual indication of where cars went off-track

### 6. Testing

**Unit tests** (tests/track.unit.test.js):
- `expectOnTrack()` / `expectOffTrack()` helpers
- Tests for straight segments: center, within width, outside width
- Tests for turn segments: inner radius, outer radius, center
- Tests for `offTrackSegment` properties

**Integration tests**:
- Backend simulation logs on-track status: `car.segment.type !== 'offtrack'`
- Recording tests display on-track indicator: ✓ or ✗ OFF

## Current Behavior

✅ **Working:**
- Grid-based segment lookup
- Per-segment collision detection (straight and turn)
- Physics penalties (friction, drag)
- HUD display
- Off-track segment fallback

⚠️ **Note:**
- One unit test is skipped (track.unit.test.js:337) - detection works but test needs refinement
- No visual track boundary rendering (grass/barriers) - cars just slow down

## Future Enhancements

See BACKLOG.md:
- [ ] Speed penalty when off-track (already implemented via physics!)
- [ ] Visual grass/barrier rendering
- [ ] Sound effects when going off-track
- [ ] Damage/spin-out if going too fast off-track
