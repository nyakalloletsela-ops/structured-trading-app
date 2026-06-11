# MT5 Python Data Bridge

## Overview

This Python service connects to your MetaTrader5 terminal and exposes real market data via REST API.

## Architecture

```
MetaTrader5 Terminal (running locally)
    ↓
Python Bridge (mt5_provider.py + main.py)
    ↓
REST API (Flask on port 5001)
    ↓
Next.js App (calls /candles endpoint)
    ↓
Vercel Dashboard (displays real signals)
```

## Installation

### Prerequisites

- **MetaTrader5 Terminal** installed and running on your machine
- **Python 3.8+** installed
- Windows, macOS, or Linux

### Setup

#### On Windows

```bash
cd python_bridge
setup.bat
```

#### On macOS / Linux

```bash
cd python_bridge
chmod +x setup.sh
./setup.sh
```

#### Manual Setup

```bash
# Create virtual environment
python3 -m venv python_bridge/venv

# Activate it
source python_bridge/venv/bin/activate  # macOS/Linux
python_bridge\venv\Scripts\activate.bat  # Windows

# Install dependencies
pip install -r python_bridge/requirements.txt
```

## Running

### Step 1: Start MetaTrader5

1. Open your MetaTrader5 terminal
2. Log into your account
3. Keep it running

### Step 2: Start the Python Bridge

```bash
# Activate virtual environment first
source python_bridge/venv/bin/activate  # macOS/Linux
# OR
python_bridge\venv\Scripts\activate.bat  # Windows

# Run the bridge
python python_bridge/main.py
```

You should see:

```
2024-01-15 10:30:45,123 - root - INFO - Starting MT5 Data Bridge...
2024-01-15 10:30:46,456 - root - INFO - MT5 initialized successfully
2024-01-15 10:30:46,789 - root - INFO - Symbol XAUUSD enabled
2024-01-15 10:30:46,890 - root - INFO - Symbol US500 enabled
 * Running on http://127.0.0.1:5001
```

### Step 3: Test the Connection

In another terminal:

```bash
# Health check
curl http://127.0.0.1:5001/health

# Fetch XAUUSD H4 candles
curl "http://127.0.0.1:5001/candles?symbol=XAUUSD&tf=H4&count=100"

# Get current XAUUSD price
curl "http://127.0.0.1:5001/quote?symbol=XAUUSD"

# Get account info
curl http://127.0.0.1:5001/account
```

## API Endpoints

### GET /health

Health check.

**Response:**
```json
{
  "status": "ok",
  "mt5_connected": true,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /candles

Fetch OHLCV candles.

**Parameters:**
- `symbol` (string): XAUUSD or US500
- `tf` (string): M30, H1, H4, D1, W1
- `count` (int): Number of candles (default 500, max 5000)

**Response:**
```json
{
  "success": true,
  "symbol": "XAUUSD",
  "timeframe": "H4",
  "candles": [
    {
      "time": 1705317600000,
      "open": 2050.50,
      "high": 2055.75,
      "low": 2048.25,
      "close": 2052.00,
      "volume": 45000
    },
    ...
  ],
  "count": 100,
  "cached": false,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /quote

Get current market quote.

**Parameters:**
- `symbol` (string): XAUUSD or US500

**Response:**
```json
{
  "success": true,
  "symbol": "XAUUSD",
  "bid": 2051.25,
  "ask": 2051.50,
  "last": 2051.35,
  "time": 1705317600000,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /account

Get MT5 account information.

**Response:**
```json
{
  "success": true,
  "login": 123456789,
  "server": "MetaQuotes-Demo",
  "balance": 10000.00,
  "equity": 10500.00,
  "margin": 2500.00,
  "free_margin": 8000.00,
  "currency": "USD",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### GET /cache/stats

Get cache statistics.

**Response:**
```json
{
  "success": true,
  "total_entries": 5,
  "keys": ["candles_XAUUSD_H4", "candles_US500_D1", ...],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### POST /cache/clear

Clear entire cache.

**Response:**
```json
{
  "success": true,
  "cleared": 5
}
```

## Caching

The bridge caches candles for **5 minutes** to reduce API calls to MT5.

```python
# Cache TTL: 300 seconds (5 minutes)
set_cache(cache_key, candles, ttl=300)
```

To clear cache:
```bash
curl -X POST http://127.0.0.1:5001/cache/clear
```

## Error Handling

All errors are handled gracefully:

```json
{
  "success": false,
  "error": "Invalid symbol: BTC"
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Invalid parameters
- `500`: Server error (MT5 disconnected, etc.)

## Troubleshooting

### Issue: "MetaTrader5 not installed"

```bash
pip install MetaTrader5
```

### Issue: "MT5 not connected"

1. Start MetaTrader5 terminal
2. Log into your account
3. Keep the terminal window open (do NOT minimize)
4. Restart the Python bridge

### Issue: "Symbol not found"

Check that the symbol exists in your MT5 terminal:
1. Open MT5
2. Right-click on Market Watch
3. Select "Symbols"
4. Search for XAUUSD or US500
5. Make sure they are added to Market Watch

### Issue: Port 5001 already in use

Change the port in `main.py`:

```python
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5002)  # Changed to 5002
```

Then update Next.js to use the new port.

## Performance

- **Candle fetch**: ~100ms (from cache: ~5ms)
- **Quote fetch**: ~50ms
- **Cache size**: ~1MB per 1000 candles
- **Max concurrent requests**: Limited only by Python/Flask

## Security Notes

⚠️ **This bridge should only run on localhost (127.0.0.1)**

Do NOT expose to the internet without authentication:

```python
# Bad: exposes to internet
app.run(host='0.0.0.0', port=5001)

# Good: localhost only
app.run(host='127.0.0.1', port=5001)
```

## Architecture Details

### MT5 Provider (`mt5_provider.py`)

Responsible for:
- Connecting to MT5 terminal
- Fetching OHLCV candles
- Getting quotes
- Managing account info

### Flask Bridge (`main.py`)

Responsible for:
- REST API endpoints
- Request validation
- Caching
- Error handling
- CORS support

### Timeframe Mapping

```
M30  → 30-minute
H1   → 1-hour
H4   → 4-hour
D1   → Daily
W1   → Weekly
```

### Symbol Mapping

```
XAUUSD → Gold vs USD
US500  → S&P 500 CFD
```

## Integration with Next.js

See `src/services/marketDataProvider.ts` for how the Next.js app calls this bridge.

```typescript
// Example usage
const provider = new MarketDataProvider('http://127.0.0.1:5001')
const candles = await provider.fetchCandles('XAUUSD', 'H4', 500)
```

## Docker (Optional)

To run in Docker:

```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY python_bridge/requirements.txt .
RUN pip install -r requirements.txt
COPY python_bridge/ .
CMD ["python", "main.py"]
```

```bash
docker build -f Dockerfile.python -t mt5-bridge .
docker run -p 5001:5001 mt5-bridge
```

## License

MIT
