import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import type { Stock, StockSearchResponse } from '@/types/stock.types';

const DEBOUNCE_DELAY = 300;

/**
 * Searches for stock tickers with debounced input.
 * Returns matching stocks from the Polygon API.
 */
export function useStockSearch(query: string) {
  const [results, setResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const debouncedQuery = useDebounce(query, DEBOUNCE_DELAY);

  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.trim().length === 0) {
      setResults([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const searchStocks = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const url = `/api/stocks/search?query=${encodeURIComponent(debouncedQuery)}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Search failed: ${response.statusText}`);
        }

        const data: StockSearchResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Search failed');
        }

        setResults(data.results || data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    searchStocks();
  }, [debouncedQuery]);

  return { results, isLoading, error };
}
