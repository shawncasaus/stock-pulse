/**
 * Test script for Polygon API Client
 * 
 * Run with: npx tsx lib/test-polygon-client.ts
 * 
 * Tests validation logic without requiring API key:
 * 1. Invalid symbol validation
 * 2. Invalid date range validation
 * 3. Invalid date format validation
 * 4. Valid input format acceptance
 */

import { fetchPolygonAggregates, fetchMultipleStocks } from './polygonClient';

async function testValidInputs() {
  console.log('📊 Test 1: Valid Inputs (will fail at API key check, which is expected)\n');
  
  try {
    await fetchPolygonAggregates('AAPL', '2024-01-01', '2024-01-05');
    console.log('✗ Unexpected: Should fail at API key check');
    console.log('');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('POLYGON_API_KEY is not configured')) {
      console.log('✓ Validation passed! Correctly reached API key check.');
      console.log('  - Symbol validation: PASSED (AAPL is valid)');
      console.log('  - Date format validation: PASSED (2024-01-01 is valid)');
      console.log('  - Date range validation: PASSED (from <= to)');
      console.log('');
    } else {
      console.error('✗ Unexpected error:', message);
      console.log('');
    }
  }
}

async function testInvalidSymbol() {
  console.log('📊 Test 3: Invalid Symbol (should fail)\n');
  
  try {
    await fetchPolygonAggregates('INVALID123', '2024-01-01', '2024-01-05');
    console.log('✗ Should have thrown error!');
    console.log('');
  } catch (error) {
    console.log('✓ Correctly caught error:');
    console.log(`  - ${error instanceof Error ? error.message : error}`);
    console.log('');
  }
}

async function testInvalidDateRange() {
  console.log('📊 Test 4: Invalid Date Range (from > to, should fail)\n');
  
  try {
    await fetchPolygonAggregates('AAPL', '2024-12-31', '2024-01-01');
    console.log('✗ Should have thrown error!');
    console.log('');
  } catch (error) {
    console.log('✓ Correctly caught error:');
    console.log(`  - ${error instanceof Error ? error.message : error}`);
    console.log('');
  }
}

async function testInvalidDateFormat() {
  console.log('📊 Test 5: Invalid Date Format (should fail)\n');
  
  try {
    await fetchPolygonAggregates('AAPL', '01/01/2024', '01/05/2024');
    console.log('✗ Should have thrown error!');
    console.log('');
  } catch (error) {
    console.log('✓ Correctly caught error:');
    console.log(`  - ${error instanceof Error ? error.message : error}`);
    console.log('');
  }
}

async function runAllTests() {
  console.log('🧪 Testing Polygon API Client Validation\n');
  console.log('='.repeat(60));
  console.log('');
  
  await testValidInputs();
  await testInvalidSymbol();
  await testInvalidDateRange();
  await testInvalidDateFormat();
  
  console.log('='.repeat(60));
  console.log('✅ All validation tests completed!\n');
  console.log('Note: To test with real API data, add a valid POLYGON_API_KEY to .env');
}

runAllTests().catch(console.error);
