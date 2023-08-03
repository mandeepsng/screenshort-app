from pynput.mouse import Listener as MouseListener
from pynput.keyboard import Listener as KeyboardListener

def on_mouse_move(x, y):
    print(f"Mouse moved to ({x}, {y})")

def on_mouse_click(x, y, button, pressed):
    action = "Pressed" if pressed else "Released"
    print(f"Mouse {button} {action} at ({x}, {y})")

def on_mouse_scroll(x, y, dx, dy):
    print(f"Mouse scrolled at ({x}, {y})")

def on_key_press(key):
    try:
        print(f"Key pressed: {key.char}")
    except AttributeError:
        print(f"Special key pressed: {key}")

def on_key_release(key):
    try:
        print(f"Key released: {key.char}")
    except AttributeError:
        print(f"Special key released: {key}")

# Mouse events
mouse_listener = MouseListener(
    on_move=on_mouse_move,
    on_click=on_mouse_click,
    on_scroll=on_mouse_scroll
)

# Keyboard events
keyboard_listener = KeyboardListener(
    on_press=on_key_press,
    on_release=on_key_release
)

# Start listening to events
mouse_listener.start()
keyboard_listener.start()

# Keep the program running until interrupted
try:
    while True:
        pass
except KeyboardInterrupt:
    # Stop listening to events
    mouse_listener.stop()
    keyboard_listener.stop()
