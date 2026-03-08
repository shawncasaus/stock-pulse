'use client';

import { useState } from 'react';
import { useStockStore } from '@/store/useStockStore';
import { format } from 'date-fns';
import { InlineError } from './ErrorMessage';

export default function DateRangePicker() {
  const { dateRange, setDateRange } = useStockStore();
  const [error, setError] = useState<string>('');

  const today = format(new Date(), 'yyyy-MM-dd');
  const twoYearsAgo = format(
    new Date(new Date().setFullYear(new Date().getFullYear() - 2)),
    'yyyy-MM-dd'
  );

  const validateAndUpdateRange = (from: string, to: string) => {
    setError('');

    const fromDate = new Date(from);
    const toDate = new Date(to);
    const todayDate = new Date(today);

    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      setError('Invalid date format');
      return;
    }

    if (fromDate > toDate) {
      setError('Start date must be before or equal to end date');
      return;
    }

    if (fromDate > todayDate || toDate > todayDate) {
      setError('Cannot select future dates');
      return;
    }

    const twoYearsAgoDate = new Date(twoYearsAgo);
    if (fromDate < twoYearsAgoDate) {
      setError('Free tier only includes 2 years of historical data. Please select dates from 2024 onwards.');
      return;
    }

    setDateRange({ from, to });
  };

  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrom = e.target.value;
    validateAndUpdateRange(newFrom, dateRange.to);
  };

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTo = e.target.value;
    validateAndUpdateRange(dateRange.from, newTo);
  };

  const setPreset = (preset: 'week' | 'month' | '3months' | '6months' | 'year') => {
    const toDate = new Date();
    const fromDate = new Date();

    switch (preset) {
      case 'week':
        fromDate.setDate(toDate.getDate() - 7);
        break;
      case 'month':
        fromDate.setMonth(toDate.getMonth() - 1);
        break;
      case '3months':
        fromDate.setMonth(toDate.getMonth() - 3);
        break;
      case '6months':
        fromDate.setMonth(toDate.getMonth() - 6);
        break;
      case 'year':
        fromDate.setFullYear(toDate.getFullYear() - 1);
        break;
    }

    const from = format(fromDate, 'yyyy-MM-dd');
    const to = format(toDate, 'yyyy-MM-dd');
    
    validateAndUpdateRange(from, to);
  };

  return (
    <div className="space-y-4">
      {/* Date Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* From Date */}
        <div>
          <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-2">
            Start Date
          </label>
          <input
            id="date-from"
            type="date"
            value={dateRange.from}
            onChange={handleFromChange}
            max={today}
            min={twoYearsAgo}
            className="
              w-full px-4 py-3 text-base border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200 hover:border-gray-400
            "
            aria-describedby={error ? 'date-error' : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>

        {/* To Date */}
        <div>
          <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-2">
            End Date
          </label>
          <input
            id="date-to"
            type="date"
            value={dateRange.to}
            onChange={handleToChange}
            max={today}
            min={dateRange.from}
            className="
              w-full px-4 py-3 text-base border border-gray-300 rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200 hover:border-gray-400
            "
            aria-describedby={error ? 'date-error' : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <InlineError message={error} />
        </div>
      )}

      {/* Quick Presets */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Quick Presets
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setPreset('week')}
            className="
              px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
              hover:bg-gray-50 hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors duration-200
            "
          >
            Last Week
          </button>
          <button
            onClick={() => setPreset('month')}
            className="
              px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
              hover:bg-gray-50 hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors duration-200
            "
          >
            Last Month
          </button>
          <button
            onClick={() => setPreset('3months')}
            className="
              px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
              hover:bg-gray-50 hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors duration-200
            "
          >
            Last 3 Months
          </button>
          <button
            onClick={() => setPreset('6months')}
            className="
              px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
              hover:bg-gray-50 hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors duration-200
            "
          >
            Last 6 Months
          </button>
          <button
            onClick={() => setPreset('year')}
            className="
              px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
              hover:bg-gray-50 hover:border-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500
              transition-colors duration-200
            "
          >
            Last Year
          </button>
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-xs text-gray-500">
        Free tier includes 2 years of historical data (2024 onwards). Maximum date range: 2 years.
      </p>
    </div>
  );
}
