# JRacer Tracks

This directory contains track definitions in JSON format.

## Track File Format

Each track is a JSON file numbered sequentially (1.json, 2.json, etc.).

### Structure

```json
{
  "id": 1,
  "name": "Track Name",
  "description": "Track description",
  "gridSize": 400,
  "sections": [
    "START",
    "STRAIGHT",
    "LEFT_TURN",
    ...
    "FINISH"
  ]
}
```

### Available Section Types

- `START` - Starting line (required first element)
- `FINISH` - Finish line (required last element)
- `STRAIGHT` - Straight section
- `LEFT_TURN` - 90° left turn
- `RIGHT_TURN` - 90° right turn
- `WIDE_LEFT_TURN` - Wide 90° left turn
- `WIDE_RIGHT_TURN` - Wide 90° right turn
- `EXTRA_WIDE_LEFT_TURN` - Extra wide 90° left turn
- `EXTRA_WIDE_RIGHT_TURN` - Extra wide 90° right turn

### Creating New Tracks

1. Create a new file with the next number (e.g., `5.json`)
2. Copy the structure from an existing track
3. Design your track sections (must form a closed loop)
4. Update `js/config.js` to set `track.number` to your new track

### Current Tracks

1. **Beginner Oval** - Simple oval for learning
2. **Technical Circuit** - Mixed turns and straights
3. **Speed Circuit** - Long straights with wide turns
4. **Hairpin Challenge** - Tight consecutive turns
