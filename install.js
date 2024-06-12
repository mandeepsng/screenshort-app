const fs = require('fs');

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

// Write the content to the file
fs.writeFile(filePath, desktopFileContent, (err) => {
    if (err) {
        console.error('Error creating the file:', err);
    } else {
        console.log(`File ${filePath} has been created successfully.`);
    }
});
