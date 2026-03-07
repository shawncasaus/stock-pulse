import type { StockDataMap, PolygonBar, ChartDataPoint, PriceType } from '@/types/stock.types';

function getPriceByType(bar: PolygonBar, priceType: PriceType): number {
  switch (priceType) {
    case 'open':
      return bar.o;
    case 'high':
      return bar.h;
    case 'low':
      return bar.l;
    case 'close':
      return bar.c;
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}

/** Transforms stock data into chart-compatible format, merging by common dates */
export function transformToChartData(
  stockDataMap: StockDataMap,
  priceType: PriceType
): ChartDataPoint[] {
  if (!stockDataMap || Object.keys(stockDataMap).length === 0) {
    return [];
  }

  const dataPointsMap = new Map<number, ChartDataPoint>();

  Object.entries(stockDataMap).forEach(([symbol, bars]) => {
    bars.forEach((bar) => {
      const timestamp = bar.t;
      const date = formatDate(timestamp);
      const price = getPriceByType(bar, priceType);

      if (!dataPointsMap.has(timestamp)) {
        dataPointsMap.set(timestamp, {
          date,
          timestamp,
        });
      }

      const dataPoint = dataPointsMap.get(timestamp)!;
      dataPoint[symbol] = price;
    });
  });

  const chartData = Array.from(dataPointsMap.values()).sort(
    (a, b) => a.timestamp - b.timestamp
  );

  return chartData;
}
