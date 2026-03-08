import { useState, useEffect, useMemo } from 'react';
import popularStocks from '@/data/popular-stocks.json';
import type { Stock } from '@/types/stock.types';

/**
 * Searches for stock tickers using a static list of popular US stocks.
 * Filters locally for instant results without API calls.
 */
export function useStockSearch(query: string) {
  const [results, setResults] = useState<Stock[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const allStocks = useMemo(() => popularStocks as Stock[], []);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      if (!query || query.trim().length === 0) {
        setResults([]);
        return;
      }

      const normalizedQuery = query.trim().toUpperCase();
      
      const filtered = allStocks.filter((stock) => {
        const symbolMatch = stock.symbol.toUpperCase().includes(normalizedQuery);
        const nameMatch = stock.name.toLowerCase().includes(query.trim().toLowerCase());
        return symbolMatch || nameMatch;
      });

      const sorted = filtered.sort((a, b) => {
        const aStartsWithSymbol = a.symbol.toUpperCase().startsWith(normalizedQuery);
        const bStartsWithSymbol = b.symbol.toUpperCase().startsWith(normalizedQuery);
        
        if (aStartsWithSymbol && !bStartsWithSymbol) return -1;
        if (!aStartsWithSymbol && bStartsWithSymbol) return 1;
        
        return a.symbol.localeCompare(b.symbol);
      });

      setResults(sorted.slice(0, 50));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Search failed'));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [query, allStocks]);

  return { results, isLoading, error };
}
