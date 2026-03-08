import type { LoadingSpinnerProps } from '@/types/stock.types';

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
        className={`${sizeClasses[size]} rounded-full border-transparent border-t-ctp-mauve border-r-ctp-blue border-b-ctp-sapphire animate-spin`}
        aria-hidden="true"
      />
      
      {text && (
        <span className={`${textSizeClasses[size]} font-medium text-ctp-text`}>
          {text}
        </span>
      )}

      <span className="sr-only">{text}</span>
    </div>
  );
}

export function LoadingCard({
  text = 'Loading...',
  className = '',
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={`w-full p-8 bg-ctp-surface0 rounded-lg border border-ctp-surface1 flex flex-col items-center justify-center gap-4 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-12 w-12 rounded-full border-4 border-transparent border-t-ctp-mauve border-r-ctp-blue border-b-ctp-sapphire animate-spin"
        aria-hidden="true"
      />
      <p className="text-sm font-medium text-ctp-text">{text}</p>
      <span className="sr-only">{text}</span>
    </div>
  );
}

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
      className={`${height} ${width} ${rounded} bg-ctp-surface0 animate-pulse ${className}`}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading content...</span>
    </div>
  );
}
