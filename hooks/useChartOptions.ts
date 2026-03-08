import { useMemo } from 'react';
import type { ChartDataPoint, PriceType } from '@/types/stock.types';
import type { EChartsOption } from 'echarts';

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PRICE_TYPE_LABELS: Record<PriceType, string> = {
  open: 'Open',
  high: 'High',
  low: 'Low',
  close: 'Close',
};

/** Generates ECharts configuration from chart data and selected stocks */
export function useChartOptions(
  chartData: ChartDataPoint[],
  symbols: string[],
  priceType: PriceType
): EChartsOption {
  return useMemo(() => {
    if (!chartData || chartData.length === 0 || symbols.length === 0) {
      return {
        title: {
          text: 'Select stocks to view price data',
          left: 'center',
          top: 'middle',
          textStyle: {
            fontSize: 16,
            color: '#9ca3af',
          },
        },
      };
    }

    const dates = chartData.map(d => d.date);

    const series = symbols.map((symbol, index) => ({
      name: symbol,
      type: 'line' as const,
      data: chartData.map(d => d[symbol] || null),
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

    return {
      title: {
        text: `Stock ${PRICE_TYPE_LABELS[priceType]} Prices`,
        left: 'center',
        textStyle: {
          fontSize: 18,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: (params: any) => {
          if (!Array.isArray(params) || params.length === 0) return '';
          
          const date = params[0].axisValue;
          let content = `<div style="font-weight: 600; margin-bottom: 4px;">${date}</div>`;
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          params.forEach((param: any) => {
            if (param.value != null && typeof param.value === 'number') {
              content += `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background-color: ${param.color};"></span>
                  <span>${param.seriesName}:</span>
                  <span style="font-weight: 600;">$${param.value.toFixed(2)}</span>
                </div>
              `;
            }
          });
          
          return content;
        },
      },
      legend: {
        data: symbols,
        top: 40,
        left: 'center',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '20%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: dates,
        boundaryGap: false,
        axisLabel: {
          rotate: 45,
          formatter: (value: string) => value,
        },
      },
      yAxis: {
        type: 'value',
        name: `Price (USD)`,
        axisLabel: {
          formatter: (value: number) => `$${value.toFixed(2)}`,
        },
        scale: true,
      },
      dataZoom: [
        {
          type: 'inside',
          start: 0,
          end: 100,
        },
        {
          type: 'slider',
          start: 0,
          end: 100,
          bottom: 20,
        },
      ],
      series,
    };
  }, [chartData, symbols, priceType]);
}
