// Preload script for Electron
// This runs before the renderer process loads

const { contextBridge } = require('electron');

// Expose protected methods that allow the renderer process to use
// specific electron features without exposing the entire API
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  isElectron: true
});

// Log when preload script loads
console.log('MathPlay Kids - Electron Preload Loaded');
