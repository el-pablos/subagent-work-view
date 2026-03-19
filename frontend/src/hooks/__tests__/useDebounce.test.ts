import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
  it('returns the initial value before the delay elapses', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'awal', delay: 300 } },
    );

    rerender({ value: 'baru', delay: 300 });

    expect(result.current).toBe('awal');
  });

  it('updates the debounced value after the configured delay', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'awal', delay: 300 } },
    );

    rerender({ value: 'baru', delay: 300 });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe('baru');
  });

  it('cleans up the previous timer when the input changes rapidly', () => {
    vi.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'satu', delay: 300 } },
    );

    rerender({ value: 'dua', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    rerender({ value: 'tiga', delay: 300 });
    act(() => {
      vi.advanceTimersByTime(299);
    });

    expect(result.current).toBe('satu');

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(result.current).toBe('tiga');
  });
});
