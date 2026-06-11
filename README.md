# Structured Trading Platform

**Production-grade GOLD (XAUUSD) and US500 trading terminal** built with Next.js 15, React 19, TypeScript, TailwindCSS, and Supabase.

## 🎯 Features

### Market Analysis
- **Live Market Data Dashboard** - Real-time price updates for XAUUSD and US500
- **Multi-Timeframe Analysis** - Weekly (W), Daily (D), and 4-Hour (H4) market structure
- **Advanced Technical Analysis** - SMA, RSI, ATR calculations

### Trading Signals
- **Automatic Signal Detection**:
  - Break of Structure (BOS)
  - Change of Character (CHoCH)
  - Order Blocks (OB)
  - Fair Value Gaps (FVG)
  - Liquidity Sweeps
- **Signal Scoring Engine** - Confidence-based signal generation
- **Signal History Database** - Track all generated signals

### Risk Management
- **Position Sizing Calculator** - Calculate optimal position size based on account risk
- **Risk:Reward Ratio Analysis** - 1:1, 1:2, 1:3 and custom ratios
- **Account Balance Tracking** - Real-time P&L monitoring
- **Stop Loss & Take Profit Calculator**

### Trading Journal
- **Trade Logging** - Record all executed trades
- **Performance Analytics** - Win rate, profit factor, Sharpe ratio
- **Trade Statistics** - Total trades, winning/losing trades, total P&L

### Backtesting
- **Strategy Backtesting Engine** - Test signals on historical data
- **Performance Metrics** - Max drawdown, profit factor, Sharpe ratio
- **Custom Date Range Testing**

### User Interface
- **Mobile-First Design** - Fully responsive professional terminal
- **Dark Theme** - Eye-friendly trading interface
- **Real-time Updates** - Live market data and signal generation
- **Intuitive Controls** - Easy navigation and configuration

## 🏗️ Project Structure

```
structured-trading-app/
├── app/                          # Next.js app directory
│   ├── api/                      # API routes
│   │   ├── market/[symbol]/      # Market data endpoint
│   │   ├── signals/[symbol]/     # Signal generation endpoint
│   │   ├── candles/[symbol]/[timeframe]/  # Historical candles
│   │   └── backtest/             # Backtesting engine
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── Dashboard.tsx             # Main dashboard
│   ├── MarketDataDisplay.tsx     # Market data display
│   ├── SignalBoard.tsx           # Signal history board
│   ├── RiskCalculator.tsx        # Risk management calculator
│   ├── TradeJournalPanel.tsx     # Trading journal
│   ├── PriceChart.tsx            # Price charting
│   ├── BacktestForm.tsx          # Backtest form
│   └── BacktestResults.tsx       # Backtest results display
├── src/strategy/                 # Trading strategy modules
│   ├── analysis.ts               # Structure detection (BOS, CHoCH, OB, FVG, Liquidity)
│   └── signalEngine.ts           # Signal generation engine
├── lib/                          # Utility libraries
│   ├── supabase.ts               # Supabase client
│   ├── riskCalculator.ts         # Risk calculations
│   └── technicalIndicators.ts    # Technical analysis (SMA, RSI, ATR)
├── services/                     # Business logic services
│   ├── signalService.ts          # Signal management
│   ├── tradeService.ts           # Trade management
│   ├── structureService.ts       # Market structure analysis
│   └── marketDataService.ts      # Market data fetching
├── store/                        # Zustand state management
│   └── trading.ts                # Trading state store
├── hooks/                        # React hooks
│   └── trading.ts                # Trading-specific hooks
├── types/                        # TypeScript types
│   ├── index.ts                  # Core trading types
│   └── supabase.ts               # Supabase database types
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript configuration
├── next.config.js                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.js             # PostCSS configuration
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm
- Supabase account (for production deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nyakalloletsela-ops/structured-trading-app.git
   cd structured-trading-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Type checking
npm run type-check
```

## 🗄️ Supabase Setup

### Create Tables

**Signals Table:**
```sql
CREATE TABLE signals (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  symbol VARCHAR(10),
  type VARCHAR(20),
  price DECIMAL,
  score DECIMAL,
  confidence DECIMAL,
  data JSONB
);
```

**Trades Table:**
```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP DEFAULT NOW(),
  symbol VARCHAR(10),
  entry_price DECIMAL,
  exit_price DECIMAL,
  entry_time BIGINT,
  exit_time BIGINT,
  type VARCHAR(10),
  size DECIMAL,
  pnl DECIMAL,
  notes TEXT
);
```

## 📊 Trading Strategies

### Signal Generation
The platform analyzes market structure across multiple timeframes:

1. **Break of Structure (BOS)** - Price breaks previous swing high/low
2. **Change of Character (CHoCH)** - Reversal of market direction
3. **Order Blocks** - Significant price action zones
4. **Fair Value Gaps (FVG)** - Unfilled price gaps
5. **Liquidity Sweeps** - Take out of previous swing levels

### Signal Scoring
- Each indicator contributes to overall signal score
- Confidence calculated based on indicator alignment
- Trades only when score exceeds threshold (±30 points)

## 💼 Risk Management

**Account-Based Sizing:**
```
Position Size = (Account Balance × Risk %) / Price Distance
```

**Risk:Reward Calculation:**
```
Take Profit = Entry + (Entry - Stop Loss) × Risk:Reward Ratio
```

## 📱 Mobile-First Design

- Responsive grid layout
- Touch-friendly controls
- Optimized for trading on mobile devices
- Dark theme for reduced eye strain

## 🔧 Tech Stack

- **Frontend**: React 19, Next.js 15, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts (extensible)
- **Deployment**: Vercel

## 📈 Performance Optimization

- Server-side rendering for SEO
- Client-side state management for instant updates
- Memoized components to prevent unnecessary re-renders
- Lazy loading of components
- Optimized API routes

## 🔐 Security

- Environment variable protection
- Supabase RLS (Row Level Security)
- API route validation
- Type-safe API responses

## 🚢 Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy trading platform"
   git push origin init/trading-platform
   ```

2. **Connect to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import the repository
   - Add environment variables
   - Deploy

3. **Automatic Deployments**
   - Push to main branch triggers automatic deployment
   - Preview deployments for pull requests

## 📝 API Endpoints

### Market Data
- `GET /api/market/:symbol` - Get current market data
- `GET /api/candles/:symbol/:timeframe` - Get historical candles

### Signals
- `GET /api/signals/:symbol` - Generate signal for symbol

### Backtesting
- `POST /api/backtest` - Run backtest on strategy

## 🐛 Debugging

```bash
# Type checking
npm run type-check

# Development with detailed logging
DEBUG=* npm run dev
```

## 📚 Documentation

See individual component files for detailed documentation.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Push to GitHub
4. Create a Pull Request

## 📄 License

MIT License - Feel free to use this for personal or commercial projects.

## ⚠️ Disclaimer

This is a trading tool for educational purposes. Always use proper risk management and never risk more than you can afford to lose. Past performance does not guarantee future results. Consult with a financial advisor before trading.

## 🎯 Future Enhancements

- [ ] Real-time WebSocket market data
- [ ] Advanced charting with Recharts/TradingView
- [ ] Machine learning signal prediction
- [ ] Multi-account support
- [ ] Trade notifications
- [ ] Mobile app (React Native)
- [ ] Social trading features
- [ ] Advanced backtesting with Monte Carlo

## 📞 Support

For issues and questions, please create an issue in the GitHub repository.

---

**Built with ❤️ for traders**
