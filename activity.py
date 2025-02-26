from ctypes import Structure, windll, c_uint, sizeof, byref

class LASTINPUTINFO(Structure):
    _fields_ = [
        ('cbSize', c_uint),
        ('dwTime', c_uint),
    ]


def get_idle_duration():
    lastInputInfo = LASTINPUTINFO()
    lastInputInfo.cbSize = sizeof(lastInputInfo)
    windll.user32.GetLastInputInfo(byref(lastInputInfo))
    millis = windll.kernel32.GetTickCount() - lastInputInfo.dwTime
    return millis / 1000.0

if __name__ == '__main__':
        get_idle_duration_time = get_idle_duration()
        # Print the last input time and the time difference
        # print(f"get_idle_duration : {get_idle_duration_time}")
        print(get_idle_duration_time)
