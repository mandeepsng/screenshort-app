const { app, BrowserWindow } = require('electron');
const path = require('path');
const fetch = require('node-fetch');
const Notification = require('electron-notification');

let mainWindow;

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    webPreferences: {
      nodeIntegration: true // This is important to enable Node.js integration
    }
  });

  // Load the index.html of the app.
  mainWindow.loadFile(path.resolve(__dirname, 'dist/index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  // Fetch messages from the external API
  setInterval(fetchMessages, 5000); // Fetch every 5 seconds
}

async function fetchMessages() {
  try {
    const response = await fetch('https://api.example.com/messages');
    const messages = await response.json();
    // Display notifications for each message
    messages.forEach(message => {
      Notification({
        title: 'New Message',
        body: message.text
      });
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});
