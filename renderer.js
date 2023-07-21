async function takeScreenshot() {
  await window.screenshot.captureScreenShot()
  window.screenshot.screenShotCaptured((event, dataURL) => {
    console.log('screenshot-button', dataURL);
    document.getElementById('screenshot-image').src = dataURL;
  });
}

// async function takelogin() {
//   // await window.screenshot.login()
//   window.screenshot.login((event, dataURL) => {
//     console.log('takelogin', dataURL);
//     document.getElementById('screenshot-image').src = dataURL;
//   });
// }

document.getElementById('screenshot-button').addEventListener('click', takeScreenshot);

// document.getElementById('submitlogin').addEventListener('click', takelogin);

document.getElementById('login-form').addEventListener('submit', (event) => {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Trigger the login attempt
  ipcRenderer.send('login-attempt', { username, password });
});

ipcRenderer.on('login-failed', (event, errorMessage) => {
  alert('Login failed. Error: ' + errorMessage);
});