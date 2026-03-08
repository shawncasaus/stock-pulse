import type { EmptyStateProps } from '@/types/stock.types';

// Reusable empty state component for displaying helpful messages
export default function EmptyState({
  title,
  message,
  icon,
  className = '',
}: EmptyStateProps) {
  return (
    <div
      className={`w-full min-h-[300px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-4 text-center p-8 ${className}`}
      role="status"
      aria-label={title}
    >
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
        {icon || (
          <svg
            className="w-8 h-8 text-gray-400"
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
        )}
      </div>

      <div className="space-y-2 max-w-md">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Specialized empty state for the chart area
export function ChartEmptyState() {
  return (
    <div
      className="w-full h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
      role="status"
      aria-label="No stocks selected"
    >
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-blue-600"
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
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Get Started
          </h3>
          <p className="text-sm text-gray-600">
            Search and select up to 3 stocks above to view their price data on an interactive chart.
          </p>
        </div>

        <div className="text-left bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
          <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">
            Quick Start
          </h4>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Search for stock symbols (e.g., AAPL, TSLA)</li>
            <li>Select stocks from the dropdown results</li>
            <li>Choose a date range and price type</li>
            <li>View the interactive chart below</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// Empty state for search results when no matches are found
export function SearchEmptyState({ query }: { query?: string }) {
  return (
    <div className="py-8 px-4 text-center">
      <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
        <svg
          className="w-6 h-6 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        No Results Found
      </h3>
      {query ? (
        <p className="text-sm text-gray-600">
          No stocks match &quot;{query}&quot;. Try a different search term.
        </p>
      ) : (
        <p className="text-sm text-gray-600">
          Try searching for a stock symbol or company name.
        </p>
      )}
    </div>
  );
}

// Empty state for when data fetch returns empty results
export function NoDataEmptyState() {
  return (
    <div className="w-full h-[400px] bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
      <div className="text-center space-y-3 max-w-md px-6">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Data Available
          </h3>
          <p className="text-sm text-gray-600">
            No trading data found for the selected date range. Try selecting different dates or stocks.
          </p>
        </div>
      </div>
    </div>
  );
}
