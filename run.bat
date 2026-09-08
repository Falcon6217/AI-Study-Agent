@echo off
title CogniStudy AI - AI Learning & Study Assistant
cls
echo ================================================================
echo        🧠 CogniStudy AI - Learning & Study Assistant
echo ================================================================
echo.
echo Launching the web application in your default browser...
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [Option 1] Starting Python local server...
    start "" http://localhost:8000
    python -m http.server 8000
) else (
    echo [Option 2] Python not found in PATH, opening directly in browser...
    start "" index.html
)
pause
