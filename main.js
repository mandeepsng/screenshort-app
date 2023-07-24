const { app, BrowserWindow, desktopCapturer, screen, ipcMain, Menu, Tray  } = require('electron')
const fs = require('fs')
const path = require('path')
const axios = require('axios');
const { Readable } = require('stream');
const { Blob } = require('buffer');


// Settings object
let settings = {
  'renderer': {
      'key1': 'value1',
      'key2': 'value2'
  }
}

let tray = null

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
  const win = new BrowserWindow({
    width: 700,
    height: 450,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })
  
    // open dev tools
    //win.webContents.openDevTools()


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

app.whenReady().then(() => {

  const iconPath = path.join(__dirname, 'assets/icon.png');

  tray = new Tray(iconPath)

  tray.on('click', () =>{
    mainWindow.isVisible()?mainWindow.hide():mainWindow.show()
  })

  tray.setToolTip('Rvs Tracker')

  tray.setContextMenu(menu)

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })




  // Listen for the message from the renderer process
  ipcMain.on('logout', async() => {
    // Call the function in the main process
    const filePath = path.join(__dirname, 'data.json');
    await clearDataFile(filePath);
    createWindow();
  });


})

function myMainProcessFunction() {
  console.log('Main process function was called!');
  // Your main process logic here
}


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


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

function readUserData() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'data.json'));
    userData = JSON.parse(rawData);

    // Access the 'user' property using optional chaining
    const user = userData?.apiResponse?.user;

    if( typeof user === 'undefined'){
      console.log(' use is null')
    }else{
      console.log(' use exit ', user)

      const delay = 15 * 60 * 1000; // 15 minutes

      // const delay =  5000; // 5 seconds
      const intervalId = setInterval(() =>{
        console.log('callscreenshort started  delay....', delay);
        ipcMain.emit('capture-screenshot', 'Hello from event1 handler');
      }, delay);

    }

    // if(rawData.apiResponse.user.length > 0){
      
    //   console.log('userData: ' + rawData)
    // }else{
      
    //   console.log('userData: empty data.json file')
    // }


    // const delay = 15 * 60 * 1000; // 15 minutes
    


    




  } catch (error) {
    console.error('Error reading data.json:', error);
  }
}

readUserData();


ipcMain.on('event2', (event, arg) => {
  console.log('Received event2 with argument:', arg);
});

// console.log('userData = ', userData )


ipcMain.on('login-attempt', async (event, loginData) => {

  // console.log('loginData', loginData);

  try {
    // Send the login request to the API
    const response = await axios.post('https://app.idevelopment.site/api/login', loginData);

    // Save the response data to data.json
    userData.apiResponse = response.data;

    if(userData.apiResponse.auth ==='done'){

      
      fs.writeFileSync(path.join(__dirname, 'data.json'), JSON.stringify(userData, null, 2));
      // win.reload();
      // Redirect to the dashboard.
      closeAllWindows();
      createWindow();
      // win.loadFile(path.join(__dirname, 'dashboard.html'));
      console.log('userData');
      readUserData()
      // win.webContents.send('show-dashboard', loginData);
      //win.webContents.send('show-dashboard', userData); // Pass userData to dashboard.html
    }else{
      console.log('error');
      event.sender.send('login-failed', 'Wrong email password');
    }
  } catch (error) {
    console.error('Login failed:', 'Wrong email password');
    event.sender.send('login-failed', 'Wrong email password');
  }
});








  ipcMain.on('capture-screenshot', async (event) => {
    // console.log('login herer capture-screenshot');
  const displays = screen.getAllDisplays();
  const screenshots = await Promise.all(
    displays.map(async (display) => {
      // const screenshot = await captureScreen(display.id);
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
          const uploadUrl = 'https://app.idevelopment.site/api/save_screenshort';
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

    const headers = {
      'Content-Type': 'multipart/form-data',
    };

    const response = await axios.post(uploadUrl, formData, {
      headers: headers,
    });

    deleteImage(imagePath);
    console.log('Image uploaded successfully:', response.data.message);
    // console.log('logged_user : ', logged_user);


  } catch (error) {
    console.error('Error while uploading image:', error.message);
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
      
      // createWindow();
    }
  });
}


// Function to close all windows
function closeAllWindows() {
  const windows = BrowserWindow.getAllWindows();
  windows.forEach((window) => {
    window.close();
  });
}