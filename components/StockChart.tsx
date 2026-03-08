'use client';

import { useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useStockStore } from '@/store/useStockStore';
import { useStockData } from '@/hooks/useStockData';
import { useChartOptions } from '@/hooks/useChartOptions';
import { transformToChartData } from '@/utils/dataTransform';
import LoadingSpinner from './LoadingSpinner';
import { ChartEmptyState } from './EmptyState';
import { ErrorCard } from './ErrorMessage';
import type { EChartsOption } from 'echarts';

const ReactECharts = dynamic(() => import('echarts-for-react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center">
      <LoadingSpinner text="Loading chart..." size="lg" />
    </div>
  ),
});

export default function StockChart() {
  const { selectedStocks, dateRange, priceType, shouldFetchChart, resetFetch } = useStockStore();
  
  const { data: stockData, isLoading, error } = useStockData(
    selectedStocks,
    dateRange.from,
    dateRange.to,
    shouldFetchChart
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

  useEffect(() => {
    resetFetch();
  }, [selectedStocks, dateRange.from, dateRange.to, resetFetch]);

  if (selectedStocks.length === 0) {
    return <ChartEmptyState />;
  }

  if (!shouldFetchChart && !stockData) {
    return (
      <div className="w-full h-[500px] bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
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
              Ready to Load Chart
            </h3>
            <p className="text-sm text-gray-600">
              You&apos;ve selected {selectedStocks.length} stock{selectedStocks.length > 1 ? 's' : ''}.
              Click &quot;Load Chart&quot; above to fetch the data and display the chart.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center">
        <LoadingSpinner text="Loading stock data..." size="lg" centered />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorCard
        title="Unable to Load Data"
        message={error.message || 'An error occurred while fetching stock data.'}
        onRetry={() => window.location.reload()}
      />
    );
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
