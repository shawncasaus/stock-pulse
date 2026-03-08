# StockPulse

An interactive single-page application for charting US stock prices over time. Built for fund managers to analyze historical price data and compare multiple stocks simultaneously.

## Features

- **Stock Search**: Search and select up to 3 US stocks by ticker symbol or company name
- **Interactive Charts**: View time series data with zoom, pan, and hover interactions
- **Price Type Toggle**: Switch between Open, High, Low, and Close prices
- **Date Range Selection**: Customize the time period for analysis
- **Instant Search**: Local filtering of 328 popular stocks for instant results
- **Manual Chart Loading**: Explicit "Load Chart" button to control API usage
- **Rate Limit Notifications**: Real-time countdown notifications when API limit is reached
- **Smart Loading States**: Chart stays in loading state during rate-limited waits
- **Rate Limiting**: Respects Polygon.io free tier limits (5 API calls/minute) for chart data

## Tech Stack

- **Framework**: Next.js 15 (App Router) with TypeScript
- **State Management**: Zustand
- **Data Fetching**: SWR with client-side caching
- **Charting**: Apache ECharts
- **Styling**: Tailwind CSS
- **API**: Polygon.io (free tier)

## Prerequisites

- Node.js 18+ and npm
- Polygon.io API key (free tier) - [Sign up here](https://polygon.io)

## Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd stock-pulse
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your Polygon.io API key:

```
POLYGON_API_KEY=your_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
stock-pulse/
├── app/
│   ├── api/
│   │   └── stocks/
│   │       └── aggregates/route.ts   # Historical price data endpoint
│   ├── layout.tsx                    # Root layout with metadata
│   ├── page.tsx                      # Main application page
│   └── globals.css                   # Global styles
├── components/                       # React UI components
├── data/
│   └── popular-stocks.json          # Static list of 300+ popular stocks
├── hooks/
│   ├── useStockData.ts              # SWR hook for fetching stock data
│   ├── useStockSearch.ts            # Hook for local stock search
│   ├── useDebounce.ts               # Generic debounce hook
│   └── useChartOptions.ts           # ECharts configuration generator
├── lib/
│   ├── polygonClient.ts             # Polygon API client wrapper
│   ├── rateLimit.ts                 # Rate limiter (5 calls/min)
│   ├── constants.ts                 # Application constants
│   ├── apiHelpers.ts                # API response utilities
│   └── validators.ts                # Input validation utilities
├── store/
│   └── useStockStore.ts             # Zustand global state store
├── types/
│   └── stock.types.ts               # TypeScript type definitions
├── utils/
│   └── dataTransform.ts             # Data transformation utilities
└── __tests__/                       # Test files (to be built)
```

## Architecture Highlights

### Optimized API Usage Strategy

The application uses multiple strategies to minimize API usage and respect rate limits:

1. **Local Stock Search**: Static JSON file with 328 popular US stocks - **zero API calls for search**
   - Instant autocomplete results (< 50ms)
   - Includes major companies, ETFs, and international stocks
   - Case-insensitive symbol and name matching

2. **Manual Chart Loading**: Explicit "Load Chart" button prevents unnecessary API calls
   - Users select stocks without triggering fetches
   - Single API call fetches all selected stocks at once
   - Visual feedback shows API usage cost (1 call per load)

3. **Rate Limiting**: Sliding window limiter protects the aggregates endpoint
   - Respects Polygon.io free tier limit (5 calls/min)
   - Automatic queuing when limit approached
   - Prevents accidental rate limit violations

4. **Client-Side Caching**: SWR provides intelligent caching
   - 5-minute cache for fetched data
   - Reduces redundant API calls
   - Instant display for recently viewed data

This multi-layered approach ensures a responsive user experience while staying well within API limits.

## API Endpoints

### GET `/api/stocks/aggregates`

Fetch historical daily price data (OHLCV) for multiple stocks.

**Query Parameters:**
- `symbols` (required): Comma-separated ticker symbols (max 3)
- `from` (required): Start date in YYYY-MM-DD format
- `to` (required): End date in YYYY-MM-DD format

**Example Request:**
```
GET /api/stocks/aggregates?symbols=AAPL,MSFT,TSLA&from=2024-01-01&to=2024-12-31
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "AAPL": [
      {
        "t": 1704153600000,
        "o": 185.23,
        "h": 186.95,
        "l": 184.50,
        "c": 186.40,
        "v": 45678900
      }
    ],
    "MSFT": [...],
    "TSLA": [...]
  }
}
```

**Response Fields:**
- `t`: Timestamp (milliseconds)
- `o`: Open price
- `h`: High price
- `l`: Low price
- `c`: Close price
- `v`: Trading volume

## State Management

The application uses Zustand for global state management:

```typescript
// Access store in any component
import { useStockStore } from '@/store/useStockStore';

const { selectedStocks, dateRange, priceType, addStock, removeStock } = useStockStore();
```

**Store State:**
- `selectedStocks`: Array of selected ticker symbols (max 3)
- `dateRange`: Object with `from` and `to` dates
- `priceType`: One of 'open' | 'high' | 'low' | 'close'

**Store Actions:**
- `addStock(symbol)`: Add a stock (validates max 3 and no duplicates)
- `removeStock(symbol)`: Remove a stock
- `setStocks(symbols)`: Set all stocks at once
- `setDateRange(range)`: Update date range
- `setPriceType(type)`: Change price type
- `clearStocks()`: Clear all selections
- `canAddStock()`: Check if another stock can be added
- `hasStocks()`: Check if any stocks are selected

## Data Fetching

The app uses SWR for efficient data fetching with caching:

```typescript
import { useStockData } from '@/hooks/useStockData';

const { data, isLoading, error } = useStockData(
  ['AAPL', 'MSFT'],
  '2024-01-01',
  '2024-12-31'
);
```

**Features:**
- 5-minute client-side cache
- Automatic deduplication
- No unnecessary refetching
- Works seamlessly with Zustand store

## Rate Limiting

All Polygon API calls go through a rate limiter that enforces the 5 calls/minute limit:

```typescript
// Automatically handled in API routes
const data = await rateLimiter.executeRequest(() =>
  fetchPolygonAggregates(symbol, from, to)
);
```

The rate limiter uses a sliding window algorithm and queues requests that exceed the limit.

## Key Constraints

- **Maximum 3 stocks** can be selected simultaneously
- **5 API calls per minute** (Polygon free tier limit)
- **US stocks only** from major exchanges
- **Date format**: YYYY-MM-DD required
- **Free tier data**: 2 years of historical data available

## Development Notes

### Adding New API Routes

All API routes should:
1. Use the rate limiter for Polygon API calls
2. Include proper validation
3. Return consistent response format with `success` and `error` fields
4. Handle all error cases (404, 429, 401, 500)

### State Updates

Use Zustand actions instead of direct state mutation:

```typescript
// ✓ Good
addStock('AAPL');

// ✗ Bad - don't mutate state directly
selectedStocks.push('AAPL');
```

### Type Safety

All API responses and data structures are fully typed. Import types from `@/types/stock.types`:

```typescript
import type { Stock, PolygonBar, StockDataMap } from '@/types/stock.types';
```

## Testing

Tests will be located in the `__tests__/` directory using Jest and React Testing Library.

```bash
npm test              # Run tests
npm test -- --watch   # Run in watch mode
npm test -- --coverage # Generate coverage report
```

## Troubleshooting

### Rate Limit Errors
If you see "Rate limit exceeded" errors:
- Wait 1 minute between bursts of requests
- The rate limiter automatically queues requests
- Client-side cache (SWR) reduces API calls

### Missing Data
If stock data is empty:
- Verify the ticker symbol is correct
- Check the date range is within the last 2 years (free tier limit)
- Ensure markets were open on those dates

### API Key Issues
If you see authentication errors:
- Verify `POLYGON_API_KEY` is set in `.env.local`
- Check the API key is valid at [polygon.io](https://polygon.io)
- Restart the development server after changing `.env.local`

## Resources

- [Polygon.io API Documentation](https://polygon.io/docs/stocks)
- [Next.js Documentation](https://nextjs.org/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Apache ECharts Documentation](https://echarts.apache.org/en/index.html)
- [SWR Documentation](https://swr.vercel.app/)

## License

This project is for educational/assignment purposes.
