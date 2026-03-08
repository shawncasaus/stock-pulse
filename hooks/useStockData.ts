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
 * Only fetches when explicitly triggered via shouldFetchChart flag.
 */
export function useStockData(
  symbols: string[],
  from: string,
  to: string,
  shouldFetchChart: boolean
): UseStockDataReturn {
  const hasParams = symbols.length > 0 && from && to;
  
  const url = hasParams
    ? `/api/stocks/aggregates?symbols=${symbols.join(',')}&from=${from}&to=${to}`
    : null;

  const { data, error, isValidating } = useSWR<StockDataMap>(
    shouldFetchChart ? url : null,
    fetcher,
    {
      dedupingInterval: CACHE_TIME,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      keepPreviousData: true,
    }
  );

  return {
    data,
    isLoading: (!error && !data && shouldFetchChart && hasParams) ? true : false,
    error: error || undefined,
    isValidating,
  };
}
