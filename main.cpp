#include <iostream>
#include <windows.h>

#pragma pack(push, 1)
struct MyLASTINPUTINFO {
    UINT cbSize = sizeof(MyLASTINPUTINFO);
    DWORD dwTime = 0;
};
#pragma pack(pop)

double getIdleDuration() {
    MyLASTINPUTINFO lastInputInfo;
    GetLastInputInfo(reinterpret_cast<PLASTINPUTINFO>(&lastInputInfo));
    DWORD millis = GetTickCount() - lastInputInfo.dwTime;
    return static_cast<double>(millis) / 1000.0;
}

int main() {
    double idleDuration = getIdleDuration();
    std::cout << idleDuration << std::endl;
    return 0;
}
