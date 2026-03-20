# JRacer Development Guide

Welcome back to JRacer development! This guide will help you get started with the consolidated codebase.

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ (for development tools)
- Modern web browser (Chrome, Firefox, Edge)
- VS Code (recommended)

### Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Open the workspace**:
   ```bash
   code jracer.code-workspace
   ```

3. **Import the VS Code profile** (optional but recommended):
   - Press `Ctrl+Shift+P`
   - Type "Preferences: Import Profile"
   - Select `.vscode/jracer-profile.code-profile`

4. **Start the development server**:
   ```bash
   npm start
   ```
   This will open the game in your browser at `http://localhost:5500`

## 📁 Project Structure

```
jracer-git/
├── index.html              Main entry point
├── css/
│   ├── style.css          Game-specific styles
│   ├── main.css           UI framework
│   └── normalize.css      Cross-browser reset
├── js/
│   ├── application.js     Bootstrap & MVC controller
│   ├── model.js           Data model (car, track, state)
│   ├── view.js            Rendering layer & HUD
│   ├── controller.js      Keyboard input handling
│   ├── physicsengine.js   Physics calculations
│   ├── framemanager.js    Game loop management
│   ├── track.js           Track generation
│   └── config.js          Configuration
├── archive/               Old versions and historical code
│   ├── old-versions/      JRacer 2.0, 3.0, extracted versions
│   ├── analysis-docs/     Version comparison documents
│   └── original-archives/ Original .zip and .7z files
├── .vscode/               VS Code configuration
│   ├── jracer-profile.code-profile
│   └── README.md
├── jracer.code-workspace  VS Code workspace configuration
└── package.json           Development tooling

```

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server and open browser |
| `npm run dev` | Start development server without opening browser |
| `npm run lint` | Check JavaScript code with ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run validate` | Run both linting and format check |

## 🎮 Game Controls

- **Arrow Keys** - Steer the car
- **Accelerate/Brake** - Control speed

## 🏗️ Architecture

JRacer 4.0 follows a clean MVC pattern:

- **Model** (`model.js`) - Game state, car data, track data
- **View** (`view.js`) - Canvas rendering, HUD display
- **Controller** (`controller.js`) - Input handling
- **Physics Engine** (`physicsengine.js`) - Realistic car physics
- **Frame Manager** (`framemanager.js`) - Game loop timing
- **Application** (`application.js`) - Bootstrap and coordination

## 📝 Code Style

The project uses:
- **ESLint** for JavaScript linting
- **Prettier** for code formatting
- Strict mode enabled
- No external framework dependencies

Format on save is enabled in the workspace settings.

## 🔍 Debugging

### VS Code Debugging
1. Press `F5` or go to Run & Debug
2. Select "Launch JRacer in Chrome" or "Launch JRacer in Firefox"
3. Set breakpoints in your JavaScript files
4. Debug in VS Code while the game runs in the browser

### Browser DevTools
- Open browser console (F12) for logs
- Use browser's debugger for breakpoints
- Performance tab for profiling

## 🧪 Testing

Tests are not yet implemented. To add tests:

```bash
npm install --save-dev jest
```

Create test files in `__tests__/` directory.

## 📚 Version History

This codebase represents **JRacer 4.0** - the final and most complete version.

### Current Version: 4.0 (2014-2015)
- ✅ Modern JavaScript with 'use strict'
- ✅ Lap counting and timing
- ✅ Track sequence validation
- ✅ Sophisticated physics engine
- ✅ No framework dependencies
- ✅ Chinese/German bilingual interface

### Historical Versions (in archive/)
- **2.0** (July 2009) - First working version
- **3.0** (October 2009) - jQuery-based, published version
- **3.x** (October 2009) - Web Workers experiment

See `TIMELINE.md` and `README.md` for complete history.

## 🗂️ Archive Structure

The `archive/` directory contains:

- **old-versions/** - All previous JRacer versions
  - JRacer_GoogleDrive - Google Drive backup
  - JRacer_SVN - SVN repository export
  - JRacer_extracted - Original extracted files
  - JRacer_3.0 - jQuery-based version

- **analysis-docs/** - Historical analysis
  - VERSION_COMPARISON.md
  - GIT_MIGRATION_COMPLETE.md
  - SVN_ANALYSIS.md

- **original-archives/** - Original backup files
  - JRacer.7z
  - JRacer-*.zip

These are preserved for historical reference but not used in active development.

## 🔄 Git Workflow

The repository has a complete git history with commits dating back to the original development:

```bash
# View complete history
git log --oneline --graph --all

# View timeline
cat TIMELINE.md
```

## 🎯 Next Steps

Some ideas for future development:

- [ ] Add unit tests
- [ ] Multiple car support
- [ ] Track editor UI
- [ ] Multiplayer support
- [ ] Mobile touch controls
- [ ] Sound effects
- [ ] Particle effects for dust/smoke
- [ ] Leader board / time trial mode
- [ ] More tracks

## 📄 License

This is a personal learning project. Feel free to learn from it!

## 🤝 Contributing

This is primarily a personal historical project, but if you'd like to experiment:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Ensure code passes linting: `npm run validate`
5. Commit with clear messages

---

**Happy Racing! 🏎️💨**

*"My first coding project from 20 years ago, now ready for modern development!"*
