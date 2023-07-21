async function takeScreenshot() {
  await window.screenshot.captureScreenShot()
  window.screenshot.screenShotCaptured((event, dataURL) => {
    console.log('screenshot-button', dataURL);
    document.getElementById('screenshot-image').src = dataURL;
  });
}

async function takelogin() {
  // await window.screenshot.login()
  window.screenshot.login((event, dataURL) => {
    console.log('takelogin', dataURL);
    document.getElementById('screenshot-image').src = dataURL;
  });
}

document.getElementById('screenshot-button').addEventListener('click', takeScreenshot);

document.getElementById('submitlogin').addEventListener('click', takelogin);