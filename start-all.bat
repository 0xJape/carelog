@echo off
setlocal
cd /d "%~dp0"

echo Starting CLINIQAI development server...
call pnpm dev -- --host 127.0.0.1

pause
