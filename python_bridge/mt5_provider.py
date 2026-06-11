import requests
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False
    logger.warning("MetaTrader5 not installed. Install with: pip install MetaTrader5")

# Symbol mappings
SYMBOL_MAP = {
    "XAUUSD": "XAUUSD",
    "US500": "US500",
}

class MT5DataProvider:
    """Provides real market data from MetaTrader5 terminal."""

    def __init__(self):
        self.connected = False
        self.symbols_initialized = False
        self.initialize()

    def initialize(self) -> bool:
        """Initialize MT5 connection."""
        if not MT5_AVAILABLE:
            logger.error("MetaTrader5 package not available")
            return False

        try:
            if not mt5.initialize():
                logger.error(f"MT5 initialize failed: {mt5.last_error()}")
                self.connected = False
                return False

            logger.info("MT5 initialized successfully")
            self.connected = True

            self._enable_symbols()
            return True

        except Exception as e:
            logger.error(f"MT5 initialization error: {str(e)}")
            self.connected = False
            return False

    def _enable_symbols(self):
        try:
            for symbol in SYMBOL_MAP.values():
                if not mt5.symbol_select(symbol, True):
                    logger.warning(f"Failed to select symbol: {symbol}")
                else:
                    logger.info(f"Symbol enabled: {symbol}")

            self.symbols_initialized = True

        except Exception as e:
            logger.error(f"Symbol enable error: {str(e)}")

    def get_quote(self, symbol: str) -> Dict[str, Any] | None:
        if not self.connected:
            logger.error("MT5 not connected")
            return None

        try:
            if symbol not in SYMBOL_MAP:
                logger.error(f"Unknown symbol: {symbol}")
                return None

            mt5_symbol = SYMBOL_MAP[symbol]

            tick = mt5.symbol_info_tick(mt5_symbol)
            if tick is None:
                logger.error(f"Tick fetch failed: {mt5.last_error()}")
                return None

            return {
                "symbol": symbol,
                "bid": float(tick.bid),
                "ask": float(tick.ask),
                "last": float(tick.last),
                "time": int(tick.time * 1000),
            }

        except Exception as e:
            logger.error(f"Quote error: {str(e)}")
            return None

    def is_connected(self) -> bool:
        try:
            if not MT5_AVAILABLE:
                return False

            terminal = mt5.terminal_info()
            if terminal is None:
                return False

            return self.connected

        except Exception as e:
            logger.error(f"Connection check failed: {str(e)}")
            return False

    def shutdown(self):
        if MT5_AVAILABLE:
            mt5.shutdown()
            self.connected = False
            logger.info("MT5 shutdown")