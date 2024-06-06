const { app, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
// Path to the data.json file

const tempDir = app.getPath('temp');
console.log('in timer.json file', tempDir);

// Create a subdirectory for your app data
const appTempDir = path.join(tempDir, 'track-360');
var dataFilePath = path.join(appTempDir, 'data.json');

// Read and parse the JSON file
function readDataFile() {
  try {
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading data.json:', error);
    return null;
  }
}

// Function to get user data
function getUserData(key) {
  const data = readDataFile();
  if (!data) return null;

  const user = data?.apiResponse?.user;
  if (!user) {
    console.log('User is null');
    return null;
  }

  return key ? user[key] : user;
}

// Function to get the token
function getToken() {
  const data = readDataFile();
  if (!data) return null;

  return data?.apiResponse?.token || null;
}

// Function to check if the user exists
function userExists() {
  const data = readDataFile();
  return !!data?.apiResponse?.user;
}

// Function to upload timeline data
async function uploadTimeline(data, uploadUrl, time) {
    try {
      const userData = readDataFile();
      if (!userData || !userData.apiResponse || !userData.apiResponse.user || !userData.apiResponse.token) {
        throw new Error('User data or token is missing');
      }
  
      const formData = new FormData();
      formData.append('value', data);
      formData.append('time', time);
      formData.append('id', userData.apiResponse.user.id);
      formData.append('token', userData.apiResponse.token);
  
      const headers = {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${userData.apiResponse.token}`,
      };
  
      const response = await axios.post(uploadUrl, formData, { headers });
      console.log('Updated timeline successfully:', response.data);
      console.log('Api Updated timeline time on uploadTimeline:', time);
  
    } catch (error) {
      console.error('Error while updating timeline:', error.message);
      if (error.response && error.response.status === 401) {
        ipcMain.emit('logout', 'logout ...');
      }
    }
}

module.exports = {
  getUserData,
  getToken,
  userExists,
  uploadTimeline
};
