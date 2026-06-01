# Unified Branch Architecture

This document explains the unified branch structure that supports both Electron and Node.js modes.

## Structure Overview

```
dodoc/
├── package.json              # Shared dependencies (includes electron-store)
├── index.js                  # Main entry point
├── core2/                    # Shared application code
├── electron/                 # All Electron-specific files
│   ├── package.json         # Electron dev dependencies only (electron, electron-builder)
│   ├── index.js             # Electron entry point (requires ../index.js)
│   ├── electron.js          # Electron-specific code (BrowserWindow, etc.)
│   ├── window-state.js      # Local window state management (no external deps)
│   ├── electron-builder.yml # Build config (excludes puppeteer, typescript, etc.)
│   ├── build/               # Build assets (icons, entitlements, etc.)
│   └── dist/                # Build output (created by electron-builder)
└── ...
```

## How It Works

### Detection

The app automatically detects if it's running in Electron or Node:

- Line 17 in `core2/main2.js`: `global.is_electron = process.versions.hasOwnProperty("electron")`

### Conditional Dependencies

Code uses conditional requires to handle platform-specific dependencies:

**Paths** (`core2/paths.js`):

- Electron: Uses `electron.app.getPath()`
- Node: Uses `platform-folders` package

**Web Preview/PDF** (`core2/webpreview.js`):

- Electron: Requires `../electron/electron.js` (uses BrowserWindow)
- Node: Uses Puppeteer

**Electron-specific code** (`electron/electron.js`):

- Only loaded when running in Electron mode
- Contains BrowserWindow management, menu, dialogs, etc.
- Uses `electron-store` dependency from root `node_modules`

**Settings Storage** (`core2/settings.js`):

- Electron: Uses `electron-store` (dependency in root package.json)
- Node: Throws error for features requiring Electron

**Window State** (`electron/window-state.js`):

- Electron: Uses local implementation (no external dependencies)
- Saves/restores window position, size, and state using Node.js built-ins
- Node: Not loaded

## Installation & Usage

### For Node.js (Server/VPS)

```bash
npm install
npm start
```

Dependencies installed:

- Base dependencies (express, sharp, ffmpeg, etc.)
- `puppeteer` (for PDF/screenshot generation)
- `platform-folders` (for system paths)
- `electron-store` (only loaded in Electron mode)
- NO Electron runtime

### For Electron (Desktop App)

```bash
# Install base dependencies
npm install

# Install Electron dependencies
cd electron
npm install

# Run
npm start
```

Dependencies installed:

- Base dependencies (from root, including electron-store)
- Electron runtime
- `electron-builder` (for packaging)
- Local window state management (no external dependency)
- Build excludes: puppeteer, platform-folders, typescript (removed from final package)

## Building Electron App

All build commands run from the `/electron` folder:

```bash
cd electron
npm run pack      # Package without installer
npm run dist      # Build installer
```

The `electron-builder.yml` configuration handles path resolution from the electron folder to parent.

## Benefits

1. **Single codebase**: No need to maintain separate branches
2. **Optimized builds**:
   - Server mode: Has all needed dependencies
   - Desktop builds: Excludes puppeteer, typescript, platform-folders via electron-builder
3. **Same code**: All application logic is shared in `/core2`
4. **Easy switching**: Can install both modes on the same machine
5. **Minimal dependencies**: electron-store in root (only loaded when needed), window state uses local implementation

## Migration Notes

### From Previous Branches

- `main` + `main-node` → unified `main`
- `next` + `next-node` → unified `next`
- `main-dev` + `main-dev-node` → unified `main-dev`

### Breaking Changes

None! The code detects the runtime automatically.
