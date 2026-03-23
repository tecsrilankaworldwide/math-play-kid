# MathPlay Kids - Desktop App Build Instructions

## Prerequisites
- Node.js 18+ installed
- Yarn package manager

## Quick Start (Build EXE)

### 1. Install Dependencies
```bash
cd frontend
yarn install
```

### 2. Build the React App
```bash
yarn build
```

### 3. Build Desktop App

**Windows EXE:**
```bash
yarn electron:build:win
```

**Mac DMG:**
```bash
yarn electron:build:mac
```

**Linux AppImage:**
```bash
yarn electron:build:linux
```

## Output Files
After building, find your installers in `frontend/dist/`:
- **Windows**: `MathPlay-Kids-1.0.0-x64.exe` (installer) or `MathPlay-Kids-1.0.0-x64-portable.exe`
- **Mac**: `MathPlay-Kids-1.0.0.dmg`
- **Linux**: `MathPlay-Kids-1.0.0.AppImage`

## Development Mode
To run the Electron app in development:
```bash
# Terminal 1: Start React dev server
yarn start

# Terminal 2: Start Electron (after React loads)
yarn electron:dev
```

## Adding App Icon
Replace these files with your custom icons:
- `electron/icon.png` (512x512 PNG for all platforms)
- `electron/icon.ico` (Windows)
- `electron/icon.icns` (Mac)

Use https://www.electronjs.org/docs/latest/tutorial/application-distribution for icon generation tools.

## Offline Mode Note
The desktop app works offline! The React frontend is bundled inside the app.
For full offline functionality with saved progress, consider using localStorage 
instead of the MongoDB backend, or bundle a local SQLite database.

## Customization
- Edit `electron/main.js` for window behavior
- Edit `electron-builder.json` for build options
- Edit `package.json` for app metadata
