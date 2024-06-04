// config.js
const fs = require('fs');
const path = require('path');

const envFilePath = path.join(__dirname, 'env.json');

let envConfig = {};

if (fs.existsSync(envFilePath)) {
  try {
    const envFileContent = fs.readFileSync(envFilePath, 'utf-8');
    envConfig = JSON.parse(envFileContent);
  } catch (error) {
    console.error('Error reading or parsing env.json:', error.message);
  }
} else {
  console.error('env.json file not found');
}

module.exports = envConfig;
