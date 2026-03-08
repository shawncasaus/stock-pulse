'use client';

import { useState, useRef, useEffect } from 'react';
import { useStockStore } from '@/store/useStockStore';
import { useStockSearch } from '@/hooks/useStockSearch';
import { MAX_SELECTED_STOCKS } from '@/lib/constants';
import { InlineError } from './ErrorMessage';
import { SearchEmptyState } from './EmptyState';

export default function StockSearchSelector() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { selectedStocks, addStock, removeStock, clearStocks, canAddStock } = useStockStore();
  const { results, isLoading, error } = useStockSearch(searchQuery);

  const isMaxReached = selectedStocks.length >= MAX_SELECTED_STOCKS;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isDropdownOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && results.length > 0) {
        setIsDropdownOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleSelectStock(results[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsDropdownOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectStock = (stock: { symbol: string; name: string }) => {
    if (!canAddStock()) {
      return;
    }

    if (selectedStocks.includes(stock.symbol)) {
      return;
    }

    addStock(stock.symbol);
    setSearchQuery('');
    setIsDropdownOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setIsDropdownOpen(true);
    setSelectedIndex(-1);
  };

  const handleInputFocus = () => {
    if (searchQuery && results.length > 0) {
      setIsDropdownOpen(true);
    }
  };

  const showDropdown = isDropdownOpen && searchQuery.length > 0;
  const hasResults = results.length > 0;

  return (
    <div className="space-y-4">
      {/* Search Input Section */}
      <div className="relative">
        <label htmlFor="stock-search" className="block text-sm font-medium text-gray-700 mb-2">
          Search Stocks {isMaxReached && <span className="text-red-600">(Limit reached)</span>}
        </label>

        <div className="relative">
          <input
            ref={inputRef}
            id="stock-search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            disabled={isMaxReached}
            placeholder={isMaxReached ? 'Remove a stock to add more' : 'Search stocks like AAPL, Tesla, Microsoft...'}
            className={`
              w-full px-4 py-3 pl-12 pr-10 text-base border rounded-lg
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              transition-all duration-200
              ${isMaxReached 
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300' 
                : 'bg-white border-gray-300 hover:border-gray-400'
              }
            `}
            aria-controls="search-results"
            aria-autocomplete="list"
            aria-activedescendant={selectedIndex >= 0 ? `result-${selectedIndex}` : undefined}
          />

          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Clear Button */}
          {searchQuery && !isLoading && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsDropdownOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            id="search-results"
            role="listbox"
            className="absolute z-10 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto"
          >
            {error && (
              <div className="p-4">
                <InlineError message="Error loading results. Please try again." />
              </div>
            )}

            {!error && !isLoading && !hasResults && (
              <SearchEmptyState query={searchQuery} />
            )}

            {!error && hasResults && (
              <ul className="py-1">
                {results.map((stock, index) => {
                  const isSelected = selectedStocks.includes(stock.symbol);
                  const isHighlighted = index === selectedIndex;

                  return (
                    <li
                      key={stock.symbol}
                      id={`result-${index}`}
                      role="option"
                      aria-selected={isHighlighted}
                      onClick={() => !isSelected && handleSelectStock(stock)}
                      className={`
                        px-4 py-3 cursor-pointer transition-colors
                        ${isHighlighted ? 'bg-blue-50' : 'hover:bg-gray-50'}
                        ${isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {stock.symbol}
                            {isSelected && (
                              <span className="ml-2 text-xs text-green-600">✓ Selected</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{stock.name}</div>
                          {stock.exchange && (
                            <div className="text-xs text-gray-400">{stock.exchange}</div>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Selected Stocks Chips */}
      {selectedStocks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Selected Stocks ({selectedStocks.length}/{MAX_SELECTED_STOCKS})
            </label>
            <button
              onClick={clearStocks}
              className="text-sm text-red-600 hover:text-red-700 hover:underline transition-colors"
              aria-label="Clear all stocks"
            >
              Clear all
            </button>
          </div>

          <div className="flex flex-wrap gap-2" role="list" aria-label="Selected stocks">
            {selectedStocks.map((symbol) => (
              <div
                key={symbol}
                role="listitem"
                className="
                  inline-flex items-center gap-2 px-4 py-2 
                  bg-blue-100 text-blue-800 rounded-full
                  border border-blue-200
                  transition-all duration-200 hover:bg-blue-200
                  animate-in fade-in slide-in-from-bottom-2 duration-300
                "
              >
                <span className="font-semibold text-sm">{symbol}</span>
                <button
                  onClick={() => removeStock(symbol)}
                  className="
                    hover:bg-blue-300 rounded-full p-0.5
                    transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
                  "
                  aria-label={`Remove ${symbol}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      {isMaxReached && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
          <span className="font-medium">Maximum reached:</span> You can compare up to {MAX_SELECTED_STOCKS} stocks at once. Remove one to add another.
        </p>
      )}
    </div>
  );
}
