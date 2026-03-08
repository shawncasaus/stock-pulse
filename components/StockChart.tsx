'use client';

import { useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useStockStore } from '@/store/useStockStore';
import { useStockData } from '@/hooks/useStockData';
import { useChartOptions } from '@/hooks/useChartOptions';
import { transformToChartData } from '@/utils/dataTransform';
import type { EChartsOption } from 'echarts';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});

function ChartSkeleton() {
  return (
    <div className="w-full h-[500px] bg-gray-50 rounded-lg border border-gray-200 animate-pulse flex items-center justify-center">
      <div className="text-center space-y-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-sm text-gray-500">Loading chart...</p>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="w-full h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
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
      </div>
    </div>
  );
}

function ErrorDisplay({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="w-full h-[500px] bg-red-50 rounded-lg border border-red-200 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-6">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Unable to Load Data
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {error.message || 'An error occurred while fetching stock data.'}
          </p>
          <button
            onClick={onRetry}
            className="
              px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md
              hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              transition-colors duration-200
            "
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StockChart() {
  const { selectedStocks, dateRange, priceType } = useStockStore();
  
  const { data: stockData, isLoading, error } = useStockData(
    selectedStocks,
    dateRange.from,
    dateRange.to
  );

  const chartData = useMemo(() => {
    if (!stockData) return [];
    return transformToChartData(stockData, priceType);
  }, [stockData, priceType]);

  const chartOptions: EChartsOption = useChartOptions(
    chartData,
    selectedStocks,
    priceType
  );

  const handleRetry = () => {
    window.location.reload();
  };

  if (selectedStocks.length === 0) {
    return <EmptyState />;
  }

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="w-full">
      <ReactECharts
        option={chartOptions}
        style={{ height: '500px', width: '100%' }}
        opts={{ renderer: 'canvas' }}
        className="rounded-lg border border-gray-200 bg-white shadow-sm"
      />
    </div>
  );
}
