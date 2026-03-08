'use client';

import { useStockStore } from '@/store/useStockStore';
import type { PriceType } from '@/types/stock.types';

const PRICE_TYPES: { value: PriceType; label: string; description: string }[] = [
  { value: 'open', label: 'Open', description: 'Opening price' },
  { value: 'high', label: 'High', description: 'Highest price' },
  { value: 'low', label: 'Low', description: 'Lowest price' },
  { value: 'close', label: 'Close', description: 'Closing price' },
];

export default function PriceTypeToggle() {
  const { priceType, setPriceType } = useStockStore();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Price Type
      </label>

      <div
        role="tablist"
        aria-label="Price type selection"
        className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm"
      >
        {PRICE_TYPES.map((type) => {
          const isActive = priceType === type.value;

          return (
            <button
              key={type.value}
              role="tab"
              aria-selected={isActive}
              aria-label={`${type.label} price - ${type.description}`}
              onClick={() => setPriceType(type.value)}
              className={`
                px-6 py-2 text-sm font-medium rounded-md
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        {PRICE_TYPES.find((t) => t.value === priceType)?.description || ''} for each trading day
      </p>
    </div>
  );
}
