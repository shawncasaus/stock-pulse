import { NextRequest } from 'next/server';
import type { StockDataMap } from '@/types/stock.types';
import { rateLimiter } from '@/lib/rateLimit';
import { fetchPolygonAggregates } from '@/lib/polygonClient';
import { MAX_SELECTED_STOCKS } from '@/lib/constants';
import { createErrorResponse, createSuccessResponse } from '@/lib/apiHelpers';
import { validateStockSymbols, validateDates } from '@/lib/validators';

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

  if (symbols.length > MAX_SELECTED_STOCKS) {
    return { 
      error: `Maximum ${MAX_SELECTED_STOCKS} stocks allowed. You requested ${symbols.length}.` 
    };
  }

  const symbolValidation = validateStockSymbols(symbols);
  if (!symbolValidation.valid) {
    return { error: symbolValidation.error! };
  }

  const dateValidation = validateDates(from, to);
  if (!dateValidation.valid) {
    return { error: dateValidation.error! };
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

    const waitTimeMs = rateLimiter.getTimeUntilNextSlot();
    
    if (waitTimeMs > 0) {
      const waitSeconds = Math.ceil(waitTimeMs / 1000);
      const response = createErrorResponse(
        `Rate limit reached. Request will be processed in ${waitSeconds} seconds.`,
        429
      );
      response.headers.set('X-Rate-Limit-Wait', waitSeconds.toString());
      response.headers.set('Retry-After', waitSeconds.toString());
      return response;
    }

    const stockData = await fetchStockData(params.symbols, params.from, params.to);
    
    return createSuccessResponse(
      stockData,
      'public, s-maxage=300, stale-while-revalidate=600'
    );

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
