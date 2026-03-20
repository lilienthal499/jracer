# VS Code Profile Setup

This directory contains the JRacer JavaScript Development profile configuration.

## How to Import the Profile

### Method 1: Import Profile File (Recommended)
1. Open VS Code
2. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
3. Type "Preferences: Import Profile"
4. Select "Import from profile file..."
5. Navigate to `.vscode/jracer-profile.code-profile`
6. Choose whether to import settings, extensions, and keybindings
7. Name the profile "JavaScript Development - JRacer"

### Method 2: Manual Setup
If you prefer to set up manually:

1. Create a new profile:
   - Click the gear icon (⚙️) in the bottom left
   - Select "Profiles" → "Create Profile..."
   - Name it "JavaScript Development - JRacer"

2. Install recommended extensions:
   - Open the workspace in VS Code
   - Click "Install Recommended Extensions" when prompted
   - Or press `Ctrl+Shift+X` and search for each extension

3. The workspace settings will automatically apply when you open `jracer.code-workspace`

## Recommended Extensions

The profile includes these essential JavaScript development extensions:

- **Prettier** - Code formatter
- **ESLint** - JavaScript linter
- **Live Server** - Local development server with live reload
- **GitLens** - Enhanced Git capabilities
- **Chrome/Firefox Debugger** - Browser debugging support
- **Path Intellisense** - File path autocomplete
- **Error Lens** - Inline error display
- **CSS Peek** - Jump to CSS definitions
- **TODO Highlight** - Highlight TODO comments

## Workspace Setup

To start working with the workspace:

1. Open the workspace file:
   ```
   File → Open Workspace from File → jracer.code-workspace
   ```

2. Or from command line:
   ```bash
   code jracer.code-workspace
   ```

3. Start the development server:
   - Press `Ctrl+Shift+B` → Select "Start Development Server"
   - Or use Live Server: Right-click `index.html` → "Open with Live Server"

## Features

### Debugging
- Launch configurations for Chrome and Firefox
- Source maps enabled
- Breakpoint debugging support

### Tasks
- **Start Development Server**: Launch HTTP server on port 5500
- **Lint JavaScript**: Run ESLint on all JS files
- **Format Code**: Format all files with Prettier

### Key Bindings
- `Ctrl+Shift+L` - Toggle Live Server
- `Ctrl+Shift+D` - Duplicate selection
- `Alt+↑/↓` - Move lines up/down

## Git Configuration

The workspace is configured with:
- Auto-fetch enabled
- Smart commit enabled
- GitLens for enhanced Git visualization
- Full `.git` directory visibility

Enjoy coding! 🏎️
