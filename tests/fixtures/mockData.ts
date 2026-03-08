import { Stock, PolygonBar, StockDataMap, ChartDataPoint } from '@/types/stock.types'

export const mockStocks: Stock[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla, Inc.',
    exchange: 'NASDAQ',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    exchange: 'NASDAQ',
  },
]

export const mockPolygonBars: PolygonBar[] = [
  {
    t: new Date('2024-01-01').getTime(),
    o: 100,
    h: 110,
    l: 95,
    c: 105,
    v: 1000000,
  },
  {
    t: new Date('2024-01-02').getTime(),
    o: 105,
    h: 115,
    l: 100,
    c: 110,
    v: 1100000,
  },
  {
    t: new Date('2024-01-03').getTime(),
    o: 110,
    h: 120,
    l: 105,
    c: 115,
    v: 1200000,
  },
]

export const mockStockDataMap: StockDataMap = {
  AAPL: mockPolygonBars,
  TSLA: [
    {
      t: new Date('2024-01-01').getTime(),
      o: 200,
      h: 220,
      l: 190,
      c: 210,
      v: 2000000,
    },
    {
      t: new Date('2024-01-02').getTime(),
      o: 210,
      h: 230,
      l: 200,
      c: 220,
      v: 2200000,
    },
    {
      t: new Date('2024-01-03').getTime(),
      o: 220,
      h: 240,
      l: 210,
      c: 230,
      v: 2400000,
    },
  ],
}

export const mockChartDataPoints: ChartDataPoint[] = [
  {
    date: '2024-01-01',
    AAPL: 105,
    TSLA: 210,
  },
  {
    date: '2024-01-02',
    AAPL: 110,
    TSLA: 220,
  },
  {
    date: '2024-01-03',
    AAPL: 115,
    TSLA: 230,
  },
]

export const mockDateRange = {
  from: '2024-01-01',
  to: '2024-01-31',
}

export const mockApiSuccessResponse = {
  success: true,
  data: mockStockDataMap,
}

export const mockApiErrorResponse = {
  success: false,
  error: 'Something went wrong',
}
