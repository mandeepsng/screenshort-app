install linux .APPIMAGE

open dist folder then open termial run command `chmod a+x ./Track.x.x.1.APPIMAGE`

again run command

`./Track.x.x.1.APPIMAGE`


### for linux run this command in terminal

```
#!/bin/bash

# Content of the .desktop file
DESKTOP_FILE_CONTENT="[Desktop Entry]
Type=Application
Name=Track-360
Exec=/usr/bin/rvsdesktime
Terminal=false"

# Path to save the file
FILE_PATH="/etc/xdg/autostart/track-360.desktop"

# Write the content to the file
echo "$DESKTOP_FILE_CONTENT" | sudo tee "$FILE_PATH" > /dev/null

echo "File $FILE_PATH has been created successfully."

```
