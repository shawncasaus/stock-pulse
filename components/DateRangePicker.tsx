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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date-from" className="block text-sm font-medium mb-2 text-ctp-text">
            Start Date
          </label>
          <input
            id="date-from"
            type="date"
            value={dateRange.from}
            onChange={handleFromChange}
            max={today}
            min={twoYearsAgo}
            className="w-full px-4 py-3 text-base bg-ctp-surface0 border border-ctp-surface1 text-ctp-text rounded-lg focus:outline-none focus:ring-2 focus:ring-ctp-mauve transition-all duration-200"
            aria-describedby={error ? 'date-error' : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>

        <div>
          <label htmlFor="date-to" className="block text-sm font-medium mb-2 text-ctp-text">
            End Date
          </label>
          <input
            id="date-to"
            type="date"
            value={dateRange.to}
            onChange={handleToChange}
            max={today}
            min={dateRange.from}
            className="w-full px-4 py-3 text-base bg-ctp-surface0 border border-ctp-surface1 text-ctp-text rounded-lg focus:outline-none focus:ring-2 focus:ring-ctp-mauve transition-all duration-200"
            aria-describedby={error ? 'date-error' : undefined}
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>
      </div>

      {error && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <InlineError message={error} />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2 text-ctp-text">
          Quick Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Last Week', value: 'week' as const },
            { label: 'Last Month', value: 'month' as const },
            { label: 'Last 3 Months', value: '3months' as const },
            { label: 'Last 6 Months', value: '6months' as const },
            { label: 'Last Year', value: 'year' as const },
          ].map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPreset(value)}
              className="px-3 py-1.5 text-sm font-medium bg-ctp-surface0 border border-ctp-surface1 text-ctp-subtext0 rounded-md focus:outline-none focus:ring-2 focus:ring-ctp-mauve transition-all duration-200 hover:opacity-80"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs text-ctp-overlay1">
        Free tier includes 2 years of historical data (2024 onwards). Maximum date range: 2 years.
      </p>
    </div>
  );
}
