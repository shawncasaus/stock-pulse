import type { LoadingSpinnerProps } from '@/types/stock.types';

// Reusable loading spinner with optional text and size variants
export default function LoadingSpinner({
  text = 'Loading...',
  size = 'md',
  centered = false,
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4',
    xl: 'h-24 w-24 border-[5px]',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  const containerClasses = centered
    ? 'flex items-center justify-center min-h-[200px] w-full'
    : 'inline-flex items-center gap-3';

  return (
    <div
      className={`${containerClasses} ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className={`${sizeClasses[size]} rounded-full border-gray-200 border-t-blue-600 animate-spin`}
        aria-hidden="true"
      />
      
      {text && (
        <span className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </span>
      )}

      <span className="sr-only">{text}</span>
    </div>
  );
}

// Card-style loading state for full-page or section loading
export function LoadingCard({
  text = 'Loading...',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full p-8 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm text-gray-600 font-medium">{text}</p>
      <span className="sr-only">{text}</span>
    </div>
  );
}

// Skeleton loader with pulsing animation
export function LoadingSkeleton({
  height = 'h-20',
  width = 'w-full',
  rounded = 'rounded-lg',
  className = '',
}: {
  height?: string;
  width?: string;
  rounded?: string;
  className?: string;
}) {
  return (
    <div
      className={`${height} ${width} ${rounded} bg-gray-200 animate-pulse ${className}`}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
