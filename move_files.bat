@echo off
set "ROOT=C:\Users\durai\Documents\task1"
set "CLIENT=%ROOT%\client"

echo Moving frontend files to %CLIENT%...

if not exist "%CLIENT%" mkdir "%CLIENT%"

:: Move src folder if it still exists in root
if exist "%ROOT%\src" move "%ROOT%\src" "%CLIENT%\"

:: Move configuration files
if exist "%ROOT%\index.html" move "%ROOT%\index.html" "%CLIENT%\"
if exist "%ROOT%\package.json" move "%ROOT%\package.json" "%CLIENT%\"
if exist "%ROOT%\package-lock.json" move "%ROOT%\package-lock.json" "%CLIENT%\"
if exist "%ROOT%\vite.config.js" move "%ROOT%\vite.config.js" "%CLIENT%\"
if exist "%ROOT%\tailwind.config.js" move "%ROOT%\tailwind.config.js" "%CLIENT%\"
if exist "%ROOT%\postcss.config.js" move "%ROOT%\postcss.config.js" "%CLIENT%\"

echo.
echo Move Complete!
echo.
echo NEXT STEPS:
echo 1. Open terminal in: %CLIENT%
echo 2. Run: npm install
echo 3. Run: npm run dev
echo.
pause
