/**
 * @vitest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { useResetCanvas } from './useResetCanvas.js';

const STORAGE_KEY = 'tiny-canvas-queue';

describe('useResetCanvas', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('returns a stable function reference', () => {
    const { result, rerender } = renderHook(() => useResetCanvas());
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('clears tiny-canvas-queue from localStorage when called', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([{ id: 'block-1', x: 10, y: 20 }]));
    const { result } = renderHook(() => useResetCanvas());
    act(() => result.current());
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('does not reload the page when reload is false (default)', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });
    const { result } = renderHook(() => useResetCanvas());
    act(() => result.current());
    expect(reloadSpy).not.toHaveBeenCalled();
  });

  it('reloads the page when reload option is true', () => {
    const reloadSpy = vi.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: reloadSpy },
      writable: true,
    });
    const { result } = renderHook(() => useResetCanvas({ reload: true }));
    act(() => result.current());
    expect(reloadSpy).toHaveBeenCalledTimes(1);
  });

  it('does not throw when localStorage is empty', () => {
    const { result } = renderHook(() => useResetCanvas());
    expect(() => act(() => result.current())).not.toThrow();
  });
});
