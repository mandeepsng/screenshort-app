const { app, BrowserWindow, desktopCapturer, screen, ipcMain } = require('electron')
const fs = require('fs')
const path = require('path')
const sharp = require('sharp');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ipcMain.on('capture-screenshot', async (event) => {
//   const screenShotInfo = await captureScreen();
//   const dataURL = screenShotInfo.toDataURL();

//   console.log('sdfkjsdf', dataURL);
//   event.sender.send('screenshot-captured', dataURL);
// });

ipcMain.on('capture-screenshot', async (event) => {
  const display = screen.getAllDisplays();

  display.forEach( async(val, index) => {


  })



  console.log('display', display)
  const screenShotInfo = await captureScreen();
  const dataURL = screenShotInfo.toDataURL();

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

  fs.writeFile(filePath, screenShotInfo.toPNG(), (error) => {
    if (error) {
      console.error('Error saving the screenshot:', error);
      event.sender.send('screenshot-captured', { success: false, error: 'Failed to save screenshot' });
    } else {
      console.log('Screenshot saved:', filePath);
      event.sender.send('screenshot-captured', { success: true, filePath: filePath });
    }
  });

  // sharp(screenShotInfo.toPNG())
  //   .resize(800) // Resize the image to a maximum width of 800 pixels (adjust this as needed)
  //   .toFile(filePath, (error, info) => {
  //     if (error) {
  //       console.error('Error saving the screenshot:', error);
  //       event.sender.send('screenshot-captured', { success: false, error: 'Failed to save screenshot' });
  //     } else {
  //       console.log('Screenshot saved:', filePath);
  //       event.sender.send('screenshot-captured', { success: true, filePath: filePath });
  //     }
  //   });


  event.sender.send('screenshot-captured', { success: true, dataURL: dataURL });
});

async function captureScreen() {

    const display = screen.getAllDisplays();

    // display.forEach( async(val, index) => {
    // console.log('val = ', val);


    // const primaryDisplay = val;
    const primaryDisplay = screen.getPrimaryDisplay();

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
    
    // Return image data
    return image

    // console.log('image = ', image);
  
  // })


}
