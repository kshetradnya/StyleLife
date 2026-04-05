@echo off
echo ============================================================
echo   StyleLife — Local Server Launcher
echo ============================================================
echo.
echo Browsers block AR/3D features when opened directly from disk.
echo This script will help you start a local server.
echo.

where python >nul 2>nul
if %errorlevel% == 0 (
    echo [FOUND] Python detected. Starting server on http://localhost:8000
    echo.
    start http://localhost:8000
    python -m http.server 8000
    goto end
)

where node >nul 2>nul
if %errorlevel% == 0 (
    echo [FOUND] Node.js detected. Installing/Running 'serve'...
    echo.
    npx -y serve .
    goto end
)

echo [ERROR] Neither Python nor Node.js was found on your system.
echo.
echo Please install one of them, or use a "Live Server" extension
echo in VS Code to run StyleLife correctly.
echo.
pause

:end
