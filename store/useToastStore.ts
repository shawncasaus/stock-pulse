import { create } from 'zustand';

interface ToastStore {
  rateLimitWaitTime: number | null;
  showRateLimitToast: (waitTimeSeconds: number) => void;
  hideRateLimitToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  rateLimitWaitTime: null,
  
  showRateLimitToast: (waitTimeSeconds: number) => {
    set({ rateLimitWaitTime: waitTimeSeconds });
  },
  
  hideRateLimitToast: () => {
    set({ rateLimitWaitTime: null });
  },
}));
