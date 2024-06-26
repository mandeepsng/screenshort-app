const { app } = require('electron')
const path = require('path')
const axios = require('axios');
const fs = require('fs')

const tempDir = app.getPath('temp');
const appTempDir = path.join(tempDir, 'track-360');
var timePath = path.join(appTempDir, 'time.json');
var trackingPath = path.join(appTempDir, 'tracking.json');

// Save time data to JSON file
async function saveTimeToFile(time) {
    console.log('Saving time')
  
    const currentTime = new Date();
    const formattedTime = currentTime.toLocaleDateString();
  
    // const filePath = path.join(__dirname,  '..'  ,'data', 'time.json');
    const filePath = timePath;
    const data = JSON.stringify({ time : time, date : formattedTime });
  
    try {
      await fs.promises.writeFile(filePath, data, 'utf-8');
      console.log('Time saved to file:', formattedTime);
    } catch (error) {
      console.error('Error saving time:', error);
    }
  }
  
  // Load time data from JSON file
  async function loadTimeFromFile() {
    // const filePath = path.join( __dirname,  '..' , 'data', 'time.json');
    const filePath = timePath;
  
    try {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsedData = JSON.parse(data);
      console.log('parsedData.time = ', parsedData.time);
      return parsedData.time;
    } catch (error) {
      return null; // Return default value if file doesn't exist or parsing fails
    }
  }
  
  
  // Increment timer value in JSON file
  async function incrementTimer() {
    const currentTime = await loadTimeFromFile() || 0;
    console.log(`currentTime: ${currentTimes}`);
    saveTimeToFile(currentTime + 1);
    return currentTime;
  }
  
  // check if current date not match with json file date
  async function checkAndClearFiles() {
    const currentTime = new Date();
    const formattedCurrentDate = currentTime.toLocaleDateString();
  
    // const filePathTime = path.join(__dirname, '..' ,'data', 'time.json');
    const filePathTime = timePath;
    // const filePathTrack = path.join(__dirname, '..' ,'data', 'tracking.json');
    const filePathTrack = trackingPath;
  
    try {
      const timeData = await fs.promises.readFile(filePathTime, 'utf-8');
      const parsedTimeData = JSON.parse(timeData);
  
      if(Object.keys(parsedTimeData).length === 0) {
        console.log('File exists but is empty. Skipping write operation.');
            return await incrementTimer();
      }else{
  
        if (parsedTimeData.date !== formattedCurrentDate) {
          clearDataFile(filePathTime);
          clearDataFile(filePathTrack);
          return 0;
        } else {
          console.log('Dates match, no action needed.');
            return await incrementTimer();
        }
  
      }
  
  
  
    } catch (error) {
      console.error('Error checking and clearing files:', error);
    }
  }
  
  function clearFile(filePath) {
    fs.unlink(filePath, (error) => {
      if (error) {
        console.error('Error clearing file:', error);
      } else {
        console.log('File cleared:', filePath);
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
      }
    });
  }


  function screenshort_time(){
      // Generate a random delay between 5 to 15 minutes (in milliseconds)
      const minDelay = 5 * 60 * 1000; // 5 minutes in milliseconds
      const maxDelay = 10 * 60 * 1000; // 15 minutes in milliseconds
      
      const randomDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      // const randomDelayMinutes = Math.round(randomDelay / (60 * 1000));
      const randomDelayMinutes = Math.round(randomDelay);
      
      console.log(`Random delay selected: ${randomDelayMinutes} milliseconds`);

      return randomDelayMinutes;
  }


  module.exports = {
    incrementTimer,
    checkAndClearFiles,
    screenshort_time
}