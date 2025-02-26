const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');

const args = process.argv.slice(2); // Skip the first two default arguments
var arrayData = args[0] ? args[0] : []; // Parse JSON string back into an array

console.log('Received array: 222', arrayData); // Verify the array


console.log('Received array in ready function :', arrayData); // Verify the array


console.log(`tracker 360000`);

let tray = null;
let mainWindow = null;

// Prevent multiple instances of the app
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // If another instance is already running, quit this instance
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus the existing instance if a second instance is attempted
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1920,
      height: 1080,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      webPreferences: {
        preload: path.join(__dirname, 'notification-preload.js'),
        contextIsolation: false,
        nodeIntegration: true,
      },
    });


    // Uncomment the following to load your content
    mainWindow.loadFile('notification.html');
    mainWindow.setIgnoreMouseEvents(true); // Optional: Make the window click-through
  }


  app.whenReady().then(() => {
  
    createWindow();

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  });

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
  });
}
