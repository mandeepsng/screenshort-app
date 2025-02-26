const { exec } = require('child_process');

function killProcessesByPartialName(partialName) {
  const listCommand = `tasklist | findstr ${partialName}`;

  exec(listCommand, (error, stdout, stderr) => {
    if (error || !stdout) {
      console.error(`No processes matching "${partialName}" found.`);
      return;
    }

    const processNames = stdout
      .split('\n') // Split by line
      .filter(line => line.trim().length > 0) // Remove empty lines
      .map(line => line.split(/\s+/)[0]); // Get the first column (process name)

    const uniqueProcessNames = [...new Set(processNames)]; // Remove duplicates

    uniqueProcessNames.forEach(processName => {
      const killCommand = `taskkill /IM ${processName} /F`;
      exec(killCommand, (killError, killStdout, killStderr) => {
        if (killError) {
          console.error(`Error killing ${processName}: ${killStderr.trim()}`);
        } else {
          console.log(`Killed ${processName}:\n${killStdout}`);
        }
      });
    });
  });
}

// Replace 'track360' or 'rvs' with part of your app's name
killProcessesByPartialName('electron');
