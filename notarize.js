require('dotenv').config(); // Load environment variables from .env file
const { notarize } = require('electron-notarize');
const path = require('path');

exports.default = async function notarizeApp(context) {
  if (process.platform !== 'darwin') {
    return;
  }

  const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
  console.log('Notarizing:', appPath);

  await notarize({
    appBundleId: 'track360.rvsmedia.app', // Your app's bundle ID
    appPath: appPath,
    appleId: process.env.APPLE_ID, // Access the APPLE_ID from .env
    appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD, // Access the APPLE_APP_SPECIFIC_PASSWORD from .env
    timestamp: null // Disabling the timestamp
  });

  console.log('Notarization complete!');
};
