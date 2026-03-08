/**
 * Validation utilities for stock data and API inputs
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates stock symbol format (1-5 uppercase letters)
 */
export function validateStockSymbol(symbol: string): ValidationResult {
  const symbolRegex = /^[A-Z]{1,5}$/;
  
  if (!symbolRegex.test(symbol)) {
    return {
      valid: false,
      error: `Invalid stock symbol: '${symbol}'. Must be 1-5 uppercase letters.`,
    };
  }
  
  return { valid: true };
}

/**
 * Validates multiple stock symbols
 */
export function validateStockSymbols(symbols: string[]): ValidationResult {
  for (const symbol of symbols) {
    const result = validateStockSymbol(symbol);
    if (!result.valid) {
      return result;
    }
  }
  
  return { valid: true };
}

/**
 * Validates date string format (YYYY-MM-DD)
 */
export function validateDateFormat(date: string, fieldName: string = 'date'): ValidationResult {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  
  if (!dateRegex.test(date)) {
    return {
      valid: false,
      error: `${fieldName} must be in YYYY-MM-DD format. Got: ${date}`,
    };
  }
  
  const parsedDate = new Date(date);
  if (isNaN(parsedDate.getTime())) {
    return {
      valid: false,
      error: `${fieldName} is not a valid date: ${date}`,
    };
  }
  
  return { valid: true };
}

/**
 * Validates that from date is before or equal to to date
 */
export function validateDateRange(from: string, to: string): ValidationResult {
  const fromDate = new Date(from);
  const toDate = new Date(to);
  
  if (fromDate > toDate) {
    return {
      valid: false,
      error: `Start date (${from}) must be before or equal to end date (${to})`,
    };
  }
  
  return { valid: true };
}

/**
 * Validates all date parameters (format and range)
 */
export function validateDates(from: string, to: string): ValidationResult {
  const fromValidation = validateDateFormat(from, 'from');
  if (!fromValidation.valid) {
    return fromValidation;
  }
  
  const toValidation = validateDateFormat(to, 'to');
  if (!toValidation.valid) {
    return toValidation;
  }
  
  return validateDateRange(from, to);
}
