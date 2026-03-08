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
      <label className="block text-sm font-medium text-ctp-text">
        Price Type
      </label>

      <div
        role="tablist"
        aria-label="Price type selection"
        className="inline-flex rounded-lg border border-ctp-surface1 bg-ctp-surface0 p-1 shadow-md"
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
                focus:outline-none focus:ring-2 focus:ring-ctp-mauve focus:ring-offset-2 focus:ring-offset-ctp-surface0
                ${isActive
                  ? 'bg-gradient-to-br from-ctp-mauve to-ctp-blue text-ctp-base shadow-md'
                  : 'bg-transparent text-ctp-subtext0 hover:bg-ctp-surface1 hover:text-ctp-text'
                }
              `}
            >
              {type.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-ctp-overlay1">
        {PRICE_TYPES.find((t) => t.value === priceType)?.description || ''} for each trading day
      </p>
    </div>
  );
}
