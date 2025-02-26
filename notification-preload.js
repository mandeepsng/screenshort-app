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
