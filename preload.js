const { contextBridge, ipcRenderer } = require('electron')

// const contextBridge = require('electron').contextBridge;
// const ipcRenderer = require('electron').ipcRenderer;
// Exposed protected methods in the render process
contextBridge.exposeInMainWorld(
  // Allowed 'ipcRenderer' methods
  'bridge', {
      // From main to render
      sendSettings: (message) => {
          ipcRenderer.on('sendSettings', message);
      }
  }
);


contextBridge.exposeInMainWorld('screenshot', {
  captureScreenShot: () => ipcRenderer.send('capture-screenshot'),
  screenShotCaptured: (callback) => {
    ipcRenderer.on('screenshot-captured', (event, screenshotURL) => callback(event, screenshotURL));
  },
  login: () => ipcRenderer.send('login'),
  logincheck: () => ipcRenderer.send('logincheck')
})


contextBridge.exposeInMainWorld('checking', {
  test: () => ipcRenderer.send('test')
})

// Expose navigator to the renderer process
contextBridge.exposeInMainWorld('myAPI', {
  navigator: navigator,
});

contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel, data) =>  ipcRenderer.send(channel, data),
  on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args) ) ,
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