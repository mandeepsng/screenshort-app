const { app, powerMonitor, session  } = require('electron');
const fs = require('fs');
const path = require('path');
const state = require('./state');
const { getUserData, getToken, userExists, uploadTimeline } = require('./functions/auth');

let startTime;
let timerInterval;
let idleTime = 0;
let productiveTime = 0;
let elapsedMinutes = 0;
let isIdle = false;
let timelineData = [];
// var apiurl = 'https://track360.rvsmedia.com';
var apiurl = 'http://erp.test';
let logFilePath = path.join(app.getPath('userData'), 'elapsedTime.log');

const tempDir = app.getPath('temp');
const appTempDir = path.join(tempDir, 'track-360');
var timePath = path.join(appTempDir, 'time.json');





function startTimer() {
  startTime = Date.now();
  logFilePath = path.join(app.getPath('userData'), 'elapsedTime.log');
  // logFilePath = timePath;

  timerInterval = setInterval(async () => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    var elapsedMinutes = Math.floor(elapsedTime / 60); // Convert seconds to minutes

    state.setElapsedTime(elapsedMinutes);

    // console.log(`Elapsed time: ${elapsedTime} `);


    if (elapsedTime % 60 === 0) { // Check if a minute has passed
      const currentTime = new Date();
      const formattedTime = {
        time: elapsedMinutes,
        date: `${currentTime.getMonth() + 1}/${currentTime.getDate()}/${currentTime.getFullYear()}`,
        idle: idleTime,
        productive: 'productiveTime'
      };

      // new code start
      console.log('logFilePath', logFilePath);
      // Check if the log file exists and is not empty
      // Check if the log file exists and is not empty
      if (fs.existsSync(logFilePath)) {
        const fileContents = fs.readFileSync(logFilePath, 'utf-8');
        if (fileContents.trim()) {
          // File is not empty, parse it and update elapsedMinutes
          try {
            timelineData = JSON.parse(fileContents);
            if (!Array.isArray(timelineData)) {
              timelineData = [timelineData];
            }
          } catch (error) {
            console.error('Error parsing JSON from log file:', error.message);
            timelineData = [];
          }
          const existingEntryIndex = timelineData.findIndex(entry => entry.date === formattedTime.date);
          if (existingEntryIndex >= 0) {
            console.log('timelineData[existingEntryIndex].time=', timelineData[existingEntryIndex].time);
            elapsedMinutes = timelineData[existingEntryIndex].time + 1;
            formattedTime.time = elapsedMinutes;
            timelineData[existingEntryIndex] = formattedTime;
          } else {
            timelineData.push(formattedTime);
          }
        } else {
          // File is empty, initialize with current data
          timelineData = [formattedTime];
        }
      } else {
        // File does not exist, initialize with current data
        timelineData = [formattedTime];
      }
      // new code end

      // Write the updated array to the log file
      fs.writeFileSync(logFilePath, JSON.stringify(timelineData, null, 2));



      // Log the time data to a file
      // const logFilePath = path.join(app.getPath('userData'), 'elapsedTime.log');
      // console.log('logFilePath', logFilePath);
      // fs.writeFileSync(logFilePath, JSON.stringify(formattedTime) + '\n', { flag: 'a' });
      // fs.writeFileSync(logFilePath, JSON.stringify(formattedTime, null, 2));

      // Post the time data to an API
      var timelineApiurl = `${apiurl}/api/timieline_store`;
      try {
        // const response = await axios.post('YOUR_API_ENDPOINT', formattedTime);
        uploadTimeline('activity_varible', timelineApiurl, elapsedMinutes);
        // console.log('API Response:', response.data);
      } catch (error) {
        console.error('Error posting to API:', error.message);
      }

      console.log(`Elapsed time: ${elapsedMinutes} minutes, Date: ${formattedTime.date}`);
    }

    // Check if the date has changed
    const currentTime = new Date();
    const formattedCurrentDate = currentTime.toLocaleDateString();
    if (timelineData.length > 0 && timelineData[0].date !== formattedCurrentDate) {
      // Dates do not match, delete the log file
      fs.unlinkSync(logFilePath);
      console.log('Date has changed. Log file deleted.');
      elapsedMinutes = 0; // Reset the elapsed minutes
      timelineData = []; // Reset the timeline data
    }

    // Update idle and productive times
    if (isIdle) {
      idleTime++;
    } else {
      productiveTime++;
    }
  }, 1000);
}

// function stopTimer() {
//   clearInterval(timerInterval);
//   const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
//   const elapsedMinutes = Math.floor(elapsedTime / 60); // Convert seconds to minutes
//   state.setElapsedTime(elapsedMinutes);
//   console.log(`Timer stopped. Total elapsed time: ${elapsedMinutes} minutes`);
// }

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    state.setElapsedTime(elapsedTime);
    console.log(`Timer stopped. Total elapsed time: ${elapsedTime} seconds`);
  }
}

function logElapsedTime() {
  const elapsedTime = state.getElapsedTime();
  const logFilePath = path.join(app.getPath('userData'), 'elapsedTime.log');
  fs.writeFileSync(logFilePath, `Elapsed time: ${elapsedTime} seconds\n`, { flag: 'a' });
}

// Function to check if a new day has started
function isNewDay() {
  const now = new Date();
  const lastReset = session.defaultSession.lastReset || 0;
  const lastResetDate = new Date(lastReset);
  return now.getDate() !== lastResetDate.getDate();
}

// Function to reset the session
function resetSession() {
  session.defaultSession.elapsedMinutes = 0;
  elapsedMinutes = 0;
  session.defaultSession.lastReset = Date.now();
  console.log('Session reset for the new day.');
}

function resumeTimer() {
  logFilePath = path.join(app.getPath('userData'), 'elapsedTime.log');
  startTime = Date.now() - (state.getElapsedTime() * 60 * 1000); // Convert minutes to milliseconds
  timerInterval = setInterval(async () => {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    var elapsedMinutes = Math.floor(elapsedTime / 60); // Convert seconds to minutes

    // console.log(`Elapsed time: ${elapsedTime} `);
    state.setElapsedTime(elapsedMinutes);

    if (elapsedTime % 60 === 0) { // Check if a minute has passed
      const currentTime = new Date();
      const formattedTime = {
        time: elapsedMinutes,
        date: `${currentTime.getMonth() + 1}/${currentTime.getDate()}/${currentTime.getFullYear()}`,
        idle: idleTime,
        productive: 'productiveTime'
      };

      // Log the time data to a file
      // const logFilePath = path.join(app.getPath('userData'), 'elapsedTime.log');
      // fs.writeFileSync(logFilePath, JSON.stringify(formattedTime) + '\n', { flag: 'a' });
      // fs.writeFileSync(logFilePath, JSON.stringify(timelineData, null, 2));

      if (fs.existsSync(logFilePath)) {
        const fileContents = fs.readFileSync(logFilePath, 'utf-8');
        if (fileContents.trim()) {
          // File is not empty, parse it and update elapsedMinutes
          try {
            timelineData = JSON.parse(fileContents);
            if (!Array.isArray(timelineData)) {
              timelineData = [timelineData];
            }
          } catch (error) {
            console.error('Error parsing JSON from log file:', error.message);
            timelineData = [];
          }
          const existingEntryIndex = timelineData.findIndex(entry => entry.date === formattedTime.date);
          if (existingEntryIndex >= 0) {
            console.log('timelineData[existingEntryIndex].time=', timelineData[existingEntryIndex].time);
            elapsedMinutes = timelineData[existingEntryIndex].time + 1;
            formattedTime.time = elapsedMinutes;
            timelineData[existingEntryIndex] = formattedTime;
          } else {
            timelineData.push(formattedTime);
          }
        } else {
          // File is empty, initialize with current data
          timelineData = [formattedTime];
        }
      } else {
        // File does not exist, initialize with current data
        timelineData = [formattedTime];
      }
      // new code end

      // Post the time data to an API
      var timelineApiurl = `${apiurl}/api/timieline_store`;
      try {
        // const response = await axios.post('YOUR_API_ENDPOINT', formattedTime);
        uploadTimeline('activity_varible', timelineApiurl, elapsedMinutes);

        // console.log('API Response:', response.data);
      } catch (error) {
        console.error('Error posting to API:', error.message);
      }

      console.log(`Elapsed time: ${elapsedMinutes} minutes, Date: ${formattedTime.date}`);
    }

    // Check for new day and reset session if true
    // if (isNewDay()) {
    //   resetSession();
    // }

    // Update idle and productive times
    if (isIdle) {
      idleTime++;
    } else {
      productiveTime++;
    }
  }, 1000);
}





function initializeTimer() {
  
  if (getToken()) {
    startTimer();
    console.log('User exists.');
    // const userEmail = getUserData('email');
    // const token = getToken();
    // console.log('User email:', userEmail);
  
    console.log('User token:', getToken());
  } else {
    console.log('User does not exist.');
  }

  powerMonitor.on('suspend', () => {
    console.log('System is going to suspend');
    // stopTimer();
  });

  powerMonitor.on('resume', () => {
    console.log('System has resumed');
    // resumeTimer();
    // startTimer();
  });

  powerMonitor.on('lock-screen', () => {
    console.log('Screen is locked');
    // stopTimer();
    isIdle = true;
  });

  powerMonitor.on('unlock-screen', () => {
    console.log('Screen is unlocked');
    // resumeTimer();
    // startTimer();
    isIdle = false;
  });

  powerMonitor.on('user-did-become-active', () => {
    console.log('User is active');
    // resumeTimer();
    // startTimer();
    isIdle = false;
  });

  powerMonitor.on('user-did-resign-active', () => {
    console.log('User is idle');
    // stopTimer();
    isIdle = true;
  });
}

// app.whenReady().then(async () => {
//   initializeTimer();

//   // Log user data path
//   const userDataPath = app.getPath('userData');
//   console.log('User Data Path:', userDataPath);

//   // Log cookies
//   const cookies = await session.defaultSession.cookies.get({});
//   console.log('Cookies:', cookies);
// });

module.exports = {
  initializeTimer,
};
