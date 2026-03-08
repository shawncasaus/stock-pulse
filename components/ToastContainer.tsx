'use client';

import { useToastStore } from '@/store/useToastStore';
import RateLimitToast from './RateLimitToast';

export default function ToastContainer() {
  const { rateLimitWaitTime, hideRateLimitToast } = useToastStore();

  if (!rateLimitWaitTime) {
    return null;
  }

  return (
    <RateLimitToast
      waitTimeSeconds={rateLimitWaitTime}
      onClose={hideRateLimitToast}
    />
  );
}
