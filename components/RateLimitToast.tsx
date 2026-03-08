'use client';

import { useEffect, useState } from 'react';

interface RateLimitToastProps {
  waitTimeSeconds: number;
  onClose: () => void;
}

export default function RateLimitToast({ waitTimeSeconds, onClose }: RateLimitToastProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(waitTimeSeconds);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimeout(onClose, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds, onClose]);

  return (
    <div
      className="fixed top-4 right-4 z-50 max-w-md bg-yellow-50 border-2 border-yellow-400 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-5 fade-in duration-300"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold text-yellow-900 mb-1">
            Rate Limit Reached
          </h3>
          <p className="text-sm text-yellow-800 mb-2">
            You&apos;ve reached the API limit of 5 calls per minute. Your request will execute automatically.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-yellow-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-yellow-600 transition-all duration-1000 ease-linear"
                style={{
                  width: `${((waitTimeSeconds - remainingSeconds) / waitTimeSeconds) * 100}%`
                }}
              />
            </div>
            <span className="text-sm font-bold text-yellow-900 min-w-[3ch] text-right">
              {remainingSeconds}s
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="shrink-0 text-yellow-600 hover:text-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded p-1"
          aria-label="Close notification"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
