const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('screenshot', {
  captureScreenShot: () => ipcRenderer.send('capture-screenshot'),
  screenShotCaptured: (callback) => {
    ipcRenderer.on('screenshot-captured', (event, screenshotURL) => callback(event, screenshotURL));
  },
  login: () => ipcRenderer.send('login'),
})


async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // try {
  //   const response = await axios.post('https://app.idevelopment.site/api/login', { username, password });
  //   ipcRenderer.send('login-success', { message: response.data.message });
  // } catch (error) {
  //   ipcRenderer.send('login-failure', { error: 'Invalid credentials' });
  // }
}

ipcRenderer.on('login-success', (event, data) => {
  const loginResultElement = document.getElementById('login-result');
  loginResultElement.textContent = data.message;
});

ipcRenderer.on('login-failure', (event, data) => {
  const loginResultElement = document.getElementById('login-result');
  loginResultElement.textContent = data.error;
});

window.handleLogin = handleLogin;