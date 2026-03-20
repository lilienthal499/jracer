# VS Code Extensions for JRacer

## Essential Extensions (Install These First)

### 1. **Prettier - Code Formatter** ⭐ MUST HAVE
**ID:** `esbenp.prettier-vscode`
- Auto-formats your code on save
- Keeps consistent style (spaces, quotes, etc.)
- **Why:** Your VS Code profile is configured to use this

### 2. **ESLint** ⭐ MUST HAVE
**ID:** `dbaeumer.vscode-eslint`
- Finds bugs and code quality issues
- Auto-fixes problems on save
- **Why:** Your project has `.eslintrc.json` configured

### 3. **Live Server** ⭐ MUST HAVE
**ID:** `ritwickdey.liveserver`
- Right-click `index.html` → "Open with Live Server"
- Auto-refreshes browser when you save files
- **Why:** Much easier than refreshing manually

## Highly Recommended

### 4. **GitLens**
**ID:** `eamodio.gitlens`
- See git blame inline
- Visualize code history
- Compare changes easily
- **Why:** Your project has rich git history (2009-2026!)

### 5. **Error Lens**
**ID:** `usernamehw.errorlens`
- Shows errors inline in your code
- No need to hover over red squiggles
- **Why:** Instant feedback while coding

## Nice to Have (HTML/CSS Helpers)

### 6. **Auto Rename Tag**
**ID:** `formulahendry.auto-rename-tag`
- Rename both opening and closing HTML tags together
- **Why:** Editing `index.html` is easier

### 7. **Auto Close Tag**
**ID:** `formulahendry.auto-close-tag`
- Automatically adds closing HTML tags
- **Why:** Saves typing

### 8. **CSS Peek**
**ID:** `pranaygp.vscode-css-peek`
- Jump to CSS definition from HTML
- **Why:** Navigate between HTML and CSS quickly

## Optional (Quality of Life)

### 9. **Path Intellisense**
**ID:** `christian-kohler.path-intellisense`
- Autocompletes file paths
- **Why:** Helpful when linking files

### 10. **TODO Highlight**
**ID:** `wayou.vscode-todo-highlight`
- Highlights TODO, FIXME comments
- **Why:** Track what needs work

### 11. **Code Spell Checker**
**ID:** `streetsidesoftware.code-spell-checker`
- Spell checking in code and comments
- **Why:** Catch typos

## Debugging (Advanced)

### 12. **Debugger for Chrome**
**ID:** `msjsdiag.debugger-for-chrome`
- Debug JavaScript in VS Code
- Set breakpoints, inspect variables
- **Why:** Advanced debugging (F5 to launch)

### 13. **Debugger for Firefox**
**ID:** `firefox-devtools.vscode-firefox-debug`
- Same as Chrome debugger but for Firefox
- **Why:** Test in multiple browsers

## How to Install

### Method 1: One-Click Install (Easiest)
1. Open your workspace: `code jracer.code-workspace`
2. VS Code will show: "This workspace has extension recommendations"
3. Click **"Install All"**
4. Done! ✅

### Method 2: Install Individually
1. Press `Ctrl+Shift+X` (opens Extensions panel)
2. Search for extension name (e.g., "Prettier")
3. Click **"Install"**
4. Repeat for each extension

### Method 3: Command Line
```bash
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension ritwickdey.liveserver
code --install-extension eamodio.gitlens
code --install-extension usernamehw.errorlens
```

## Priority Installation Order

**Start with these 3:**
1. Prettier (code formatting)
2. ESLint (code quality)
3. Live Server (dev server)

**Then add these 2:**
4. GitLens (git features)
5. Error Lens (inline errors)

**Rest are optional** - install as needed!

## Verification

After installing, check that:
1. **Prettier** - Save a file, it should auto-format
2. **ESLint** - Open `js/application.js`, should see inline warnings
3. **Live Server** - Right-click `index.html`, should see "Open with Live Server"

## Alternative: Skip Extensions

If you want to keep it minimal:
- **Just use Live Server** (or `npm start`)
- **Skip Prettier/ESLint** (manually format code)
- **Use browser DevTools** for debugging

Your code will still work! Extensions just make development nicer.

---

**My Recommendation:** Install the first 5 (Prettier, ESLint, Live Server, GitLens, Error Lens) and see how you like it. Add more later if you want them.
