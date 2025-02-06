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



    // ipcRenderer.on('idleTime', (event, userData) => {

    //   const idleTime = document.getElementById('idleTime');

    //   idleTime.innerText = `Idle Time: ${event} Sec`;

    //   // Update your dashboard with the new data.
    //   console.log('tetstindf...', event);
    //   // userData contains the data you sent from the main process.
    //   // For example, you can display it on the dashboard or update your UI elements accordingly.
    //   // ...
    // });

    ipcRenderer.on('timer', (event, userData) => {


      const timer = document.getElementById('timer');

      timer.innerText = `Timer: ${event} mint`;

      // Update your dashboard with the new data.
      console.log('timer running...', event);
      // userData contains the data you sent from the main process.
      // For example, you can display it on the dashboard or update your UI elements accordingly.
      // ...
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

      var submitButton = document.getElementById("submit");
      var originalHtml = submitButton.innerHTML;
      var originalType = submitButton.getAttribute("type");

      // Change to loading state
      submitButton.setAttribute("type", "button");
      submitButton.setAttribute("disabled", true);
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span>';

      
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




  // Get the "Forgot Password?" link element
  const forgotPasswordLink = document.querySelector('.forgot-link');

  // Add a click event listener to the link
  forgotPasswordLink.addEventListener('click', (event) => {
      // Prevent the default behavior of the link
      event.preventDefault();

      // Get the URL from the link's href attribute
      const url = "https://track360.rvsmedia.com/forget-password";

      // Send the URL to the main process
      openLink(url);
  });


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

// Define the function to send the URL to the main process
function openLink(url) {
  ipcRenderer.send('open-link', url);
}

// for notification

const confetti = require('canvas-confetti');

const canvas = document.getElementById('confetti-canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const myConfetti = confetti.create(canvas, {
  resize: true,
  useWorker: true,
});


let confettiCount = 0;
const maxConfettiLaunches = 10;


function launchConfetti() {
  if(confettiCount < maxConfettiLaunches){

    // myConfetti({
    //   particleCount: 100,
    //   spread: 160,
    //   origin: { y: 0.6 },
    // });

    var duration = 15 * 1000;
    var animationEnd = Date.now() + duration;
    var defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    var interval = setInterval(function() {
      var timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      var particleCount = 50 * (timeLeft / duration);
      // since particles fall down, start a bit higher than random
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    confettiCount++;
  }else{
    clearInterval(confettiInterval);
    clearInterval(colorInterval); // Stop changing colors
    document.getElementById('message').style.display = 'none'; 
  }
}


function changeMessageColor() {
  const message = document.getElementById('message');
  const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  message.style.color = randomColor;
}

document.addEventListener('DOMContentLoaded', () => {
  confettiInterval = setInterval(launchConfetti, 2000);
  colorInterval = setInterval(changeMessageColor, 200);
});
