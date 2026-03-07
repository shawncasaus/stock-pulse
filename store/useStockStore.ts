import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { StockStore, DateRange, PriceType } from '@/types/stock.types';

const MAX_STOCKS = 3;

/** Gets default date range (last year) */
function getDefaultDateRange(): DateRange {
  const to = new Date();
  const from = new Date();
  from.setFullYear(from.getFullYear() - 1);

  return {
    from: from.toISOString().split('T')[0],
    to: to.toISOString().split('T')[0],
  };
}

export const useStockStore = create<StockStore>()(
  devtools(
    (set, get) => ({
      selectedStocks: [],
      dateRange: getDefaultDateRange(),
      priceType: 'close',

      addStock: (symbol: string) => {
        const { selectedStocks } = get();
        
        if (selectedStocks.length >= MAX_STOCKS) {
          console.warn(`Cannot add more than ${MAX_STOCKS} stocks`);
          return;
        }

        if (selectedStocks.includes(symbol)) {
          console.warn(`Stock ${symbol} is already selected`);
          return;
        }

        set({ selectedStocks: [...selectedStocks, symbol] });
      },

      removeStock: (symbol: string) => {
        const { selectedStocks } = get();
        set({ selectedStocks: selectedStocks.filter(s => s !== symbol) });
      },

      setStocks: (symbols: string[]) => {
        const validSymbols = symbols.slice(0, MAX_STOCKS);
        const uniqueSymbols = Array.from(new Set(validSymbols));
        set({ selectedStocks: uniqueSymbols });
      },

      setDateRange: (range: DateRange) => {
        set({ dateRange: range });
      },

      setPriceType: (type: PriceType) => {
        set({ priceType: type });
      },

      clearStocks: () => {
        set({ selectedStocks: [] });
      },

      canAddStock: () => {
        return get().selectedStocks.length < MAX_STOCKS;
      },

      hasStocks: () => {
        return get().selectedStocks.length > 0;
      },
    }),
    { name: 'StockStore' }
  )
);
