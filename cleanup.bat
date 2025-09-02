@echo off
echo Killing all Node.js processes...
taskkill /F /IM node.exe /T 2>nul
echo Done! All Node.js processes terminated.
pause