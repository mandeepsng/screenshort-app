const { app } = require('electron')
const path = require('path')
const axios = require('axios');
const fs = require('fs')
const { spawn } = require('child_process');


const tempDir = app.getPath('temp');
const appTempDir = path.join(tempDir, 'track-360');
var timePath = path.join(appTempDir, 'time.json');
var trackingPath = path.join(appTempDir, 'tracking.json');
function add(a, b) {
    return a + b;
}

function subtract(a, b) {
    return a - b;
}


async function updateNotification(minutes, uploadUrl) {
    try {
  
      const formData = new FormData();
      formData.append('idleTime', minutes);
      formData.append('id', 44);
  
      const headers = {
        'Content-Type': 'application/json',
      };
  
      const response = await axios.post(uploadUrl, formData, {
        headers: headers,
      });
  
      console.log('Inactive notification:', response.data);
  
    } catch (error) {
      console.error('Error while sending inactive notification:', error.message);
    }
}

async function uploadTimeline(data, uploadUrl, time) {
    try {
      // const imageBuffer = fs.readFileSync(imagePath);
  
      const formData = new FormData();
      formData.append('value', data);
      formData.append('time', time);
      formData.append('id', userData.apiResponse.user.id);
  
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
  
      const response = await axios.post(uploadUrl, formData, {
        headers: headers,
      });
  
      console.log('update timeline successfully:', response.data.message);
  
    } catch (error) {
      console.error('Error while updating timeline:', error.message);
    }
}



// Save time data to JSON file
async function saveTimeToFile(time) {
  console.log('Saving time')

  const currentTime = new Date();
  const formattedTime = currentTime.toLocaleDateString();


  const idleTime =  await getIdleTime();
  console.log('Idle time: ' + idleTime)



  // const filePath = path.join(__dirname, '..' ,'data', 'time.json');
  const filePath = timePath;
  const data = JSON.stringify({ time : time, date : formattedTime,  idle: 40, productive: 77 });

  try {
    await fs.promises.writeFile(filePath, data, 'utf-8');
    console.log('Time saved to file:', formattedTime);
  } catch (error) {
    console.error('Error saving time:', error);
  }
}

// Load time data from JSON file
async function loadTimeFromFile() {
  // const filePath = path.join(__dirname, '..' , 'data', 'time.json');
  const filePath = timePath;
  
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsedData = JSON.parse(data);
    return parsedData.time;
  } catch (error) {
    return null; // Return default value if file doesn't exist or parsing fails
  }
}




// // Increment timer value in JSON file
// async function incrementTimer() {
//   const currentTime = await loadTimeFromFile() || 0;
//   saveTimeToFile(currentTime + 1);
// }

async function checkAndClearFiles() {
  const currentTime = new Date();
  const formattedCurrentDate = currentTime.toLocaleDateString();

  try {
    const timeData = await fs.promises.readFile(timePath, 'utf-8');
    const parsedTimeData = JSON.parse(timeData);

    if (Object.keys(parsedTimeData).length === 0) {
      console.log('File exists but is empty. Skipping write operation.');
      // await incrementTimer();
    } else {
      if (parsedTimeData.date !== formattedCurrentDate) {
        await clearDataFile(timePath);
        await clearDataFile(trackingPath);
      } else {
        console.log('Dates match, no action needed.');
        // await incrementTimer();
      }
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File does not exist
      console.log('File does not exist. Initializing new data.');
      const initialData = {
        time: 0,
        date: formattedCurrentDate,
        idle: 0,
        productive: 0
      };
      await fs.promises.writeFile(timePath, JSON.stringify(initialData, null, 2));
    } else {
      console.error('Error checking and clearing files:', error);
    }
  }
}

async function incrementTimer() {
  try {
    const timeData = await fs.promises.readFile(timePath, 'utf-8');
    const parsedTimeData = JSON.parse(timeData);

    // Increment the time by 1 minute
    parsedTimeData.time += 1;

    await fs.promises.writeFile(timePath, JSON.stringify(parsedTimeData, null, 2));
    console.log('Time incremented by 1 minute');
  } catch (error) {
    console.error('Error incrementing timer:', error);
  }
}

async function clearDataFile(filePath) {
  try {
    const currentTime = new Date();
    const formattedCurrentDate = currentTime.toLocaleDateString();
    
    const initialData = {
      time: 0,
      date: formattedCurrentDate,
      idle: 0,
      productive: 0
    };

    await fs.promises.writeFile(filePath, JSON.stringify(initialData, null, 2));
    console.log(`Cleared data file: ${filePath}`);
  } catch (error) {
    console.error('Error clearing data file:', error);
  }
}


// check if current date not match with json file date
async function checkAndClearFiles2() {
  const currentTime = new Date();
  const formattedCurrentDate = currentTime.toLocaleDateString();

  // const filePathTime = path.join(__dirname, '..'  ,'data', 'time.json');
  const filePathTime = timePath;
  // const filePathTrack = path.join(__dirname,'..' , 'data', 'tracking.json');
  const filePathTrack = trackingPath;

  try {
    const timeData = await fs.promises.readFile(filePathTime, 'utf-8');
    const parsedTimeData = JSON.parse(timeData);

    if(Object.keys(parsedTimeData).length === 0) {
      console.log('File exists but is empty. Skipping write operation.');
      await incrementTimer();
    }else{

      if (parsedTimeData.date !== formattedCurrentDate) {
        clearDataFile(filePathTime);
        clearDataFile(filePathTrack);
      } else {
        console.log('Dates match, no action needed.');
        await incrementTimer();
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
// async function clearDataFile(filePath) {
//   // Create an empty JSON object
//   const emptyData = {};

//   // Convert the empty object to JSON format
//   const emptyJsonData = JSON.stringify(emptyData);

//   // Write the empty JSON data to the file
//   fs.writeFile(filePath, emptyJsonData, (err) => {
//     if (err) {
//       console.error('Error clearing JSON file:', err);
//     } else {
//       console.log('Data.json file cleared successfully.');
//     }
//   });
// }


const mainexe = path.join(__dirname, '..' ,'main.exe');
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


// async function getIdleTime(){
//   getIdleDurationFromExe()
//   .then((idleDuration) => {

//     let minutes = (idleDuration / 60).toFixed(2);
//     console.log('Idle Duration (seconds)=', idleDuration);
//     return idleDuration;
//     // console.log(idleDuration);
//   })
//   .catch((error) => {
//     console.error('Error:', error.message);
//   });
// }

async function getIdleTime() {
  try{
    const idleDuration = await getIdleDurationFromExe();
    const minutes = (idleDuration / 60).toFixed(2);
    console.log('Idle Duration (seconds) =', idleDuration);
    return idleDuration;
  }catch(error){
    console.error('Error:', error.message);
    throw error;
  }

}

module.exports = {
    add,
    subtract,
    updateNotification,
    uploadTimeline,
    incrementTimer,
    loadTimeFromFile,
    checkAndClearFiles
}