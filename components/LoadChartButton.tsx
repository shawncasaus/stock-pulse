'use client';

import { useStockStore } from '@/store/useStockStore';
import { useStockData } from '@/hooks/useStockData';

// Button to trigger chart data fetching
export default function LoadChartButton() {
  const { selectedStocks, dateRange, triggerFetch, shouldFetchChart } = useStockStore();
  
  const { isLoading } = useStockData(
    selectedStocks,
    dateRange.from,
    dateRange.to,
    shouldFetchChart
  );

  const isDisabled = selectedStocks.length === 0 || isLoading;

  const handleClick = () => {
    if (!isDisabled) {
      triggerFetch();
    }
  };

  return (
    <div className="flex items-center justify-center py-4">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-base
          transition-all duration-200 shadow-md
          ${
            isDisabled
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
          }
        `}
        aria-label={
          selectedStocks.length === 0
            ? 'Select stocks to load chart'
            : 'Load chart data'
        }
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span>
          {selectedStocks.length === 0
            ? 'Select Stocks First'
            : isLoading
            ? 'Loading...'
            : `Load Chart (${selectedStocks.length} stock${selectedStocks.length > 1 ? 's' : ''})`}
        </span>
      </button>

      {selectedStocks.length > 0 && !isLoading && (
        <p className="ml-4 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Clicking will use 1 API call (5/min limit)
          </span>
        </p>
      )}
    </div>
  );
}
