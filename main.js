const { app, BrowserWindow, desktopCapturer, screen, ipcMain, Menu, Tray , powerMonitor , Notification, globalShortcut, shell , dialog   } = require('electron')
const { autoUpdater } = require('electron-updater');
const fs = require('fs')
const path = require('path')
const axios = require('axios');
const { Readable } = require('stream');
const { Blob } = require('buffer');
const { log } = require('console');
const { spawn } = require('child_process');
const { loadPyodide } = require('pyodide')
const common = require('./functions/common')

const trackingPath = path.join(__dirname, 'data', 'tracking.json');
const functionPath = path.join(__dirname, 'functions', 'timer');

const { version } = require(path.join(__dirname, 'package.json'));
console.log(`App version: ${version}`);

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
    message: 'A new version is available. Do you want to download it now?'
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

autoUpdater.on('error', (error) => {
  console.error('Error in auto-updater:', error);
  dialog.showErrorBox('Error', error == null ? 'unknown' : (error.stack || error).toString());
});
// app update functionality end

const timerFunc = require(functionPath)
const ActivityTracker = require("./ActivityTracker");

const activityTracker = new ActivityTracker( trackingPath, 2000);

activityTracker.init();

// Configure the URL of the update manifest
// autoUpdater.setFeedURL({
//   provider: 'generic',
//   url: 'http://erp.test/update-manifest' // Replace this with your actual update manifest URL
// });




const isWindows = process.platform === 'win32';
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

// var apiurl = 'https://track360.rvsmedia.com';
// var apiurl = 'https://app.idevelopment.site';
var apiurl = 'http://erp.test';

const filePath = path.join(__dirname,'dist', 'rvsdesktime Setup 1.2.4.exe');
const exePath = path.join(__dirname, 'update.json');

const menuTemplate = [  
  // {
  //   label: 'Home',
  //   click: () => {
  //     // mainWindow.loadURL('http://localhost:3007');
  //     win.loadFile(path.join(__dirname, 'index.html'));
  //   }
  // },
  
  // {
  //   label: 'About',
  //   click: () => {
  //     // Create a new window when "About" is clicked
  //     // createAboutWindow()
  //     mainWindow.webContents.loadFile('about.html');
  //   }
  // },
  {
       role: 'quit' 
  }
]


const menu = Menu.buildFromTemplate(menuTemplate)
Menu.setApplicationMenu(menu)


const createWindow = () => {
  win = new BrowserWindow({
    width: 600,
    height: 450,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
    // open dev tools
    // win.webContents.openDevTools();


    // Check if userData is not null, and decide which page to load.
    if (userData.apiResponse) {
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

// app.on('ready', () => {
//   autoUpdater.checkForUpdatesAndNotify();
// });

    app.whenReady().then(() => {

      autoUpdater.checkForUpdatesAndNotify();


      // Check if another instance of the app is already running
      const gotTheLock = app.requestSingleInstanceLock();
      console.log('gotTheLock', gotTheLock);

      if (!gotTheLock) {
        app.quit();
      } else {
        app.on('second-instance', () => {
          // If window is closed, reload it
          if (!win) {
            createWindow();
          } else {
            if (win.isMinimized()) win.restore();
            win.focus();
          }
        });
    
        // Create window
        // createWindow();
      }


     

      // Check if the system is in sleep mode
      const isSystemSleeping = () => {
        try {
            const time = powerMonitor.getSystemIdleState();
            return time === 'locked' || time === 'idle';
        } catch (error) {
            console.error('Error checking system state:', error);
            return false; // Default to false if an error occurs
        }
      };

      // Example usage
      if (isSystemSleeping()) {
        console.log('System is sleeping');
      } else {
        console.log('System is awake');
      }


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

    // Set a custom user data folder path
    // const customUserDataPath = path.join(app.getPath('downloads'), 'erp');
    // app.setPath('downloads', customUserDataPath);
    // Function to perform actions when the user becomes inactive



      const iconPath = path.join(__dirname, 'assets/icon.png');

      tray = new Tray(iconPath)

      tray.on('click', () =>{

        if (!win) {
          createWindow();
        } else {

          console.log('win', win);

          win.isVisible()?win.hide():win.show()
          win.focus()
          // shell.openExternal(`https://app.idevelopment.site/token/${userData.apiResponse.secret}`);
          shell.openExternal(`${apiurl}/user-view/${userData.apiResponse.token}`);
          // createWindow()
          // console.log('hererer  fff')
        }


      })

      tray.setToolTip('Rvs Tracker')

      tray.setContextMenu(menu)

      createWindow()
      // checkScreenSharingPermission();

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          createWindow()
        }
      })


      app.on('window-all-closed', () => {
        console.log('close')
        // win.minimize()
        // On macOS, quit the app when all windows are closed
        // if (process.platform === 'darwin') {
          // app.quit();
        // }
      });


  // Start the Python script
  // startPythonScript();



  // ipcMain.on('open-window', () => {
  //   win.restore();
  // });


  // Listen for the message from the renderer process
  ipcMain.on('logout', async() => {
    // Call the function in the main process
    const filePath = path.join(__dirname, 'data.json');
    await clearDataFile(filePath);
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

// function startActivityTracking() {
//   // Start capturing screenshots every 5 minutes (adjust the interval as needed)
//   activityTimer = setInterval(captureScreenshot, 20000);
// }



function captureScreenshot() {
  desktopCapturer.getSources({ types: ['screen'] })
    .then(async (sources) => {
      // Use the first screen source to capture the screen
      if (sources.length > 0) {
        const screenSource = sources[0];

        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: screenSource.id,
                minWidth: 1280,
                maxWidth: 1280,
                minHeight: 720,
                maxHeight: 720,
              },
            },
          });

          // Process the screen data to detect mouse and keyboard activity
          processScreenData(stream);
        } catch (err) {
          console.error('Error accessing screen:', err);
        }
      }
    })
    .catch((err) => {
      console.error('Error getting screen sources:', err);
    });
}

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


// Read the data from data.json
let userData = {};


// Function to stop all screenshot processes
function stopAllScreenshotProcesses() {
  if (screenshotIntervals && screenshotIntervals.length > 0) {
    screenshotIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    screenshotIntervals = []; // Clear the array
  }
}

function readUserData2() {

  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'data.json'));
    userData = JSON.parse(rawData);

    // Access the 'user' property using optional chaining
    const user = userData?.apiResponse?.user;

    if( typeof user === 'undefined'){
      console.log(' use is null')
    }else{
      console.log(' use exit ', user)

      // const delay = 1 * 60 * 1000; // 15 minutes
      // get random time from 9 mint to 15 mint
      const delay =  timerFunc.screenshort_time()

      // const delay =  5000; // 5 seconds
      const intervalId = setInterval(() =>{
        console.log('callscreenshort started  delay....', delay);
        ipcMain.emit('capture-screenshot', 'capture screenshot ..... taken');
      }, delay);

      // const delay =  2000; // 2 seconds
      const timeLineInterval = setInterval(async () => {
        const new_chartData = await activityTracker.getChartData();
        var data = JSON.stringify(new_chartData);
        // const timelineApiurl = 'http://erp.test/api/timieline_store';
        // const timelineApiurl = 'https://app.idevelopment.site/api/timieline_store';
        const timelineApiurl = `${apiurl}/api/timieline_store`;

        console.log('============================');
        
        //  console.log('data', data)
        
        // timer = await timerFunc.checkAndClearFiles()
        // uploadTimeline(data, timelineApiurl, timer)

        
        //  console.log(JSON.stringify(new_chartData, null, 2));
        // win.webContents.send('idleTime', 'Inactive')
        // win.webContents.send('timer', timer)
        // console.log('============================', timer);

        chartData = new_chartData;
        screenshotIntervals.push(timeLineInterval)

       
        // running timer
        const respnose = common.checkAndClearFiles();

        // read time from timer.json file
        timer =  await common.loadTimeFromFile()

        // writeLogFile(`timelineApiurl: ${timelineApiurl}`);
        // writeLogFile(`timer: ${timer}`);
        // writeLogFile(`data: ${data}`);

        uploadTimeline(data, timelineApiurl, timer);


        win.webContents.send('timer', respnose)

      }, 60000);

      screenshotIntervals.push(intervalId)
        

      // activity track
      // const pythonTime = 900000;
      const pythonTime = 300000;
      // setInterval(runPythonScriptGetIdleDuration, pythonTime);
      setInterval(getIdleTime, pythonTime);

    }


  } catch (error) {
    console.error('Error reading data.json:', error);
  }
}

// function readUserData_new() {
//   try {
//     const rawData = fs.readFileSync(path.join(__dirname, 'data.json'));
//     userData = JSON.parse(rawData);
//     const user = userData?.apiResponse?.user;

//     if (!user) {
//       console.log('User is null');
//       return;
//     }

//     const delay = timerFunc.screenshort_time();
//     const intervalId = setInterval(() => {
//       console.log('callscreenshort started delay....', delay);
//       ipcMain.emit('capture-screenshot', 'Capture screenshot taken');
//     }, delay);
//     screenshotIntervals.push(intervalId);

//     const timeLineInterval = setInterval(async () => {
//       const new_chartData = await activityTracker.getChartData();
//       const data = JSON.stringify(new_chartData);
//       const timelineApiurl = `${apiurl}/api/timieline_store`;

//       chartData = new_chartData;
//       screenshotIntervals.push(timeLineInterval);

//       const response = common.checkAndClearFiles();
//       const timer = await common.loadTimeFromFile();

//       uploadTimeline(data, timelineApiurl, timer);
//       win.webContents.send('timer', response);
//     }, 60000);

//     screenshotIntervals.push(intervalId);
//     setInterval(getIdleTime, 300000); // Run every 5 minutes for activity track
//   } catch (error) {
//     console.error('Error reading data.json:', error);
//   }
// }


function readUserData() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'data.json'));
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
        ipcMain.emit('capture-screenshot', 'Capture screenshot taken');
      }, delay);
    }

    screenshotIntervals.push(intervalId);

    const timeLineInterval = setInterval(async () => {
      const new_chartData = await activityTracker.getChartData();
      const data = JSON.stringify(new_chartData);
      const timelineApiurl = `${apiurl}/api/timieline_store`;

      chartData = new_chartData;
      screenshotIntervals.push(timeLineInterval);

      const response = common.checkAndClearFiles();
      const timer = await common.loadTimeFromFile();

      uploadTimeline(data, timelineApiurl, timer);
      // win.webContents.send('timer', response);
    }, 60000);

    screenshotIntervals.push(intervalId);
    setInterval(getIdleTime, 300000); // Run every 5 minutes for activity track
  } catch (error) {
    console.error('Error reading data.json:', error);
  }
}


readUserData();


ipcMain.on('event2', (event, arg) => {
  console.log('Received event2 with argument:', arg);
});

  // ipcMain.on()


 // Listen for the message from the renderer process
 ipcMain.on('test', async() => {
  // Call the function in the main process
  
  // win.minimize()
  // filePath
  // autoUpdater.setFeedURL(exePath); 
  // autoUpdater.checkForUpdates(); 

  // autoUpdater.on('update-available', () => {
  //   console.log('Update available. Downloading...');
  // });

  // autoUpdater.on('update-downloaded', () => {
  //   console.log('Update downloaded. Ready to install.');
  //   // Perform any actions you want before installing the update
  //   // For example, you can notify the user to save their work and then quit the app.
  //   // After the app is restarted, the new version will be launched.
  //   autoUpdater.quitAndInstall();
  // });

  const new_chartData_test = await activityTracker.getChartData();
  var data = JSON.stringify(new_chartData_test);

  console.log('============================');
  console.log(JSON.stringify(new_chartData_test, null, 2));

  // autoUpdater.on('error', (err) => {
  //   console.error('Error checking for updates:', err);
  // });

  // const updateDD =  autoUpdater.checkForUpdates();

  // console.log(' filePath new = ', filePath)


  // shell.openExternal(`http://erp.test/token/${user.apiResponse.secret}`);
  
  console.log('jdsfksdj new')

  var demo = Notification.isSupported()
  console.log('test....', demo)
  // LoginNotification('Inactive', 'Since 15 mint ago!')




});

// console.log('userData = ', userData )

// Function to show a notification
function showNotification(title, body,fix) {
  // const notification = new Notification({
  //   title: title,
  //   body: body,
  // });
  const notification = new Notification(
    {
      title: 'Custom Notification',
      subtitle: 'Subtitle of the Notification',
      body: 'Body of Custom Notification',
      silent: false,
      icon: path.join(__dirname, 'assets/icon.png'),
      hasReply: true,  
      // timeoutType: fix ? 'never' : true , 
      replyPlaceholder: 'Reply Here',
      urgency: 'critical' 
    }
  );

  notification.show();
}


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


// ipcMain.on('login-attempt', async (event, loginData) => {

//   // console.log('loginData', loginData);

//   var apiLoginUrl = `${apiurl}/api/login`;
//   // var apiLoginUrl = 'http://erp.test/api/login';


//   try {
//     // Send the login request to the API
//     const response = await axios.post(apiLoginUrl, loginData);

//     // Save the response data to data.json
//     userData.apiResponse = response.data;

//     if(userData.apiResponse.auth ==='done'){

//       let name = `${userData.apiResponse.user.first_name} ${userData.apiResponse.user.last_name}`
//       fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(userData, null, 2));
//       // win.reload();
//       // Redirect to the dashboard.
//       closeAllWindows();
//       createWindow();
//       // win.loadFile(path.join(__dirname, 'dashboard.html'));
//       console.log('userData');
//       readUserData()
//       LoginNotification('Login Successfully!', name );
//       win.minimize();
//       // win.webContents.send('show-dashboard', loginData);
//       //win.webContents.send('show-dashboard', userData); // Pass userData to dashboard.html
//     }else{
//       console.log('error');
//       app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
//       app.exit(0)
//       // win.minimize();
//       event.sender.send('login-failed', 'Wrong email password');
//       LoginNotification('Login Failed!', 'Wrong email password' );
//     }
//   } catch (error) {
//     // win.reload();
//     app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) })
//     app.exit(0)
//     console.error('Login failed:', 'Wrong email password');
//     LoginNotification('Login Failed!', 'Wrong email password' );
//     event.sender.send('login-failed', 'Wrong email password');
//   }
// });

ipcMain.on('login-attempt', async (event, loginData) => {
  const apiLoginUrl = `${apiurl}/api/login`;
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
  const name = `${user.first_name} ${user.last_name}`;
  fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(userData, null, 2));
  closeAllWindows();
  createWindow();
  readUserData();
  LoginNotification('Login Successfully!', name);
  win.minimize();
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
          const uploadUrl = `${apiurl}/api/save_screenshort`;
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


// function checkScreenSharingPermission() {
//   const permissionGranted = settings.get('screenSharingPermission');

//   if (permissionGranted) {
//     console.log('Screen sharing permission is granted.');
//     // You can perform further actions if the permission is granted
//   } else {
//     console.log('Screen sharing permission is not granted.');
//     // Show a dialog to request the user's permission
//     showPermissionDialog();
//   }
// }


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
      let notificationUrl = `${apiurl}/api/notification_inactive`;
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


// writeLogFile('This is a log message.');
