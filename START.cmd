@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Please install Node.js 22 or newer, then run this file again.
  pause
  exit /b 1
)
echo First Light Community: http://127.0.0.1:4340/
echo Keep this window open while reading. Press Ctrl+C to stop.
node scripts/serve.mjs
pause
