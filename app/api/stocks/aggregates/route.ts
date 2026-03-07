import { NextRequest, NextResponse } from 'next/server';
import type { StockDataMap, StockDataResponse } from '@/types/stock.types';
import { rateLimiter } from '@/lib/rateLimit';
import { fetchPolygonAggregates } from '@/lib/polygonClient';

const MAX_SYMBOLS = 3;

/** Parses and validates query parameters from the request */
function parseQueryParams(searchParams: URLSearchParams): 
  | { symbols: string[]; from: string; to: string }
  | { error: string } {
  
  const symbolsParam = searchParams.get('symbols');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  if (!symbolsParam || !from || !to) {
    return { 
      error: 'Missing required parameters. Need: symbols, from, to' 
    };
  }

  const symbols = symbolsParam.split(',').map(s => s.trim()).filter(Boolean);

  if (symbols.length === 0) {
    return { error: 'At least one stock symbol is required' };
  }

  if (symbols.length > MAX_SYMBOLS) {
    return { 
      error: `Maximum ${MAX_SYMBOLS} stocks allowed. You requested ${symbols.length}.` 
    };
  }

  const symbolRegex = /^[A-Z]{1,5}$/;
  for (const symbol of symbols) {
    if (!symbolRegex.test(symbol)) {
      return { 
        error: `Invalid symbol format: '${symbol}'. Symbols must be 1-5 uppercase letters.` 
      };
    }
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(from)) {
    return { error: `'from' date must be in YYYY-MM-DD format. Got: ${from}` };
  }
  if (!dateRegex.test(to)) {
    return { error: `'to' date must be in YYYY-MM-DD format. Got: ${to}` };
  }
  const fromDate = new Date(from);
  const toDate = new Date(to);

  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return { error: 'Invalid date values' };
  }

  if (fromDate > toDate) {
    return { error: `'from' date (${from}) must be before or equal to 'to' date (${to})` };
  }

  return { symbols, from, to };
}

/** Fetches data for all requested symbols with rate limiting */
async function fetchStockData(
  symbols: string[],
  from: string,
  to: string
): Promise<StockDataMap> {
  const stockData: StockDataMap = {};

  for (const symbol of symbols) {
    const data = await rateLimiter.executeRequest(() =>
      fetchPolygonAggregates(symbol, from, to)
    );
    stockData[symbol] = data;
  }

  return stockData;
}

/** Creates an error response with appropriate status code */
function createErrorResponse(error: string, status: number): NextResponse<StockDataResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
    } as StockDataResponse,
    { status }
  );
}

/** Creates a success response with stock data */
function createSuccessResponse(data: StockDataMap): NextResponse<StockDataResponse> {
  return NextResponse.json(
    {
      success: true,
      data,
    } as StockDataResponse,
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}

/**
 * GET /api/stocks/aggregates
 * Fetches daily aggregate stock data (OHLCV) for multiple symbols.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = parseQueryParams(searchParams);

    if ('error' in params) {
      return createErrorResponse(params.error, 400);
    }

    const stockData = await fetchStockData(params.symbols, params.from, params.to);
    return createSuccessResponse(stockData);

  } catch (error) {
    console.error('Aggregates API error:', error);

    if (error instanceof Error) {
      switch (error.message) {
        case 'RATE_LIMIT':
          return createErrorResponse(
            'Rate limit exceeded. Please try again in a moment.',
            429
          );

        case 'INVALID_API_KEY':
          return createErrorResponse(
            'Invalid API key. Please check your Polygon.io API key configuration.',
            401
          );

        default:
          if (error.message.includes('NOT_AUTHORIZED')) {
            return createErrorResponse(
              'Date range not available with your current plan. Free tier includes 2 years of historical data.',
              403
            );
          }

          if (error.message.includes('not found')) {
            return createErrorResponse(error.message, 404);
          }

          if (error.message.includes('POLYGON_API_KEY is not configured')) {
            return createErrorResponse(
              'API key not configured. Please add POLYGON_API_KEY to .env.local',
              500
            );
          }

          return createErrorResponse(error.message, 500);
      }
    }

    return createErrorResponse('Internal server error', 500);
  }
}
