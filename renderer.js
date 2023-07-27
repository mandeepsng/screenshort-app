document.addEventListener('DOMContentLoaded', () => {
  // Only run this code if the user is on the dashboard page
  if (window.location.href.includes('dashboard.html')) {

    ipcRenderer.on('show-dashboard', (event, userData) => {
      console.log('ddddd kkjkjkdjfjdf ', userData, event)
      // console.log(userData.apiResponse); // Check the content of userData.apiResponse
      const firstNameElement = document.getElementById('first-name');
      const lastNameElement = document.getElementById('last-name');

      // Assuming userData.apiResponse.user contains the user's information
      firstNameElement.innerText = `First Name`;
      // firstNameElement.innerText = `First Name: ${userData.apiResponse.user.first_name}`;
      lastNameElement.innerText = `Last Name: ${userData.apiResponse.user.last_name}`;
    });
  }

  // Add the event listener for the screenshot button only if it exists
  const screenshotButton = document.getElementById('screenshot-button');
  if (screenshotButton) {
    screenshotButton.addEventListener('click', takeScreenshot);
  }


  const loginForm = document.getElementById('login-form');
  if(loginForm){
    document.getElementById('login-form').addEventListener('submit', (event) => {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      // Trigger the login attempt
      ipcRenderer.send('login-attempt', { email, password });
    });
  }

  const logout = document.getElementById('logout');
  if(logout){
      logout.addEventListener('click', (event) => {
      event.preventDefault();
      console.log('logout clicked');

      // remove all data from data.json file
      ipcRenderer.send('logout');
      
    })
  }

});


async function takeScreenshot() {
  await window.screenshot.captureScreenShot()
  window.screenshot.screenShotCaptured((event, dataURL) => {
    console.log('screenshot-button', dataURL);
    document.getElementById('screenshot-image').src = dataURL;
  });
}


// Add the event listener for the screenshot button only if it exists
const testing = document.getElementById('testing');
if (testing) {
  testing.addEventListener('click', test);
}


async function test() {
  await window.checking.test()
  // window.screenshot.screenShotCaptured((event, dataURL) => {
  //   console.log('screenshot-button', dataURL);
  //   document.getElementById('screenshot-image').src = dataURL;
  // });
}

// async function takelogin() {
//   // await window.screenshot.login()
//   window.screenshot.login((event, dataURL) => {
//     console.log('takelogin', dataURL);
//     document.getElementById('screenshot-image').src = dataURL;
//   });
// }

// document.getElementById('screenshot-button').addEventListener('click', takeScreenshot);

// document.getElementById('submitlogin').addEventListener('click', takelogin);



ipcRenderer.on('login-failed', (event, errorMessage) => {
  alert('Login failed. Error: Wrong email password'  );
  console.log(errorMessage);
});

// Listen for the show-console-message event from the main process
ipcRenderer.on('show-console-message', (event, message) => {
  console.log(message);
});