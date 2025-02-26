const { app, exec, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const config = require('./config');  // Assuming config is imported here

function takeScreenshotMac() {
  // Generate a unique filename for the image
  const filename = `screenshot_${Date.now()}.png`;


  shell.openPath('x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenRecording');


  // Create the "images" folder if it doesn't exist
  const tempDir = app.getPath('temp');
  const logfile = path.join(tempDir, 'log.txt');

  const imagesFolderPath = path.join(tempDir, 'images');
  if (!fs.existsSync(imagesFolderPath)) {
    fs.mkdirSync(imagesFolderPath);
  }

  // Specify the full file path for the screenshot
  const savePath = path.join(imagesFolderPath, filename);

  console.log(`Attempting to capture screenshot and save to: ${savePath}`);

  // Check if we have multiple displays or just one.
  const multipleDisplays = isMultipleDisplays(); // Ensure this function is defined

  console.log('multipleDisplays:', multipleDisplays);
  
  const command = multipleDisplays
    ? `screencapture -D -x -t png "${savePath}"`  // Multiple displays (use -D)
    : `screencapture -x -t png "${savePath}"`;    // Single display (no -D)

  // Run the command
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error executing command: ${error}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }

    // Log the path where the screenshot is saved
    console.log(`Screenshot successfully saved to: ${savePath}`);

    const uploadUrl = `${config.API_URL}/api/save_screenshot`;
    uploadImage(savePath, uploadUrl);
  });
}

function isMultipleDisplays() {
  // You can add logic to check for multiple displays here
  // A simple check might be:
  return require('electron').screen.getAllDisplays().length > 1;
}

function uploadImage(filePath, uploadUrl) {
  // Your code to upload the image goes here
  console.log(`Uploading ${filePath} to ${uploadUrl}`);
  // You can use a library like axios or fetch to handle the upload.
}


takeScreenshotMac();