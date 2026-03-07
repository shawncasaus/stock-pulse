import useSWR from 'swr';
import type { StockDataMap, StockDataResponse, UseStockDataReturn } from '@/types/stock.types';

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/** Fetcher function for SWR */
async function fetcher(url: string): Promise<StockDataMap> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }

  const data: StockDataResponse = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Failed to fetch stock data');
  }

  return data.data || {};
}

/**
 * Fetches stock aggregate data using SWR with caching.
 * Only fetches when symbols array is not empty.
 */
export function useStockData(
  symbols: string[],
  from: string,
  to: string
): UseStockDataReturn {
  const shouldFetch = symbols.length > 0 && from && to;
  
  const url = shouldFetch
    ? `/api/stocks/aggregates?symbols=${symbols.join(',')}&from=${from}&to=${to}`
    : null;

  const { data, error, isValidating } = useSWR<StockDataMap>(
    url,
    fetcher,
    {
      dedupingInterval: CACHE_TIME,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
    }
  );

  return {
    data,
    isLoading: (!error && !data && shouldFetch) ? true : false,
    error: error || undefined,
    isValidating,
  };
}
