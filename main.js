const { app, BrowserWindow, desktopCapturer, screen, ipcMain, Menu, Tray , powerMonitor , Notification, globalShortcut, shell , dialog   } = require('electron')
const electronPath = require('electron'); // Path to Electron
const { autoUpdater } = require('electron-updater');
const fs = require('fs')
const os = require('os');
const path = require('path')
const { promisify } = require('util');
const axios = require('axios');
const { Readable } = require('stream');
const { Blob } = require('buffer');
const { log } = require('console');
const { spawn } = require('child_process');
const { loadPyodide } = require('pyodide')
const common = require('./functions/common')
const timerPath = path.join(__dirname, 'timer');
const { initializeTimer } = require(timerPath);
// const { initializeTimer } = require('./timer');
const state = require('./state');
const { exec } = require('child_process');
// const trackingPath = path.join(__dirname, 'data', 'tracking.json');
const functionPath = path.join(__dirname, 'functions', 'timer');
const config = require('./config');

const { version } = require(path.join(__dirname, 'package.json'));
const { getToken } = require(path.join(__dirname, 'functions', 'auth'));
console.log(`App version: ${version}`);

// create files in temp folder start
// Get the path to the temporary directory

// Promisify the chmod function
const chmodAsync = promisify(fs.chmod);

// Function to set full permissions recursively
async function setFullPermissions(directoryPath) {
  try {
    // Set full permissions recursively (read, write, and execute for owner, group, and others)
    await chmodAsync(directoryPath, 0o777);
    console.log('Permissions set successfully.');
    writeLogFile('Permissions set successfully');
  } catch (error) {
    
    writeLogFile(`'Error setting permissions:', ${error}`);
    console.error('Error setting permissions:', error);
  }
}


// const tempDir = app.getPath('temp');
const appTempDir = path.join(os.homedir(), '.track360');
console.log('appTempDir', appTempDir);

setFullPermissions(appTempDir);
// Create a subdirectory for your app data
// const appTempDir = path.join(tempDir, 'track-360');

// var timePath = path.join(appTempDir, 'time.json');
const timePath = path.join(appTempDir, 'elapsedTime.json');
// console.log('timePath', timePath);
var dataFilePath = path.join(appTempDir, 'data.json');
var trackingPath = path.join(appTempDir, 'tracking.json');
var wishLoopPath = path.join(appTempDir, 'wish.json');

// Function to ensure the directory and files exist
function ensureAppTempDir() {
  if (!fs.existsSync(appTempDir)) {
    fs.mkdirSync(appTempDir, { recursive: true });
  }


  if (!fs.existsSync(appTempDir)) {
    fs.mkdirSync(appTempDir,{ recursive: true });
  }
  // Create files if they do not exist
  if (!fs.existsSync(timePath)) {
    fs.writeFileSync(timePath, JSON.stringify({}));
  }
  if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify({}));
  }
  if (!fs.existsSync(trackingPath)) {
    fs.writeFileSync(trackingPath, JSON.stringify({}));
  }
  if (!fs.existsSync(wishLoopPath)) {
    fs.writeFileSync(wishLoopPath, JSON.stringify({}));
  }
}

app.on('ready', ensureAppTempDir);
// create files in temp folder end


ipcMain.handle('get-system-details', () => {
  return getSystemDetails(); // Send system details to the renderer process
});

// app update functionality start

autoUpdater.autoDownload = false;

autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
  console.log('Update available:', info);
  const dialogOpts = {
    type: 'info',
    buttons: ['Download', 'Later'],
    title: 'Update Available',
    message: `A new version (${info.version}) of the app is available.. Do you want to download it now?`
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.downloadUpdate();
    }
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available:', info);
});

autoUpdater.on('error', (error) => {
  console.error('Error in auto-updater:', error);
});

// working in cmd console
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
  log_message += ` - Downloaded ${progressObj.percent}%`;
  log_message += ` (${progressObj.transferred}/${progressObj.total})`;
  console.log(log_message);
});

autoUpdater.on('download-progress', (progressObj) => {
  let log_message = `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
  console.log(log_message);
  dialog.showMessageBox({
    type: 'info',
    title: 'Download Progress',
    message: log_message
  });
});

// manually install update
autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded:', info);
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart', 'Later'],
    title: 'Application Update',
    message: 'A new version has been downloaded. Restart the application to apply the updates.'
  };

  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});

// auto install new update
// autoUpdater.on('update-downloaded', (info) => {
//   console.log('Update downloaded:', info);
//   autoUpdater.quitAndInstall();
// });

autoUpdater.on('error', (error) => {
  console.error('Error in auto-updater:', error);
  dialog.showErrorBox('Error', error == null ? 'unknown' : (error.stack || error).toString());
});

// Function to trigger update check
function checkForUpdates() {
  autoUpdater.checkForUpdates();
  // ipcMain.emit('capture-screenshot', 'Capture screenshot taken');
  // captureScreenshot();

  // const dialogOpts = {
  //   type: 'info',
  //   buttons: ['ok'],
  //   title: 'Update Available',
  //   message: `A new version of the app is available.. Do you want to download it now?`
  // };

  // dialog.showMessageBox(dialogOpts);
}
// app update functionality end

const timerFunc = require(functionPath)
// const ActivityTracker = require("./ActivityTracker");

// const activityTracker = new ActivityTracker( trackingPath, 2000);

// activityTracker.init();

const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

let intervalId = null; // Define intervalId outside the function scope

// Settings object
let setting = {
  'renderer': {
      'key1': 'value1',
      'key2': 'value2'
  }
}

let win;
let tray = null

let userInactiveTimeout;
let inactiveTimer;
let screenshotIntervals = []
let activityTimer;
let chartData;
let timer;

var apiurl = 'https://track360.rvsmedia.com';
// var apiurl = 'https://app.idevelopment.site';
// var apiurl = 'http://erp.test';

function readUserArray(key){
  try {
    const Uarray = fs.readFileSync(dataFilePath);
    userObject = JSON.parse(Uarray);
    const data = userObject?.apiResponse?.user;
    console.log('data', data);
    
    if (!data) {
      console.log('User is null');
      return;
    }

    if(key === 'dob'){
      return data.userdetail.dob;
    }
    
    if(key === 'doj'){
      return data.userdetail.doj;
    }
    
    return data[key];
  } catch (error) {
    console.error('Error reading data.json:', error);
  }

}


function killElectronProcessWindow() {
  const scriptPath = path.join(__dirname, 'kill-electron.bat');

  shell.openPath(scriptPath).then((result) => {
    if (result) {
      console.error(`Error executing script: ${result}`);
    } else {
      console.log('Script executed successfully');
    }
  });
}


async function syncUserData()
{

  let user = {};

  try {
    const headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${userData.apiResponse.token}`,
    };

    const response = await axios.get(`${config.API_URL}/api/user`, {
      headers: headers,
    });

    console.log('GetUser response:', response.data);

    // ipcMain.emit('logout', 'logout ...');

    user.apiResponse = response.data;

    fs.writeFileSync(dataFilePath, JSON.stringify(user, null, 2));
    LoginNotification('Data Sync', {});

    closeAllWindows();
    readUserData();

    // Set the app to open at login
    app.setLoginItemSettings({
      openAtLogin: true
    });

    // Restart the app
    app.relaunch();
    app.exit(0);

    killElectronProcessWindow();


  } catch (error) {
    console.error('Error while GetUser response:', error.message);
    console.log(error.response.status);

    if(error.response.status === 401){
      ipcMain.emit('logout', 'logout ...');
    }
  }

}



const first_name = readUserArray('first_name');
var dob = readUserArray('dob');
var doj = readUserArray('doj');
var token = readUserArray('token');

console.log('User is ' + first_name);


// Create the application menu
  const menuTemplate = [
    {
      role: 'quit',
    },
  ];

    if (first_name && first_name) {
    menuTemplate.unshift(
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
        label: `check update`,
        click: () => {
          // Handle logout logic here
          checkForUpdates();
        },
      },
      {
        label: `Sync Data`,
        click: () => {
          // Handle logout logic here
          syncUserData();
        },
      },
      {
        label: 'Logout',
        click: () => {
          // Handle logout logic here
          ipcMain.emit('logout', 'logout ...');
          console.log('User logged out');
        },
      }
    );
  }

  const menu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(menu);

    const createWindow_old = () => {
      win = new BrowserWindow({
        width: 480,
        height: 630,
        resizable: false,
        skipTaskbar: false,
        closable: false,
        minimize: true,
        icon: path.join(__dirname, 'assets', 'icon.png'), 
        webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, 'preload.js')
        }
      })
      
        // open dev tools
        // win.webContents.openDevTools();

        // Check if userData is not null, and decide which page to load.
        if (userData.apiResponse) {
          
          // Minimize the window if it's already visible
          if (win.isVisible()) {
            win.minimize();
          }

          win.webContents.send('show-dashboard', userData); // Pass userData to dashboard.html
          win.loadFile(path.join(__dirname, 'dashboard.html'))
          .then(() => { win.webContents.send('sendSettings', userData.apiResponse); })
            .then(() => { win.show(); });

          return win;
          console.log('show-dashboard = ', userData);
          // win.webContents.send('show-dashboard', loginData);
        } else {
          win.loadFile(path.join(__dirname, 'index.html'));
        }


      // win.loadFile('index.html')



    }


    const createWindow = () => {
      let win = new BrowserWindow({
        width: 480,
        height: 630,
        resizable: false,
        skipTaskbar: false,
        closable: false,
        minimize: true,
        icon: path.join(__dirname, 'assets', 'icon.png'),
        webPreferences: {
          nodeIntegration: true,
          preload: path.join(__dirname, 'preload.js')
        }
      });
    
      // Check if userData is null or undefined
      if (!userData.apiResponse) {
        win.loadFile(path.join(__dirname, 'index.html'))
          .then(() => {
            win.show();
          });
      }
    
      return win;
    };


    function birthdayWindow() {
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

      // Close the window after 10 seconds
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.close();
          killElectronProcessWindow();
        }
      }, 30000); // 10000ms = 10 seconds
      
    }
    function anniversaryWindow() {
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
      // mainWindow.loadFile('anniversary.html');
      mainWindow.loadFile('anniversary.html', {
        query: { message: 'Happy Testing message !' },
      });

      mainWindow.setIgnoreMouseEvents(true); // Optional: Make the window click-through

      // Close the window after 10 seconds
      setTimeout(() => {
        if (mainWindow) {
          mainWindow.close();
          killElectronProcessWindow();
        }
      }, 30000); // 10000ms = 10 seconds
      
    }
    

    


    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      // Perform any necessary cleanup or error handling here
      app.quit(); // You might want to gracefully exit the application after an uncaught exception
    });

    app.whenReady().then(() => {
      // createMenu();
      initializeTimer();

      // check user exist or not
      if(getToken() !== null){

        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        
        console.log('dob', dob)
        console.log('doj', doj)
        
        if (dob !== null && dob !== undefined && dob !== '') {

          // Extract day and month from the DOB
          const dobDay = dob.split('-')[2]; // Extract day eg. (18)
          const dobMonth = dob.split('-')[1]; // Extract month eg. (08)
          
          // Extract day and month from today's date
          const todayDay = formattedDate.split('-')[2]; // Extract day
          const todayMonth = formattedDate.split('-')[1]; // Extract month
          
          // Compare day and month
          if (dobDay === todayDay && dobMonth === todayMonth) {
            console.log('Today is your Birthday');
            birthdayWindow();
            setInterval(birthdayWindow, 3600000);
          } else {
            console.log('Today is not your Birthday');
          }

        }
        
        // logic for checking doj

        if (doj !== null && doj !== undefined && doj !== '') {
          
          // Extract day and month from the DOJ
          const dojDay = doj.split('-')[2]; // Extract day eg. (18)
          const dojMonth = doj.split('-')[1]; // Extract month eg. (08)
          
          // Extract day and month from today's date
          const todayDay = formattedDate.split('-')[2]; // Extract day
          const todayMonth = formattedDate.split('-')[1]; // Extract month
          
          // Compare day and month
          if (dojDay === todayDay && dojMonth === todayMonth) {
            console.log('It is the anniversary of the date of joining!');
            anniversaryWindow();
            setInterval(anniversaryWindow, 3600000);
          } else {
            console.log('Today is not the anniversary of the date of joining.');
          }
        }

      }

      autoUpdater.checkForUpdatesAndNotify();


      app.on('session-created', (session) => {
        // console.log('session-created', session);
      })

      

      // Check if another instance of the app is already running
      const gotTheLock = app.requestSingleInstanceLock();
      console.log('gotTheLock', gotTheLock);

      // if (!gotTheLock) {
      //   app.quit();
      // } else {
      //   app.on('second-instance', () => {
      //     // If window is closed, reload it
      //     if (!win) {
      //       createWindow();
      //     } else {
      //       if (win.isMinimized()) win.restore();
      //       win.focus();
      //     }
      //   });
    
      // }


      if (!gotTheLock) {
        app.quit();
      } else {
        app.on('second-instance', () => {
          // Focus the existing window if it exists
          if (win) {
            if (win.isMinimized()) win.restore();
            win.focus();
          }
        });

      }



     

      // Check if the system is in sleep mode
      // const isSystemSleeping = () => {
      //   try {
      //       const time = powerMonitor.getSystemIdleState();
      //       return time === 'locked' || time === 'idle';
      //   } catch (error) {
      //       console.error('Error checking system state:', error);
      //       return false; // Default to false if an error occurs
      //   }
      // };

      // Example usage
      // if (isSystemSleeping()) {
      //   console.log('System is sleeping');
      // } else {
      //   console.log('System is awake');
      // }


      let idleStartTime = null;

      // Event listener for when the system becomes idle
      powerMonitor.on('lock-screen', () => {
          idleStartTime = new Date();
          console.log('System became idle at:', idleStartTime);
          writeLogFile('System became idle at:', idleStartTime);

      });

      // Event listener for when the system becomes active
      powerMonitor.on('unlock-screen', () => {
          if (idleStartTime) {
              const idleEndTime = new Date();
              const idleTime = idleEndTime - idleStartTime;
              console.log('System was idle for:', idleTime, 'milliseconds');
              writeLogFile('System was idle for:', idleTime, 'milliseconds');
              idleStartTime = null;
          }
      });


      // intervalId = null;
      // writeLogFile('intervalId line 159');

      readUserData();
      // autoUpdater.checkForUpdatesAndNotify();

      console.log('isWindows = ', isWindows )
      console.log('isLinux = ', isLinux )
      console.log('mode = ', process.mode );
      // window start

      // Function to check for system inactivity
      function checkSystemInactivity() {
        console.log('Checking system inactivity...');
        // Perform actions for system inactivity here
      }

      // Set the event listeners for system lock and unlock
      powerMonitor.on('lock-screen', () => {
        console.log('System is locked.');
        stopAllScreenshotProcesses();
        
        // If there was a previous inactiveTimer, clear it
        if (inactiveTimer) {
          clearTimeout(inactiveTimer);
        }
      });

      powerMonitor.on('unlock-screen', () => {
        console.log('System is unlocked.');
        intervalId = null;
        writeLogFile('intervalId line 188');

        readUserData();
        // Set a new timer for 2 minutes (120,000 milliseconds)
        inactiveTimer = setTimeout(checkSystemInactivity, 120000);
      });




      function userInactive() {
        console.log('User has been inactive for 1 minutes.');
        // win.webContents.send('show-console-message', 'User has been inactive for 3 minutes.');
        }
        // Event listener for when the window gains focus (becomes active)
        app.on('browser-window-focus', () => {
          console.log('Window is now active.');
          // If there was a previous userInactiveTimeout, clear it
          if (userInactiveTimeout) {
            clearTimeout(userInactiveTimeout);
          }
        });
      
        // Event listener for when the window loses focus (becomes inactive)
        app.on('browser-window-blur', () => {
          console.log('Window is now inactive.');
          // Set a new userInactiveTimeout for 3 minutes
          userInactiveTimeout = setTimeout(userInactive, 1 * 60 * 1000); // 3 minutes in milliseconds
        });

        console.log(`tray => ${tray}`);

      if(userData && userData.apiResponse !== undefined){

        // if(!tray){

          const iconPath = path.join(__dirname, 'assets/icon.png');
          
          tray = new Tray(iconPath)
          
          tray.on('click', () =>{
            
            // shell.openExternal(`${apiurl}/user-view/${userData.apiResponse.token}`);
            shell.openExternal(`${config.API_URL}/user-view/${userData.apiResponse.token}`);
            
          })
          
          tray.setToolTip('Rvs Tracker')
          tray.setContextMenu(menu)
          
          // app.relaunch();
          // app.exit(0);
        // }
      }else{
        createWindow();
      }


      // checkScreenSharingPermission();

      app.on('activate', () => {
        
        // if (BrowserWindow.getAllWindows().length === 0) {
        //   createWindow()
        // }

        if (win === null && (!userData || userData.apiResponse === undefined)) {
          createWindow();
        }

      })


      app.on('window-all-closed', () => {
        console.log('close')
        // win.minimize()
        // On macOS, quit the app when all windows are closed
        if (process.platform === 'darwin') {
          app.quit();
        }
      });



      // Listen for the message from the renderer process
      ipcMain.on('logout', async() => {
        // Call the function in the main process
        const filePath = path.join(__dirname, 'data.json');
        await clearDataFile(dataFilePath);
        // createWindow();
        app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
        app.exit(0)
      });


      // Register multiple global hotkeys using a loop
      // for (const acc of accelerators) {
      //   globalShortcut.register(acc, () => {
      //     console.log(`Keyboard activity detected for accelerator: ${acc}`);
      //   });
      // }
    
      // Start capturing screen data for mouse and keyboard tracking
      // startActivityTracking();

  })

// end ready 

// function runDemoScript() {
//   const demoPath = path.join(__dirname, 'notification.js'); // Path to your notification.js file
//   const electronPath = path.join(__dirname, 'node_modules', '.bin', 'electron.cmd'); // Adjust for Windows

//   const arrayData = readUserArray('dob');
  
//   console.log('arrayData = ', arrayData)
//   // const serializedArray = JSON.stringify(arrayData); // Convert array to JSON string
  
//   // Spawn a new Electron process running the notification.js script
//   const demoProcess = spawn(electronPath, [demoPath, arrayData]);

//   demoProcess.stdout.on('data', (data) => {
//     console.log(`stdout: ${data}`);
//   });

//   demoProcess.stderr.on('data', (data) => {
//     console.error(`stderr: ${data}`);
//   });

//   demoProcess.on('close', (code) => {
//     console.log(`child process exited with code ${code}`);
//   });

//   // Automatically close the process after 10 seconds
//   setTimeout(() => {
//     demoProcess.kill(); // Kill the process
//     console.log('Child process terminated.');
//   }, 10000); // 10 seconds (10000 milliseconds)
// }



// runDemoScript();



function processScreenData(stream) {
  // You can use the stream data to analyze mouse and keyboard activity
  // For example, you can use robotjs to check for mouse and keyboard events

  // For demonstration purposes, we'll log a message when the stream is active
  stream.oninactive = () => {
    console.log('Screen stream stopped. Activity tracking terminated.');
  };
}

function myMainProcessFunction() {
  console.log('Main process function was called!');
  // Your main process logic here
}

// Function to capture the screenshot of a specific screen
async function captureScreen(screenId) {
  
  const sources = await desktopCapturer.getSources({ types: ['screen'], thumbnailSize: screen.getPrimaryDisplay().workAreaSize });

  console.log('sources == , ', sources);
  
  for (const source of sources) {
    // if (source.display_id === 2779098405) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            mandatory: {
              chromeMediaSource: 'desktop',
              chromeMediaSourceId: source.id,
              minWidth: 1280,
              maxWidth: 1280,
              minHeight: 720,
              maxHeight: 720,
            },
          },
        });
        
        console.log('source.display_id = ', stream)
        const videoTrack = stream.getVideoTracks()[0];
        const imageCapture = new ImageCapture(videoTrack);
        const bitmap = await imageCapture.grabFrame();
        stream.getTracks().forEach((track) => track.stop());
        return bitmap;
      } catch (error) {
        console.error('Error capturing screen:', error);
      }
    // }
  }
}




ipcMain.on('login', async (event) => {
  console.log('login herer');
  event.sender.send('login-success', { success: false, error: 'Failed to save screenshot' });
})





// Function to stop all screenshot processes
function stopAllScreenshotProcesses() {
  if (screenshotIntervals && screenshotIntervals.length > 0) {
    screenshotIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    screenshotIntervals = []; // Clear the array
  }
}



// Read the data from data.json
let userData = {};

function readUserData() {
  try {
    // const rawData = fs.readFileSync(path.join(__dirname, 'data.json'));
    const rawData = fs.readFileSync(dataFilePath);
    userData = JSON.parse(rawData);
    const user = userData?.apiResponse?.user;

    if (!user) {
      console.log('User is null');
      return;
    }

    // Only start the interval if it's not already running
    if (!intervalId) {
      const delay = timerFunc.screenshort_time();
      intervalId = setInterval(() => {
        console.log('callscreenshort started delay....', delay);
        if(isWindows){
          ipcMain.emit('capture-screenshot', 'Capture screenshot taken');
        }
        if(isLinux){
          captureScreenshot();
        }
      }, delay);
    }

    // new code
    // if (!intervalId) {
    //   // Function to execute inside the interval
    //   const intervalFunction = () => {
    //     const delay = timerFunc.screenshort_time();
    //     console.log('callscreenshort started delay....', delay);
    //     if (isWindows) {
    //       ipcMain.emit('capture-screenshot', 'Capture screenshot taken');
    //     }
    //     if (isLinux) {
    //       captureScreenshot();
    //     }
    //   };
    
    //   // Start the interval
    //   intervalId = setInterval(intervalFunction, timerFunc.screenshort_time());
    // }

    // // Clear the interval
    // if (intervalId) {
    //   clearInterval(intervalId);
    //   intervalId = null; // Reset intervalId to indicate it's cleared
    // }
    // new code

    screenshotIntervals.push(intervalId);

    const timeLineInterval = setInterval(async () => {
      // const new_chartData = await activityTracker.getChartData();
      // const data = JSON.stringify(new_chartData);
      // const timelineApiurl = `${apiurl}/api/timieline_store`;

      // chartData = new_chartData;
      screenshotIntervals.push(timeLineInterval);

      // const response = common.checkAndClearFiles();
      // const timer = await common.loadTimeFromFile();

      // uploadTimeline(data, timelineApiurl, timer);
      // win.webContents.send('timer', response);
    }, 60000);

    screenshotIntervals.push(intervalId);
    // setInterval(getIdleTime, 300000); // Run every 5 minutes for activity track
  } catch (error) {
    console.error('Error reading data.json:', error);
  }
}


readUserData();



ipcMain.on('event2', (event, arg) => {
  console.log('Received event2 with argument:', arg);
});




function LoginNotification(title, body, fix) {
  
  const notification = new Notification(
    {
      title: title,
      subtitle: 'Subtitle of the Notification',
      body: body,
      silent: false,
      icon: path.join(__dirname, 'assets/icon.png'),
      hasReply: true,  
      timeoutType: fix ? 'never' : true ,
      replyPlaceholder: 'Reply Here',
      urgency: 'critical' 
    }
  );

  notification.show();
}


ipcMain.on('login-attempt', async (event, loginData) => {
  const apiLoginUrl = `${config.API_URL}/api/login`;
  try {
    const response = await axios.post(apiLoginUrl, loginData);
    userData.apiResponse = response.data;
    if (userData.apiResponse.auth === 'done') {
      handleLoginSuccess(userData.apiResponse.user);
    } else {
      handleLoginFailure('Wrong email password');
    }
  } catch (error) {
    handleLoginFailure('Wrong email password');
  }
});

function handleLoginSuccess(user) {

  console.log('user handleLoginSuccess', user)

  const name = `${user.first_name} ${user.last_name}`;
  fs.writeFileSync(dataFilePath, JSON.stringify(userData, null, 2));
  // fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(userData, null, 2));
  closeAllWindows();
  // createWindow();
  readUserData();
  LoginNotification('Login Successfully!', name);
  // win.minimize();

  // Set the app to open at login
  app.setLoginItemSettings({
    openAtLogin: true
  });


    // Restart the app
    app.relaunch();
    app.exit(0);
}

function handleLoginFailure(message) {
  console.error('Login failed:', message);
  LoginNotification('Login Failed!', message);
  app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
  app.exit(0);
}





ipcMain.on('capture-screenshot', async (event) => {
    // console.log('login herer capture-screenshot');
    const displays = screen.getAllDisplays();
    const screenshots = await Promise.all(
    displays.map(async (display) => {
      const screenshot = await captureScreen(display.id);
      console.log('display = ', display);

      const primaryDisplay = display;
      // const primaryDisplay = screen.getPrimaryDisplay();

      // Get its size
      const { width, height } = primaryDisplay.size;

      // Set up the options for the desktopCapturer
      const options = {
        types: ['screen'],
        thumbnailSize: { width, height },
      };

      // Get the sources
      const sources = await desktopCapturer.getSources(options);
      console.log('sources = ', sources);
      
      // Find the primary display's source
      const primarySource = sources.find(({display_id}) => display_id == primaryDisplay.id)
      
      // Get the image
      const image = primarySource.thumbnail;
      
      const dataURL = image.toDataURL();

      // Generate a unique filename for the image
      const filename = `screenshot_${Date.now()}.png`;

      // Create the "images" folder if it doesn't exist
      // const imagesFolderPath = path.join(app.getPath('downloads'), 'images');
      const imagesFolderPath = path.join(__dirname, 'images');
      if (!fs.existsSync(imagesFolderPath)) {
        fs.mkdirSync(imagesFolderPath);
      }

      // Save the image file to the "images" folder
      const filePath = path.join(imagesFolderPath, filename);

      fs.writeFile(filePath, image.toPNG(), (error) => {
        if (error) {
          console.error('Error saving the screenshot:', error);
          // event.sender.send('screenshot-captured', { success: false, error: 'Failed to save screenshot' });
        } else {
          console.log('Screenshot saved:', filePath);
          const uploadUrl = `${config.API_URL}/api/save_screenshort`;
          // const uploadUrl = 'http://erp.test/api/save_screenshort';
          uploadImage(filePath, uploadUrl);

          console.log('logged user :', userData);
          // event.sender.send('screenshot-captured', { success: true, filePath: filePath });

        }
      });



      // return true;
    })
  );

});

// open dynamic link 
ipcMain.on('open-link', (event, url) => {
  shell.openExternal(url);
} )


// Function to capture screenshot
async function captureScreenshotold() {
  // Generate a unique filename for the image
  const filename = `screenshot_${Date.now()}.png`;

  // Create the "images" folder if it doesn't exist
  const imagesFolderPath = path.join(__dirname, 'images');
  if (!fs.existsSync(imagesFolderPath)) {
    fs.mkdirSync(imagesFolderPath);
  }

  // Specify the full file path for the screenshot
  const filePath = path.join(imagesFolderPath, filename);

  // Execute the scrot command to capture the screenshot and save it to the specified file path
  exec(`scrot "${filePath}"`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error capturing screenshot: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`Screenshot captured: ${filePath}`);

    const dialogOpts = {
      type: 'info',
      buttons: ['ok'],
      title: 'Update Available',
      message: filePath
    };
  
    dialog.showMessageBox(dialogOpts);

    const uploadUrl = `${config.API_URL}/api/save_screenshort`;
    // const uploadUrl = 'http://erp.test/api/save_screenshort';
    uploadImage(filePath, uploadUrl);

  });
}


async function captureScreenshot() {
  // Generate a unique filename for the image
  const filename = `screenshot_${Date.now()}.png`;

  // Create the "images" folder if it doesn't exist
  const tempDir = app.getPath('temp');
  const logfile = path.join(appTempDir, 'log.txt');


  console.log(`logfiile = ${logfile}`);
  const imagesFolderPath = path.join(tempDir, 'images');
  if (!fs.existsSync(imagesFolderPath)) {
    fs.mkdirSync(imagesFolderPath);
  }

  // Specify the full file path for the screenshot
  const filePath = path.join(imagesFolderPath, filename);

  // Log file path
  fs.appendFileSync(logfile, `Capturing screenshot to ${filePath}\n`);
  // fs.writeFileSync(logFilePath, JSON.stringify(timelineData, null, 2));

  // Execute the scrot command to capture the screenshot and save it to the specified file path
  exec(`scrot "${filePath}"`, (error, stdout, stderr) => {
    if (error) {
      fs.appendFileSync(logfile, `Error capturing screenshot: ${error.message}\n`);
      console.error(`Error capturing screenshot: ${error.message}`);
      return;
    }
    if (stderr) {
      fs.appendFileSync(logfile, `stderr: ${stderr}\n`);
      console.error(`stderr: ${stderr}`);
      return;
    }
    fs.appendFileSync(logfile, `Screenshot captured: ${filePath}\n`);
    const uploadUrl = `${config.API_URL}/api/save_screenshort`;
    // const uploadUrl = 'http://erp.test/api/save_screenshort';
    uploadImage(filePath, uploadUrl);
    // console.log(`Screenshot captured: ${filePath}`);
    // const dialogOpts = {
    //   type: 'info',
    //   buttons: ['ok'],
    //   title: 'image saved',
    //   message: filePath
    // };
  
    // dialog.showMessageBox(dialogOpts);
  });
}




// Function to convert a Buffer to a Blob
function bufferToBlob(buffer) {
  const readable = new Readable();
  readable._read = () => {};
  readable.push(buffer);
  readable.push(null);

  return new Blob([readable.read()]);
}


// Function to upload an image using Axios
async function uploadImage(imagePath, uploadUrl, user) {
  try {
    const imageBuffer = fs.readFileSync(imagePath);
    const imageBlob = bufferToBlob(imageBuffer);

    const formData = new FormData();
    formData.append('image', imageBlob, imagePath);
    formData.append('id', userData.apiResponse.user.id);
    formData.append('token', userData.apiResponse.token);

    const headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${userData.apiResponse.token}`,
    };

    const response = await axios.post(uploadUrl, formData, {
      headers: headers,
    });

    deleteImage(imagePath);
    console.log('Image uploaded successfully:', response.data.message);
    // console.log('logged_user : ', logged_user);


  } catch (error) {
    console.error('Error while uploading image:', error.message);
    console.log(error.response.status);

    if(error.response.status === 401){
      ipcMain.emit('logout', 'logout ...');
    }
  }
}


function deleteImage(filePath)
{
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error('Error deleting image file:', err);
      // res.status(500).send('Error deleting image file');
    } else {
      console.log('Image file deleted successfully.');
      // res.send('Image file deleted');
    }
  });

}


// Function to clear the data.json file
async function clearDataFile(filePath) {
  // Create an empty JSON object
  const emptyData = {};

  // Convert the empty object to JSON format
  const emptyJsonData = JSON.stringify(emptyData);

  // Write the empty JSON data to the file
  fs.writeFile(filePath, emptyJsonData, (err) => {
    if (err) {
      console.error('Error clearing JSON file:', err);
    } else {
      console.log('Data.json file cleared successfully.');
      closeAllWindows();
      if (process.platform === 'darwin') {
        app.quit();
      }
      
      // createWindow();
    }
  });
}


// Function to upload an json using Axios
async function uploadTimeline(data, uploadUrl, time) {
  try {
    // const imageBuffer = fs.readFileSync(imagePath);

    const formData = new FormData();
    formData.append('value', data);
    formData.append('time', time);
    formData.append('id', userData.apiResponse.user.id);
    formData.append('token', userData.apiResponse.token);
    // formData.append('time', time);
    
    const headers = {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${userData.apiResponse.token}`,
    };
    
    const response = await axios.post(uploadUrl, formData, {
      headers: headers,
    });
    
    console.log('update timeline successfully:', response.data);
    console.log('update timeline time on uploadTimeline :', time);

  } catch (error) {
    console.error('Error while updating timeline:', error.message);
    console.log(error.response.status);

    if(error.response.status === 401){
      ipcMain.emit('logout', 'logout ...');
    }
  }
}


// Function to upload an json using Axios
async function updateNotification(minutes, uploadUrl) {
  try {

    const formData = new FormData();
    formData.append('idleTime', minutes);
    formData.append('id', userData.apiResponse.user.id);
    formData.append('token', userData.apiResponse.token);

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userData.apiResponse.token}`,
    };

    const response = await axios.post(uploadUrl, formData, {
      headers: headers,
    });

    console.log('Inactive notification:', response.data);

  } catch (error) {
    console.error('Error while sending inactive notification:', error.message);
    console.log(error.response.status);

    if(error.response.status === 401){
      ipcMain.emit('logout', 'logout ...');
    }
  }
}


// Function to close all windows
function closeAllWindows() {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    window.close();
  });
}




app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});


app.setLoginItemSettings({
  openAtLogin: true    
})


// Check if the app was started at login
// const loginItemSettings = app.getLoginItemSettings();
// console.log(`loginItemSettings: ${loginItemSettings.wasOpenedAtLogin}`);
// if (loginItemSettings.wasOpenedAtLogin) {
//   // Relaunch the app
//   app.relaunch();
//   app.quit();
// } else {
//   // createWindow();
// }

function checkScreenSharingPermission_old() {
  desktopCapturer.getSources({ types: ['screen'] })
    .then(sources => {
      if (sources.length > 0) {
        console.log('Screen sharing permission is granted.');
        // You can perform further actions if the permission is granted
      } else {
        console.log('Screen sharing permission is not granted.');
        // You can handle the scenario where the permission is not granted
        showPermissionDialog()
      }
    })
    .catch(error => {
      console.error('Error checking screen sharing permission:', error);
    });
}

function showPermissionDialog() {
  dialog.showMessageBox(mainWindow, {
    type: 'question',
    title: 'Screen Sharing Permission',
    message: 'This application needs screen sharing permission to capture your screen. Do you want to grant the permission?',
    buttons: ['Grant Permission', 'Cancel'],
    defaultId: 0,
    cancelId: 1
  }).then(result => {
    if (result.response === 0) {
      // The user clicked 'Grant Permission'
      // settings.set('screenSharingPermission', true);
      // You can request the screen sharing permission again or open a new window to start screen capturing
      // For example:
      // mainWindow.webContents.send('request-screen-sharing-permission');
    } else {
      // The user clicked 'Cancel' or closed the dialogl
      // You can handle the scenario where the user denies the permission
      // settings.set('screenSharingPermission', false);
    }
  }).catch(error => {
    console.error('Error showing permission dialog:', error);
  });
}

if (process.platform === 'win32')
{
    app.setAppUserModelId('Rvs DeskTime')
}


function startPythonScript(){
  const pythonProcess = spawn('python', [path.join(__dirname, 'activity.py')] )

  pythonProcess.stdout.on('data', (data) =>{
    console.log('stdout = ', data.toString());
  })

  pythonProcess.stderr.on('data', (data) =>{
    console.error('stderr = ',data.toString());
  })

  // Handle the Python script exit event
  pythonProcess.on('exit', (code) => {
    console.log(`Python script exited with code ${code}`);
  });

  // Handle errors related to the Python script process
  pythonProcess.on('error', (err) => {
    console.error('Error occurred in Python process:', err);
  });

}



// run python file

function getIdleDurationFromPython(){
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [path.join(__dirname, 'activity.py')] )

    let result = '';
     pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
     })

     pythonProcess.stderr.on('data', (data) => {
      reject(data.toString());
     });

     pythonProcess.on('close', (code) => {
      if(code === 0){
        resolve(parseFloat(result));
      }else{
        reject(`Python script exited with non-zero code ${code}`);
      }
     })


  })
}


async function runPythonScriptGetIdleDuration(){
  try{
    const idleDuration = await getIdleDurationFromPython();
    // console.log(`Idle duration (seconds): ${idleDuration}`);
    // console.log(idleDuration);
    win.webContents.send('idleTime', idleDuration)
  }catch(error){
    console.error(`Error occured: ${error}`)
  }
}


async function runActivityPy(){
  try{
    // Load pyodide using 'loadPyodide' function.
    const pyodide = await loadPyodide();

    // Read the content of 'activity.py'.
    const activityPath = path.join(__dirname, 'activity.py');
    const activityCode = fs.readFileSync(activityPath, 'utf8');

    // Run the Python code from 'activity.py'.
    const result = await pyodide.runPythonAsync(activityCode);
    console.log('Python Output:', result);
  }catch(error){
    console.error('Error executing Python code:', error);
  }
}

// helper functions


const mainexe = path.join(__dirname, 'main.exe');
// function
function getIdleDurationFromExe() {
  return new Promise((resolve, reject) => {
    const childProcess = spawn(mainexe);

    let output = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      reject(new Error(data.toString()));
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(parseFloat(output));
      } else {
        reject(new Error(`Error: Non-zero exit code ${code}`));
      }
    });
  });
}


async function getIdleTime(){
  getIdleDurationFromExe()
  .then((idleDuration) => {

    let minutes = (idleDuration / 60).toFixed(2);
    console.log('Idle Duration (seconds):', idleDuration);
    win.webContents.send('idleTime', idleDuration)
    if(minutes > 5){
      // win.webContents.send('idleTime', 'Inactive')
      let notificationUrl = `${config.API_URL}/api/notification_inactive`;
      // let notificationUrl = 'http://erp.test/api/notification_inactive';
      updateNotification(minutes, notificationUrl)
      LoginNotification('Inactive', 'Since 5 mint ago!', true)
    }
    // console.log(idleDuration);
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });
}


// Function to write log file
function writeLogFile(data) {
  const downloadPath = app.getPath('downloads');
  const logFilePath = path.join(downloadPath, 'log.txt');

  // Append data to the log file
  fs.appendFile(logFilePath, data + '\n', (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    } else {
      console.log('Data appended to log file:', data);
    }
  });
}


function openshell() {
  // Get the URL
  // const url = "https://track360.rvsmedia.com/forget-password";
  const url = "https://google.com";

  // Open the URL in the default browser
  shell.openExternal(url);
}



// writeLogFile('This is a log message.');
