/**
 * Polygon.io API Client
 * Handles authentication, URL building, and error handling for Polygon API calls.
 */

import type { PolygonBar, PolygonResponse } from '@/types/stock.types';
import { validateStockSymbol, validateDates } from './validators';
import { POLYGON_BASE_URL } from './constants';

/** Gets the Polygon API key from environment variables */
function getApiKey(): string {
  const apiKey = process.env.POLYGON_API_KEY;

  if (!apiKey) {
    throw new Error('POLYGON_API_KEY is not configured. Please add it to .env.local');
  }

  return apiKey;
}

/** Builds the Polygon aggregates API URL with required parameters */
function buildAggregatesUrl(
  symbol: string,
  from: string,
  to: string,
  apiKey: string
): string {
  const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol}/range/1/day/${from}/${to}`;
  const urlWithParams = new URL(url);
  
  urlWithParams.searchParams.set('adjusted', 'true');
  urlWithParams.searchParams.set('sort', 'asc');
  urlWithParams.searchParams.set('apiKey', apiKey);

  return urlWithParams.toString();
}

/** Handles Polygon API response errors and throws appropriate error types */
function handlePolygonError(status: number, statusText: string, symbol: string): never {
  if (status === 404) {
    throw new Error(`Stock symbol '${symbol}' not found or has no data for the specified date range.`);
  }

  if (status === 429) {
    throw new Error('RATE_LIMIT');
  }

  if (status === 401 || status === 403) {
    throw new Error('INVALID_API_KEY');
  }

  throw new Error(`Polygon API error: ${status} ${statusText}`);
}

/**
 * Fetches daily aggregate (OHLCV) data for a stock symbol.
 * Validates inputs and handles Polygon API errors.
 */
export async function fetchPolygonAggregates(
  symbol: string,
  from: string,
  to: string
): Promise<PolygonBar[]> {
  const symbolValidation = validateStockSymbol(symbol);
  if (!symbolValidation.valid) {
    throw new Error(symbolValidation.error);
  }

  const dateValidation = validateDates(from, to);
  if (!dateValidation.valid) {
    throw new Error(dateValidation.error);
  }

  const apiKey = getApiKey();

  const url = buildAggregatesUrl(symbol, from, to, apiKey);

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  // Polygon returns 200 status even for some errors, so check response body
  const data: PolygonResponse = await response.json();

  // Check for authorization errors (e.g., date range outside plan)
  if (data.status === 'NOT_AUTHORIZED') {
    const errorMessage = 'message' in data ? (data as { message: string }).message : 'Data timeframe not included in your plan. Free tier: 2 years historical data only.';
    throw new Error(`NOT_AUTHORIZED: ${errorMessage}`);
  }

  // Check for other API errors
  if (data.status === 'ERROR') {
    throw new Error(`Polygon API error for ${symbol}: ${data.status}`);
  }

  // Check HTTP status code
  if (!response.ok) {
    handlePolygonError(response.status, response.statusText, symbol);
  }

  return data.results || [];
}
