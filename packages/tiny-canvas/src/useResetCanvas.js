import { useCallback } from 'react';

/**
 * Hook that returns a function to clear all saved canvas layout state.
 */
export function useResetCanvas({ reload = false } = {}) {
  return useCallback(() => {
    try {
      localStorage.removeItem('tiny-canvas-queue');
    } catch (error) {
      console.error('Error clearing canvas state:', error);
    }
    if (reload) {
      window.location.reload();
    }
  }, [reload]);
}
