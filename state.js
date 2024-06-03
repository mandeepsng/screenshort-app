// state.js
let elapsedTime = 0;

function setElapsedTime(time) {
  elapsedTime = time;
}

function getElapsedTime() {
  return elapsedTime;
}

module.exports = {
  setElapsedTime,
  getElapsedTime
};
