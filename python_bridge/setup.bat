@echo off
REM Python Bridge Setup Script for Windows
REM Run this once to set up the MT5 data bridge

echo Setting up Python MT5 Data Bridge...

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python 3.8+ is required
    exit /b 1
)

echo Python version:
python --version

REM Create virtual environment
if not exist "python_bridge\venv" (
    echo Creating virtual environment...
    cd python_bridge
    python -m venv venv
    cd ..
)

REM Activate virtual environment
echo Activating virtual environment...
call python_bridge\venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r python_bridge\requirements.txt

echo.
echo Setup complete!
echo.
echo Next steps:
echo 1. Start MetaTrader5 terminal on your machine
echo 2. Run: python python_bridge\main.py
echo 3. Python bridge will listen on http://127.0.0.1:5001
echo.
echo Available endpoints:
echo   GET  http://127.0.0.1:5001/health
echo   GET  http://127.0.0.1:5001/candles?symbol=XAUUSD^&tf=H4
echo   GET  http://127.0.0.1:5001/quote?symbol=XAUUSD
echo   GET  http://127.0.0.1:5001/account
echo.
pause
