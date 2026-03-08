# StockPulse

A web application for visualizing and analyzing US equity price data. Select up to three stocks, choose a date range and price type, then view an interactive time series chart with zoom and pan capabilities.

## Overview

StockPulse provides fund managers and traders with a streamlined interface for comparing historical stock prices. The application fetches data from Polygon.io's market data API and renders it using Apache ECharts for smooth, interactive visualizations.

Key capabilities:
- Search 328+ popular US stocks by symbol or company name
- Compare up to 3 stocks simultaneously on a single chart
- Toggle between Open, High, Low, and Close price types
- Select custom date ranges (up to 2 years of historical data)
- Zoom, pan, and hover interactions on the chart
- Automatic rate limiting and caching to respect API quotas

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or yarn package manager
- A free Polygon.io API key (sign up at https://polygon.io)

### Installation

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd stock-pulse
npm install
```

2. Configure your API key:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Polygon.io API key:

```
POLYGON_API_KEY=your_actual_key_here
```

3. Start the development server:

```bash
npm run dev
```

The application will be available at http://localhost:3000

### Production Build

To create an optimized production build:

```bash
npm run build
npm start
```

## Testing

The application uses Jest, React Testing Library, and MSW for testing.

### Running Tests

```bash
npm test                    # Run all tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
npm run test:ci             # Run tests in CI mode
```

### Test Structure

```
tests/
├── components/        # Component tests
├── hooks/            # Hook tests
├── store/            # Store tests
├── utils/            # Utility tests
├── fixtures/         # Mock data and test fixtures
├── mocks/            # MSW API mock handlers
└── utils/            # Test utilities and helpers
```

### Writing Tests

**Component tests** use the custom render function:

```typescript
import { render, screen } from '@/tests/utils/test-utils'

test('renders component', () => {
  render(<MyComponent />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

**Hook tests** use renderHook:

```typescript
import { renderHook } from '@testing-library/react'

test('returns expected value', () => {
  const { result } = renderHook(() => useMyHook())
  expect(result.current).toBeDefined()
})
```

**API mocking** via MSW:

```typescript
import { server } from '@/tests/mocks/server'
import { errorHandlers } from '@/tests/mocks/handlers'

test('handles API errors', () => {
  server.use(...errorHandlers)
  // Test code
})
```

### Coverage Goals

Target: 80% coverage for branches, functions, lines, and statements. Coverage reports are saved to `coverage/`.

### Available Mocks

- ResizeObserver (for chart components)
- matchMedia (for responsive design)
- localStorage (for persistent state)
- API routes (via MSW)

## Project Structure

```
stock-pulse/
├── app/
│   ├── api/stocks/aggregates/route.ts    # API route for stock data
│   ├── globals.css                       # Global styles and theme
│   ├── layout.tsx                        # Root layout
│   └── page.tsx                          # Main page
├── components/
│   ├── DateRangePicker.tsx               # Date range selector
│   ├── EmptyState.tsx                    # Empty state displays
│   ├── ErrorMessage.tsx                  # Error displays
│   ├── LoadChartButton.tsx               # Chart load trigger
│   ├── LoadingSpinner.tsx                # Loading indicators
│   ├── PriceTypeToggle.tsx               # Price type selector
│   ├── RateLimitToast.tsx                # Rate limit notifications
│   ├── StockChart.tsx                    # Main chart component
│   ├── StockSearchSelector.tsx           # Stock search and selection
│   ├── ThemeToggle.tsx                   # Light/dark theme toggle
│   └── ToastContainer.tsx                # Toast notification container
├── data/
│   └── popular-stocks.json               # Static stock list
├── hooks/
│   ├── useChartOptions.ts                # ECharts configuration
│   ├── useDebounce.ts                    # Debounce utility
│   ├── useStockData.ts                   # Data fetching with SWR
│   └── useStockSearch.ts                 # Local stock search
├── lib/
│   ├── apiHelpers.ts                     # API response utilities
│   ├── constants.ts                      # Application constants
│   ├── polygonClient.ts                  # Polygon API client
│   ├── rateLimit.ts                      # Rate limiter
│   └── validators.ts                     # Input validators
├── store/
│   ├── useStockStore.ts                  # Application state
│   ├── useThemeStore.ts                  # Theme state
│   └── useToastStore.ts                  # Toast notification state
├── types/
│   └── stock.types.ts                    # TypeScript definitions
└── utils/
    └── dataTransform.ts                  # Data transformation utilities
```

## Architecture

### Data Flow

1. User searches for stocks using the search selector
2. Search filters the local `popular-stocks.json` file (no API call)
3. User selects up to 3 stocks, chooses date range and price type
4. User clicks "Load Chart" button
5. API route fetches data from Polygon.io (rate-limited)
6. SWR caches the response for 5 minutes
7. Data is transformed and rendered in ECharts

### API Usage Optimization

The application is designed to minimize API calls:

- Stock search uses a local JSON file (328 stocks) for instant results
- Chart data is only fetched when the user explicitly clicks "Load Chart"
- A sliding window rate limiter prevents exceeding the 5 calls/minute quota
- SWR provides client-side caching with 5-minute TTL
- Rate limit notifications inform users when requests are queued

### State Management

The application uses three Zustand stores:

- `useStockStore`: Selected stocks, date range, price type, and fetch trigger
- `useThemeStore`: Current theme (light/dark) with localStorage persistence
- `useToastStore`: Toast notification state for rate limit alerts

## API Reference

### GET /api/stocks/aggregates

Fetches historical aggregate data for one or more stock symbols.

**Query Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| symbols | string | Yes | Comma-separated ticker symbols (max 3) |
| from | string | Yes | Start date in YYYY-MM-DD format |
| to | string | Yes | End date in YYYY-MM-DD format |

**Response Format**

```typescript
{
  success: boolean;
  data?: {
    [symbol: string]: Array<{
      t: number;    // Timestamp (milliseconds)
      o: number;    // Open price
      h: number;    // High price
      l: number;    // Low price
      c: number;    // Close price
      v: number;    // Volume
    }>;
  };
  error?: string;
}
```

**Error Codes**

| Code | Description |
|------|-------------|
| 400 | Invalid request parameters |
| 401 | Invalid API key |
| 403 | Date range not available on free tier |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Technology Stack

- **Framework**: Next.js 15 with App Router and Server Components
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4 with Catppuccin theme
- **State**: Zustand with devtools and persist middleware
- **Data Fetching**: SWR for client-side caching and revalidation
- **Charting**: Apache ECharts via echarts-for-react
- **Date Utilities**: date-fns
- **Testing**: Jest, React Testing Library, MSW (planned)
- **API**: Polygon.io REST API (free tier)

## Development

### Environment Variables

Required variables in `.env.local`:

```
POLYGON_API_KEY=your_polygon_io_api_key
```

### Available Scripts

```bash
npm run dev          # Start development server (port 3000)
npm run build        # Create production build
npm start            # Start production server
npm test             # Run test suite
npm run lint         # Run ESLint
```

### Code Organization

- **Components**: React components for UI elements
- **Hooks**: Custom React hooks for data fetching and state
- **Lib**: Utility functions and external service clients
- **Store**: Zustand state stores
- **Types**: TypeScript type definitions
- **Utils**: Data transformation and helper functions

### Adding New Features

1. Define TypeScript types in `types/stock.types.ts`
2. Create components in `components/`
3. Add hooks for data logic in `hooks/`
4. Update store if new state is needed
5. Write tests in `tests/`

## Constraints and Limitations

- Maximum of 3 stocks can be selected at once
- Polygon.io free tier allows 5 API calls per minute
- Historical data limited to past 2 years on free tier
- Only US stocks from major exchanges (NASDAQ, NYSE, ARCA, etc.)
- Date pickers restricted to prevent future dates and out-of-range selections

## Performance Considerations

The application implements several optimizations:

- Stock search is entirely client-side (328 stocks cached locally)
- Chart data fetches are explicit user actions (via "Load Chart" button)
- SWR deduplicates identical requests automatically
- Rate limiter queues requests to prevent 429 errors
- Dynamic imports for ECharts reduce initial bundle size
- Static stock list is only 26KB

## Troubleshooting

### Rate Limit Issues

If you encounter rate limit errors:
- Wait 60 seconds before making additional requests
- The rate limiter will automatically queue and process requests
- Check the rate limit notification toast for countdown information

### Missing or Invalid Data

If stock data appears empty or incorrect:
- Verify the ticker symbol exists in the Polygon.io database
- Ensure the date range falls within the past 2 years
- Check that the selected dates are trading days (markets closed on weekends/holidays)
- Review the browser console for detailed error messages

### API Key Problems

If authentication fails:
- Confirm `POLYGON_API_KEY` is set correctly in `.env.local`
- Verify the API key is active at https://polygon.io/dashboard
- Restart the development server after modifying environment variables

### Build or Type Errors

If TypeScript compilation fails:
- Delete the `.next` directory and rebuild
- Run `npx tsc --noEmit` to check for type errors
- Ensure all dependencies are installed correctly

## Resources

- Polygon.io API Documentation: https://polygon.io/docs/stocks
- Next.js App Router: https://nextjs.org/docs/app
- ECharts Documentation: https://echarts.apache.org/en/option.html
- Zustand Guide: https://zustand-demo.pmnd.rs/
- SWR Documentation: https://swr.vercel.app/

## License

This project was created for interview and assessment purposes.
