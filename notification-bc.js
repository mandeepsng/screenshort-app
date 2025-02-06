const { app, BrowserWindow, Tray, Menu } = require('electron');
const path = require('path');
const {getUserData, userExists, getToken} = require(__dirname, 'functions', 'auth.js')



let tray = null;
let mainWindow = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
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

  // mainWindow.loadFile('notification.html');
  // mainWindow.setIgnoreMouseEvents(true); // Makes the window click-through


  // setTimeout(() => {
  //   mainWindow.close(); // Close the window
  //   app.quit();
  // }, 10000); // 10 seconds


}

app.whenReady().then( async() => {

  try {
    // createWindow();

    console.log(userExists());

    // if (userExists()) {
    //   console.log('User exist.');

    // } else {
    //   console.log('User does not exist. Skipping window creation.');
    // }
  } catch (error) {
    console.error('Error checking user existence:', error);
    app.quit(); // Optionally quit the app on critical error
  }
  

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
