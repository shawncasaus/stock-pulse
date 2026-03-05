// ============================================================================
// Type Definitions for StockPulse Application
// ============================================================================

// ----------------------------------------------------------------------------
// Price Type
// ----------------------------------------------------------------------------

export type PriceType = 'open' | 'high' | 'low' | 'close';

// ----------------------------------------------------------------------------
// Date Range
// ----------------------------------------------------------------------------

export interface DateRange {
  from: string; // YYYY-MM-DD format
  to: string; // YYYY-MM-DD format
}

// ----------------------------------------------------------------------------
// Polygon API Types
// ----------------------------------------------------------------------------

/**
 * Individual bar/candle data from Polygon API
 */
export interface PolygonBar {
  t: number; // timestamp (milliseconds)
  o: number; // open price
  h: number; // high price
  l: number; // low price
  c: number; // close price
  v: number; // volume
  vw?: number; // volume weighted average price (optional)
  n?: number; // number of transactions (optional)
}

/**
 * Response structure from Polygon aggregates endpoint
 */
export interface PolygonResponse {
  ticker: string;
  queryCount: number;
  resultsCount: number;
  adjusted: boolean;
  results: PolygonBar[];
  status: string;
  request_id?: string;
  count?: number;
}

/**
 * Ticker search result from Polygon
 */
export interface PolygonTickerResult {
  ticker: string;
  name: string;
  market: string;
  locale: string;
  primary_exchange?: string;
  type?: string;
  active?: boolean;
  currency_name?: string;
  cik?: string;
  composite_figi?: string;
  share_class_figi?: string;
}

/**
 * Response from Polygon ticker search endpoint
 */
export interface PolygonTickerSearchResponse {
  results: PolygonTickerResult[];
  status: string;
  count: number;
  request_id?: string;
  next_url?: string;
}

// ----------------------------------------------------------------------------
// Application Data Types
// ----------------------------------------------------------------------------

/**
 * Map of stock symbols to their bar data
 * Example: { AAPL: [...], MSFT: [...], AMZN: [...] }
 */
export interface StockDataMap {
  [symbol: string]: PolygonBar[];
}

/**
 * Single data point for chart rendering
 * Contains date and price for each stock
 */
export interface ChartDataPoint {
  date: string; // YYYY-MM-DD format
  timestamp: number; // milliseconds
  [symbol: string]: string | number; // Dynamic stock symbols with their prices
}

/**
 * Stock search result (simplified for UI)
 */
export interface Stock {
  symbol: string;
  name: string;
  exchange?: string;
}

// ----------------------------------------------------------------------------
// API Response Types
// ----------------------------------------------------------------------------

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

/**
 * Response from /api/stocks/aggregates
 */
export interface StockDataResponse extends ApiResponse<StockDataMap> {
  data?: StockDataMap;
}

/**
 * Response from /api/stocks/search
 */
export interface StockSearchResponse extends ApiResponse<Stock[]> {
  data?: Stock[];
  results?: Stock[]; // Alternative field name for consistency
}

// ----------------------------------------------------------------------------
// Store Types
// ----------------------------------------------------------------------------

/**
 * Zustand store state interface
 */
export interface StockStore {
  // State
  selectedStocks: string[];
  dateRange: DateRange;
  priceType: PriceType;

  // Actions
  addStock: (symbol: string) => void;
  removeStock: (symbol: string) => void;
  setStocks: (symbols: string[]) => void;
  setDateRange: (range: DateRange) => void;
  setPriceType: (type: PriceType) => void;
  clearStocks: () => void;

  // Computed
  canAddStock: () => boolean;
  hasStocks: () => boolean;
}

// ----------------------------------------------------------------------------
// Hook Return Types
// ----------------------------------------------------------------------------

/**
 * Return type for useStockData hook
 */
export interface UseStockDataReturn {
  data: StockDataMap | undefined;
  isLoading: boolean;
  error: Error | undefined;
  isValidating: boolean;
}

/**
 * Return type for useStockSearch hook
 */
export interface UseStockSearchReturn {
  results: Stock[];
  isLoading: boolean;
  error: Error | null;
}

// ----------------------------------------------------------------------------
// Component Props Types
// ----------------------------------------------------------------------------

/**
 * Props for ErrorMessage component
 */
export interface ErrorMessageProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Props for LoadingSpinner component
 */
export interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Props for EmptyState component
 */
export interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ----------------------------------------------------------------------------
// Utility Types
// ----------------------------------------------------------------------------

/**
 * Type guard to check if a value is a valid PriceType
 */
export function isPriceType(value: unknown): value is PriceType {
  return typeof value === 'string' && ['open', 'high', 'low', 'close'].includes(value);
}

/**
 * Type guard to check if a value is a valid date string (YYYY-MM-DD)
 */
export function isValidDateString(value: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(value)) return false;

  const date = new Date(value);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Type guard to check if a value is a valid stock symbol
 */
export function isValidStockSymbol(value: string): boolean {
  // US stock symbols: 1-5 uppercase letters
  const symbolRegex = /^[A-Z]{1,5}$/;
  return symbolRegex.test(value);
}
