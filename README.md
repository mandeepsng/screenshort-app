install linux .APPIMAGE

open dist folder then open termial run command `chmod a+x ./Track.x.x.1.APPIMAGE`

again run command

`./Track.x.x.1.APPIMAGE`


### for linux run this command in terminal

### also install linux package
`sudo apt-get install scrot`

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


or create 

`install-track-360.sh`

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

run these commands


`chmod +x install-track-360.sh`

`sudo mv install-track-360.sh /usr/local/bin/install-track-360`

`sudo install-track-360`
