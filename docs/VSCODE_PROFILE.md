# VS Code JavaScript Profile Configuration

## Profile Information

**Profile Name:** JavaScript
**Profile ID:** `19c644d2`
**Location:** `C:\Users\D040187\AppData\Roaming\Code\User\profiles\19c644d2\`

## Configured For

This profile is optimized for JavaScript development, specifically for the JRacer project.

## Auto-Association

The following workspaces automatically use this profile:
- `C:\Users\D040187\jracer`
- `C:\Users\D040187\jracer\jracer.code-workspace`

## Profile Contents

### Settings (`settings.json`)
- **Editor**: Font ligatures, bracket colorization, format on save
- **JavaScript**: Auto-imports, single quotes, semicolons
- **Git**: Smart commit, auto-fetch
- **Terminal**: Git Bash default
- **Files**: Auto-save on focus change, trim trailing spaces
- **Prettier**: Configured for consistent formatting
- **ESLint**: Run on save with auto-fix

### Extensions (`extensions.json`)
Recommended extensions for JavaScript development:
1. **Prettier** - Code formatter
2. **ESLint** - JavaScript linter
3. **Live Server** - Development server with live reload
4. **GitLens** - Enhanced Git integration
5. **Chrome/Firefox Debugger** - Browser debugging
6. **Path Intellisense** - File path autocomplete
7. **Error Lens** - Inline error display
8. **Auto Rename/Close Tag** - HTML helpers
9. **CSS Peek** - Jump to CSS definitions
10. **TODO Highlight** - Highlight TODO comments
11. **Code Spell Checker** - Spell checking

### Keybindings (`keybindings.json`)
- `Ctrl+Shift+L` - Toggle Live Server
- `Ctrl+Shift+D` - Duplicate selection
- `Alt+↑/↓` - Move lines up/down

## How to Use

### Automatic (Recommended)
1. Open VS Code
2. Open the workspace: `File → Open Workspace from File`
3. Select: `C:\Users\D040187\jracer\jracer.code-workspace`
4. The JavaScript profile will load automatically

### Manual Switch
1. Click the gear icon (⚙️) in bottom left
2. Select "Profiles"
3. Choose "JavaScript"

## Installing Extensions

When you first open VS Code with this profile, you may see a prompt to install recommended extensions. Click "Install All" to set up the complete development environment.

Or install manually:
1. Press `Ctrl+Shift+X` to open Extensions
2. Search for each extension by name
3. Click "Install"

## Profile Settings Highlights

### Code Quality
- Auto-format on save (Prettier)
- Auto-fix on save (ESLint)
- Trim trailing whitespace
- Insert final newline

### JavaScript-Specific
- Single quotes preferred
- Semicolons required
- Auto-import suggestions
- Function call completions

### Git Integration
- Smart commit enabled
- Auto-fetch enabled
- GitLens code lens
- Full .git visibility

### Developer Experience
- Auto-save on focus change
- Live Server on port 5500
- Bracket pair colorization
- Error Lens for inline errors

## Customization

To customize this profile:
1. Switch to the JavaScript profile
2. Open Settings: `Ctrl+,`
3. Modify settings (changes are saved to this profile only)
4. Or edit directly: `C:\Users\D040187\AppData\Roaming\Code\User\profiles\19c644d2\settings.json`

## Profile vs Workspace Settings

- **Profile settings** apply to all projects using the JavaScript profile
- **Workspace settings** (in `jracer.code-workspace`) apply only to JRacer
- Workspace settings override profile settings when there's a conflict

---

**Last Updated:** 2026-03-20
**Created For:** JRacer JavaScript Development
