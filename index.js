const { spawn } = require('child_process');

function getIdleDurationFromExe() {
  return new Promise((resolve, reject) => {
    const childProcess = spawn('main.exe');

    let output = '';

    childProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
      reject(new Error(data.toString()));
    });

    childProcess.on('close', (code) => {
      if (code === 0) {
        resolve(parseFloat(output));
      } else {
        reject(new Error(`Error: Non-zero exit code ${code}`));
      }
    });
  });
}

// Example usage:

async function getIdleTime(){

  getIdleDurationFromExe()
    .then((idleDuration) => {
      // console.log('Idle Duration (seconds):', idleDuration);
      console.log(idleDuration);
    })
    .catch((error) => {
      console.error('Error:', error.message);
    });
}




setInterval( async() =>{

  getIdleTime();
  console.log('dddd');
  // getIdleDurationFromExe();
}, 10000);
