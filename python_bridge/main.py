from flask import Flask, jsonify, request, Response
from flask_cors import CORS
from functools import lru_cache
from datetime import datetime, timedelta
import logging
import json
from typing import Dict, List, Any
import time

from mt5_provider import MT5DataProvider, TIMEFRAME_MAP, SYMBOL_MAP

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize MT5 provider
mt5_provider = MT5DataProvider()

# In-memory cache with TTL
class CacheEntry:
    def __init__(self, data: Any, ttl_seconds: int = 300):
        self.data = data
        self.expires_at = time.time() + ttl_seconds
    
    def is_expired(self) -> bool:
        return time.time() > self.expires_at

cache: Dict[str, CacheEntry] = {}

def get_cache_key(symbol: str, timeframe: str) -> str:
    """Generate cache key."""
    return f"candles_{symbol}_{timeframe}"

def get_from_cache(key: str) -> Any:
    """Get value from cache if not expired."""
    if key in cache:
        entry = cache[key]
        if not entry.is_expired():
            logger.info(f"Cache hit: {key}")
            return entry.data
        else:
            del cache[key]
    return None

def set_cache(key: str, data: Any, ttl: int = 300) -> None:
    """Set value in cache."""
    cache[key] = CacheEntry(data, ttl)
    logger.info(f"Cache set: {key} (TTL: {ttl}s)")

@app.route('/health', methods=['GET'])
def health() -> Response:
    """
    Health check endpoint.
    
    Returns:
        {"status": "ok", "mt5_connected": bool}
    """
    is_connected = mt5_provider.is_connected()
    status = "ok" if is_connected else "warning"
    
    return jsonify({
        "status": status,
        "mt5_connected": is_connected,
        "timestamp": datetime.utcnow().isoformat(),
    }), 200

@app.route('/candles', methods=['GET'])
def get_candles() -> Response:
    """
    Fetch OHLCV candles for a symbol and timeframe.
    
    Query Parameters:
        symbol (str): Trading symbol (XAUUSD, US500)
        tf (str): Timeframe (M30, H1, H4, D1, W1)
        count (int): Number of candles (default 500, max 5000)
        
    Returns:
        {
            "success": bool,
            "symbol": str,
            "timeframe": str,
            "candles": [
                {
                    "time": int (ms),
                    "open": float,
                    "high": float,
                    "low": float,
                    "close": float,
                    "volume": int
                },
                ...
            ],
            "count": int,
            "cached": bool,
            "timestamp": str
        }
    """
    try:
        # Get parameters
        symbol = request.args.get('symbol', 'XAUUSD').upper()
        timeframe = request.args.get('tf', 'H4').upper()
        count = min(int(request.args.get('count', 500)), 5000)  # Max 5000
        
        # Validate parameters
        if symbol not in SYMBOL_MAP:
            return jsonify({
                "success": False,
                "error": f"Invalid symbol: {symbol}. Supported: {list(SYMBOL_MAP.keys())}",
            }), 400
        
        if timeframe not in TIMEFRAME_MAP:
            return jsonify({
                "success": False,
                "error": f"Invalid timeframe: {timeframe}. Supported: {list(TIMEFRAME_MAP.keys())}",
            }), 400
        
        # Check cache
        cache_key = get_cache_key(symbol, timeframe)
        cached_candles = get_from_cache(cache_key)
        cached = False
        
        if cached_candles is not None and len(cached_candles) >= count:
            candles = cached_candles[-count:]
            cached = True
        else:
            # Fetch from MT5
            logger.info(f"Fetching {count} candles for {symbol} {timeframe}")
            candles = mt5_provider.fetch_candles(symbol, timeframe, count)
            
            if not candles:
                return jsonify({
                    "success": False,
                    "error": f"Failed to fetch candles for {symbol} {timeframe}",
                }), 500
            
            # Cache for 5 minutes
            set_cache(cache_key, candles, ttl=300)
        
        return jsonify({
            "success": True,
            "symbol": symbol,
            "timeframe": timeframe,
            "candles": candles,
            "count": len(candles),
            "cached": cached,
            "timestamp": datetime.utcnow().isoformat(),
        }), 200
    
    except ValueError as e:
        return jsonify({
            "success": False,
            "error": f"Invalid parameter: {str(e)}",
        }), 400
    except Exception as e:
        logger.error(f"Error in /candles: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500

@app.route('/quote', methods=['GET'])
def get_quote() -> Response:
    """
    Get current market quote for a symbol.
    
    Query Parameters:
        symbol (str): Trading symbol (XAUUSD, US500)
        
    Returns:
        {
            "success": bool,
            "symbol": str,
            "bid": float,
            "ask": float,
            "last": float,
            "time": int (ms),
            "timestamp": str
        }
    """
    try:
        symbol = request.args.get('symbol', 'XAUUSD').upper()
        
        if symbol not in SYMBOL_MAP:
            return jsonify({
                "success": False,
                "error": f"Invalid symbol: {symbol}",
            }), 400
        
        quote = mt5_provider.get_quote(symbol)
        
        if quote is None:
            return jsonify({
                "success": False,
                "error": f"Failed to fetch quote for {symbol}",
            }), 500
        
        quote["success"] = True
        quote["timestamp"] = datetime.utcnow().isoformat()
        return jsonify(quote), 200
    
    except Exception as e:
        logger.error(f"Error in /quote: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500

@app.route('/account', methods=['GET'])
def get_account() -> Response:
    """
    Get MT5 account information.
    
    Returns:
        {
            "success": bool,
            "login": int,
            "server": str,
            "balance": float,
            "equity": float,
            "margin": float,
            "free_margin": float,
            "currency": str,
            "timestamp": str
        }
    """
    try:
        account = mt5_provider.get_account_info()
        
        if account is None:
            return jsonify({
                "success": False,
                "error": "Failed to fetch account info",
            }), 500
        
        account["success"] = True
        account["timestamp"] = datetime.utcnow().isoformat()
        return jsonify(account), 200
    
    except Exception as e:
        logger.error(f"Error in /account: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500

@app.route('/cache/clear', methods=['POST'])
def clear_cache() -> Response:
    """
    Clear entire cache (admin endpoint).
    
    Returns:
        {"success": bool, "cleared": int}
    """
    try:
        count = len(cache)
        cache.clear()
        logger.info(f"Cache cleared: {count} entries")
        return jsonify({
            "success": True,
            "cleared": count,
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500

@app.route('/cache/stats', methods=['GET'])
def cache_stats() -> Response:
    """
    Get cache statistics.
    
    Returns:
        {"success": bool, "total_entries": int, "keys": [...]}
    """
    try:
        # Clean expired entries
        expired = [k for k, v in cache.items() if v.is_expired()]
        for k in expired:
            del cache[k]
        
        return jsonify({
            "success": True,
            "total_entries": len(cache),
            "keys": list(cache.keys()),
            "timestamp": datetime.utcnow().isoformat(),
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
        }), 500

@app.errorhandler(404)
def not_found(error: Exception) -> Response:
    """Handle 404 errors."""
    return jsonify({
        "success": False,
        "error": "Endpoint not found",
    }), 404

@app.errorhandler(500)
def internal_error(error: Exception) -> Response:
    """Handle 500 errors."""
    logger.error(f"Internal error: {str(error)}")
    return jsonify({
        "success": False,
        "error": "Internal server error",
    }), 500

if __name__ == '__main__':
    logger.info("Starting MT5 Data Bridge...")
    
    if not mt5_provider.is_connected():
        logger.warning("WARNING: MT5 is not connected. Please start MetaTrader5 terminal.")
        logger.warning("The service will try to reconnect when requests arrive.")
    
    # Start Flask app
    app.run(
        host='127.0.0.1',
        port=5001,
        debug=False,
        threaded=True,
    )
