import { NextResponse } from 'next/server';
import type { ApiResponse } from '@/types/stock.types';

/**
 * Creates a standardized error response for API routes
 */
export function createErrorResponse<T>(
  error: string,
  status: number
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: false,
      error,
    } as ApiResponse<T>,
    { status }
  );
}

/**
 * Creates a standardized success response for API routes
 */
export function createSuccessResponse<T>(
  data: T,
  cacheControl?: string
): NextResponse<ApiResponse<T>> {
  const headers: HeadersInit = {};
  
  if (cacheControl) {
    headers['Cache-Control'] = cacheControl;
  }

  return NextResponse.json(
    {
      success: true,
      data,
    } as ApiResponse<T>,
    {
      status: 200,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
    }
  );
}
