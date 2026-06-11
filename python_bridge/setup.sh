#!/bin/bash
# Python Bridge Setup Script
# Run this once to set up the MT5 data bridge

echo "Setting up Python MT5 Data Bridge..."

# Check if Python 3.8+ is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3.8+ is required"
    exit 1
fi

echo "Python version: $(python3 --version)"

# Create virtual environment
if [ ! -d "python_bridge/venv" ]; then
    echo "Creating virtual environment..."
    cd python_bridge
    python3 -m venv venv
    cd ..
fi

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source python_bridge/venv/Scripts/activate
else
    source python_bridge/venv/bin/activate
fi

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r python_bridge/requirements.txt

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Start MetaTrader5 terminal on your machine"
echo "2. Run: python python_bridge/main.py"
echo "3. Python bridge will listen on http://127.0.0.1:5001"
echo ""
echo "Available endpoints:"
echo "  GET  http://127.0.0.1:5001/health"
echo "  GET  http://127.0.0.1:5001/candles?symbol=XAUUSD&tf=H4"
echo "  GET  http://127.0.0.1:5001/quote?symbol=XAUUSD"
echo "  GET  http://127.0.0.1:5001/account"
echo ""
