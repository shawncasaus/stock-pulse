/**
 * Application-wide constants
 * Single source of truth for configuration values used across the app
 */

export const MAX_SELECTED_STOCKS = 3;

export const DEBOUNCE_DELAY_MS = 300;

export const SWR_CACHE_TIME_MS = 5 * 60 * 1000; // 5 minutes

export const RATE_LIMIT_MAX_REQUESTS = 5;
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_BUFFER_MS = 100;

export const POLYGON_BASE_URL = 'https://api.polygon.io';

export const API_LIMITS = {
  SEARCH_DEFAULT_LIMIT: 10,
  SEARCH_MAX_LIMIT: 50,
} as const;
