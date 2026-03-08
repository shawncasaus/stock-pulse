import useSWR from 'swr';
import type { StockDataMap, StockDataResponse, UseStockDataReturn } from '@/types/stock.types';
import { useToastStore } from '@/store/useToastStore';

const CACHE_TIME = 5 * 60 * 1000; // 5 minutes

/** Fetcher function for SWR with rate limit detection */
async function fetcher(url: string): Promise<StockDataMap> {
  const response = await fetch(url);

  if (response.status === 429) {
    const rateLimitWait = response.headers.get('X-Rate-Limit-Wait');
    if (rateLimitWait) {
      const waitSeconds = parseInt(rateLimitWait, 10);
      if (waitSeconds > 0) {
        useToastStore.getState().showRateLimitToast(waitSeconds);
        
        await new Promise(resolve => setTimeout(resolve, waitSeconds * 1000));
        
        return fetcher(url);
      }
    }
  }

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
    isLoading: (shouldFetchChart && hasParams && (!data || isValidating)) ? true : false,
    error: error || undefined,
    isValidating,
  };
}
