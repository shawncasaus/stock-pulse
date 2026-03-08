import { NextRequest } from 'next/server';
import type { PolygonTickerSearchResponse, Stock } from '@/types/stock.types';
import { rateLimiter } from '@/lib/rateLimit';
import { createErrorResponse, createSuccessResponse } from '@/lib/apiHelpers';
import { POLYGON_BASE_URL, API_LIMITS } from '@/lib/constants';

/** Validates that the API key is configured */
function validateApiKey(): string | null {
  const apiKey = process.env.POLYGON_API_KEY;
  
  if (!apiKey) {
    return null;
  }
  
  return apiKey;
}

/** Parses and validates query parameters from the request */
function parseQueryParams(searchParams: URLSearchParams): { query: string; limit: number } | { error: string } {
  const query = searchParams.get('query');
  const limitParam = searchParams.get('limit');
  
  if (!query || query.trim().length === 0) {
    return { error: 'Query parameter is required' };
  }

  const limit = Math.min(parseInt(limitParam || API_LIMITS.SEARCH_DEFAULT_LIMIT.toString(), 10), API_LIMITS.SEARCH_MAX_LIMIT);
  if (isNaN(limit) || limit < 1) {
    return { error: `Invalid limit parameter. Must be a number between 1 and ${API_LIMITS.SEARCH_MAX_LIMIT}` };
  }

  return {
    query: query.trim(),
    limit,
  };
}

/** Builds the Polygon API URL with proper query parameters */
function buildPolygonUrl(query: string, limit: number, apiKey: string): string {
  const polygonUrl = new URL(`${POLYGON_BASE_URL}/v3/reference/tickers`);
  
  polygonUrl.searchParams.set('search', query);
  polygonUrl.searchParams.set('market', 'stocks');
  polygonUrl.searchParams.set('active', 'true');
  polygonUrl.searchParams.set('limit', limit.toString());
  polygonUrl.searchParams.set('sort', 'ticker');
  polygonUrl.searchParams.set('order', 'asc');
  polygonUrl.searchParams.set('apiKey', apiKey);
  
  return polygonUrl.toString();
}

/** Fetches ticker data from Polygon API */
async function fetchFromPolygon(url: string): Promise<PolygonTickerSearchResponse> {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Polygon API error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('RATE_LIMIT');
    }

    if (response.status === 401 || response.status === 403) {
      throw new Error('INVALID_API_KEY');
    }

    throw new Error(`Polygon API error: ${response.status} ${response.statusText}`);
  }

  const data: PolygonTickerSearchResponse = await response.json();

  if (data.status === 'ERROR') {
    throw new Error('SEARCH_FAILED');
  }

  return data;
}

/** Transforms Polygon ticker results to simplified Stock format */
function transformResults(polygonResponse: PolygonTickerSearchResponse): Stock[] {
  return (polygonResponse.results || [])
    .filter(ticker => ticker.locale === 'us' && ticker.market === 'stocks')
    .map(ticker => ({
      symbol: ticker.ticker,
      name: ticker.name,
      exchange: ticker.primary_exchange,
    }));
}

/**
 * GET /api/stocks/search
 * Search for US stock tickers by symbol or company name.
 */
export async function GET(request: NextRequest) {
  try {
    const apiKey = validateApiKey();
    if (!apiKey) {
      return createErrorResponse(
        'API key not configured. Please add POLYGON_API_KEY to .env.local',
        500
      );
    }

    const { searchParams } = new URL(request.url);
    const params = parseQueryParams(searchParams);
    
    if ('error' in params) {
      return createErrorResponse(params.error, 400);
    }

    const polygonUrl = buildPolygonUrl(params.query, params.limit, apiKey);
    
    const polygonData = await rateLimiter.executeRequest(() => 
      fetchFromPolygon(polygonUrl)
    );
    
    const results = transformResults(polygonData);
    return createSuccessResponse(
      { data: results, results },
      'public, s-maxage=3600, stale-while-revalidate=86400'
    );

  } catch (error) {
    console.error('Stock search API error:', error);
  
    if (error instanceof Error) {
      switch (error.message) {
        case 'RATE_LIMIT':
          return createErrorResponse('Rate limit exceeded. Please try again in a moment.', 429);
        
        case 'INVALID_API_KEY':
          return createErrorResponse('Invalid API key. Please check your Polygon.io API key.', 401);
        
        case 'SEARCH_FAILED':
          return createErrorResponse('Search failed. Please try a different query.', 400);
        
        default:
          return createErrorResponse(error.message, 500);
      }
    }
    
    return createErrorResponse('Internal server error', 500);
  }
}
