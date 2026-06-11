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

# Timeframe mappings
TIMEFRAME_MAP = {
    "M30": mt5.TIMEFRAME_M30 if MT5_AVAILABLE else 30,
    "H1": mt5.TIMEFRAME_H1 if MT5_AVAILABLE else 60,
    "H4": mt5.TIMEFRAME_H4 if MT5_AVAILABLE else 240,
    "D1": mt5.TIMEFRAME_D1 if MT5_AVAILABLE else 1440,
    "W1": mt5.TIMEFRAME_W1 if MT5_AVAILABLE else 10080,
}

# Symbol mappings (MT5 symbol names may vary by broker)
SYMBOL_MAP = {
    "XAUUSD": "XAUUSD",  # Gold
    "US500": "US500",    # S&P 500 CFD
}

class MT5DataProvider:
    """Provides real market data from MetaTrader5 terminal."""

    def __init__(self, host: str = "127.0.0.1", port: int = 8080):
        """
        Initialize MT5 data provider.
        
        Args:
            host: MT5 terminal host
            port: MT5 terminal port (not used if connecting directly)
        """
        self.host = host
        self.port = port
        self.connected = False
        self.symbols_initialized = False
        self.initialize()

    def initialize(self) -> bool:
        """Initialize MT5 connection."""
        if not MT5_AVAILABLE:
            logger.error("MetaTrader5 package not available")
            return False

        try:
            # Initialize MT5
            if not mt5.initialize():
                logger.error(f"Failed to initialize MT5: {mt5.last_error()}")
                return False

            logger.info("MT5 initialized successfully")
            self.connected = True

            # Enable symbols
            self._enable_symbols()
            return True
        except Exception as e:
            logger.error(f"MT5 initialization error: {str(e)}")
            return False

    def _enable_symbols(self) -> None:
        """Enable required symbols in MT5."""
        try:
            for symbol_key, symbol_name in SYMBOL_MAP.items():
                if not mt5.symbol_select(symbol_name, True):
                    logger.warning(f"Failed to select symbol {symbol_name}")
                else:
                    logger.info(f"Symbol {symbol_name} enabled")
            self.symbols_initialized = True
        except Exception as e:
            logger.warning(f"Error enabling symbols: {str(e)}")

    def fetch_candles(self, symbol: str, timeframe: str, count: int = 500) -> List[Dict[str, Any]]:
        """
        Fetch OHLCV candles from MT5.
        
        Args:
            symbol: Trading symbol (XAUUSD, US500, etc.)
            timeframe: Timeframe (M30, H1, H4, D1, W1)
            count: Number of candles to fetch
            
        Returns:
            List of candle dictionaries matching Candle interface
        """
        if not self.connected:
            logger.error("MT5 not connected")
            return []

        try:
            # Map symbol name
            if symbol not in SYMBOL_MAP:
                logger.error(f"Unknown symbol: {symbol}")
                return []
            
            mt5_symbol = SYMBOL_MAP[symbol]

            # Map timeframe
            if timeframe not in TIMEFRAME_MAP:
                logger.error(f"Unknown timeframe: {timeframe}")
                return []
            
            mt5_timeframe = TIMEFRAME_MAP[timeframe]

            logger.info(f"Fetching {count} {timeframe} candles for {mt5_symbol}...")

            # Fetch rates from MT5
            rates = mt5.copy_rates_from_pos(mt5_symbol, mt5_timeframe, 0, count)
            
            if rates is None:
                logger.error(f"Failed to fetch candles: {mt5.last_error()}")
                return []

            if len(rates) == 0:
                logger.warning(f"No candles returned for {mt5_symbol} {timeframe}")
                return []

            # Convert to Candle interface
            candles = []
            for rate in rates:
                candle = {
                    "time": int(rate["time"] * 1000),  # Convert to ms
                    "open": float(rate["open"]),
                    "high": float(rate["high"]),
                    "low": float(rate["low"]),
                    "close": float(rate["close"]),
                    "volume": int(rate["tick_volume"]),
                }
                candles.append(candle)

            logger.info(f"Successfully fetched {len(candles)} candles for {mt5_symbol} {timeframe}")
            return candles

        except Exception as e:
            logger.error(f"Error fetching candles: {str(e)}")
            return []

    def get_quote(self, symbol: str) -> Dict[str, Any] | None:
        """
        Get current market quote for a symbol.
        
        Args:
            symbol: Trading symbol
            
        Returns:
            Quote dictionary with bid/ask/price or None
        """
        if not self.connected:
            return None

        try:
            if symbol not in SYMBOL_MAP:
                return None
            
            mt5_symbol = SYMBOL_MAP[symbol]
            
            tick = mt5.symbol_info_tick(mt5_symbol)
            if tick is None:
                logger.error(f"Failed to get tick for {mt5_symbol}: {mt5.last_error()}")
                return None

            return {
                "symbol": symbol,
                "bid": float(tick.bid),
                "ask": float(tick.ask),
                "last": float(tick.last),
                "time": int(tick.time * 1000),
            }
        except Exception as e:
            logger.error(f"Error getting quote: {str(e)}")
            return None

    def get_account_info(self) -> Dict[str, Any] | None:
        """
        Get MT5 account information.
        
        Returns:
            Account info dictionary or None
        """
        if not self.connected:
            return None

        try:
            account_info = mt5.account_info()
            if account_info is None:
                logger.error(f"Failed to get account info: {mt5.last_error()}")
                return None

            return {
                "login": account_info.login,
                "server": account_info.server,
                "balance": float(account_info.balance),
                "equity": float(account_info.equity),
                "margin": float(account_info.margin),
                "free_margin": float(account_info.free_margin),
                "currency": account_info.currency,
            }
        except Exception as e:
            logger.error(f"Error getting account info: {str(e)}")
            return None

    def shutdown(self) -> None:
        """Shutdown MT5 connection."""
        if MT5_AVAILABLE and self.connected:
            try:
                mt5.shutdown()
                logger.info("MT5 shutdown")
                self.connected = False
            except Exception as e:
                logger.error(f"Error shutting down MT5: {str(e)}")

    def is_connected(self) -> bool:
        """Check if MT5 is connected."""
        if not self.connected:
            return False
        
        try:
            if MT5_AVAILABLE:
                # Try to get server time to verify connection
                info = mt5.terminal_info()
                return info is not None
            return False
        except Exception as e:
            logger.error(f"Connection check failed: {str(e)}")
            return False
