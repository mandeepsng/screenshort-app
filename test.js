const fs = require('fs').promises;
const { exec } = require('child_process');

// Content of the .desktop file
const desktopFileContent = `
[Desktop Entry]
Type=Application
Name=Track-360
Exec=/usr/bin/rvsdesktime
Terminal=false
`;

// Path to save the file
const filePath = '/etc/xdg/autostart/track-360.desktop';

// Write the content to a temporary file
const tempFilePath = '/tmp/track-360.desktop';

async function createDesktopFile() {
    try {
        await fs.writeFile(tempFilePath, desktopFileContent);
        exec(`sudo mv ${tempFilePath} ${filePath}`, (err, stdout, stderr) => {
            if (err) {
                console.error('Error moving the file:', err);
                return;
            }
            if (stderr) {
                console.error('stderr:', stderr);
                return;
            }
            console.log(`File ${filePath} has been created successfully.`);
        });
    } catch (err) {
        console.error('Error creating the temporary file:', err);
    }
}

createDesktopFile();
