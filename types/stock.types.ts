export type PriceType = 'open' | 'high' | 'low' | 'close';

export interface DateRange {
  from: string;
  to: string;
}

/** Individual bar/candle data from Polygon API */
export interface PolygonBar {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
  vw?: number;
  n?: number;
}

/** Response structure from Polygon aggregates endpoint */
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

/** Ticker search result from Polygon */
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

/** Response from Polygon ticker search endpoint */
export interface PolygonTickerSearchResponse {
  results: PolygonTickerResult[];
  status: string;
  count: number;
  request_id?: string;
  next_url?: string;
}

/** Map of stock symbols to their bar data */
export interface StockDataMap {
  [symbol: string]: PolygonBar[];
}

/** Single data point for chart rendering */
export interface ChartDataPoint {
  date: string;
  timestamp: number;
  [symbol: string]: string | number;
}

/** Stock search result (simplified for UI) */
export interface Stock {
  symbol: string;
  name: string;
  exchange?: string;
}

/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  cached?: boolean;
}

/** Response from /api/stocks/aggregates */
export interface StockDataResponse extends ApiResponse<StockDataMap> {
  data?: StockDataMap;
}

/** Response from /api/stocks/search */
export interface StockSearchResponse extends ApiResponse<Stock[]> {
  data?: Stock[];
  results?: Stock[];
}

/** Zustand store state interface */
export interface StockStore {
  selectedStocks: string[];
  dateRange: DateRange;
  priceType: PriceType;
  addStock: (symbol: string) => void;
  removeStock: (symbol: string) => void;
  setStocks: (symbols: string[]) => void;
  setDateRange: (range: DateRange) => void;
  setPriceType: (type: PriceType) => void;
  clearStocks: () => void;
  canAddStock: () => boolean;
  hasStocks: () => boolean;
}

/** Return type for useStockData hook */
export interface UseStockDataReturn {
  data: StockDataMap | undefined;
  isLoading: boolean;
  error: Error | undefined;
  isValidating: boolean;
}

/** Return type for useStockSearch hook */
export interface UseStockSearchReturn {
  results: Stock[];
  isLoading: boolean;
  error: Error | null;
}
