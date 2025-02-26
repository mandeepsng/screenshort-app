const { app, BrowserWindow, Menu, Tray, ipcMain, shell } = require('electron');
const path = require('path');
const os = require('os');
const version = app.getVersion(); // get app version
const first_name = 'John'; // replace with dynamic user data if needed
const userData = { apiResponse: { token: 'dummy_token' } }; // replace with actual user data
const config = { API_URL: 'https://example.com' }; // replace with your API URL

let tray = null;
let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  mainWindow.loadURL('https://example.com'); // replace with your app's URL or path

  // Open DevTools (optional, remove for production)
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Create the tray and menu
function createTray() {
  tray = new Tray(path.join(__dirname, 'assets/icon-mac.png')); // Use your own icon for the tray
  const trayMenuTemplate = [
    {
      role: 'quit',
    },
  ];

  if (first_name && first_name) {
    trayMenuTemplate.unshift(
      {
        label: `User: ${first_name}`,
        enabled: false,
      },
      {
        label: `App version: ${version}`,
        enabled: false,
      },
      {
        label: 'Activity',
        click: () => {
          shell.openExternal(`${config.API_URL}/user-view/${userData.apiResponse.token}`);
        }
      },
      {
        label: `Check Update`,
        click: () => {
          checkForUpdates(); // Implement your check for updates logic
        },
      },
      {
        label: `Sync Data`,
        click: () => {
          syncUserData(); // Implement your sync logic
        },
      },
      {
        label: 'Logout',
        click: () => {
          ipcMain.emit('logout', 'logout ...');
          console.log('User logged out');
          // Add your logout logic here
        },
      }
    );
  }

  const trayMenu = Menu.buildFromTemplate(trayMenuTemplate);
  tray.setContextMenu(trayMenu);
  tray.setToolTip('Your App Name'); // Set the tooltip that shows when you hover over the tray icon

  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow.show();
    }
  });
}

function checkForUpdates() {
  // Implement your update logic here (auto-updating or manual check)
  console.log('Checking for updates...');
}

function syncUserData() {
  // Implement your sync data logic here
  console.log('Syncing user data...');
}

// Initialize the app
app.whenReady().then(() => {
  createWindow();
  createTray();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit the app when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
