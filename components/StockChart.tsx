'use client';

import { useMemo } from 'react';
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

  if (selectedStocks.length === 0) {
    return <ChartEmptyState />;
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
