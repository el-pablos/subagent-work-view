import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useRelativeTime } from '../useRelativeTime';

describe('useRelativeTime', () => {
  it('returns a fallback placeholder for invalid timestamps', () => {
    const { result } = renderHook(() => useRelativeTime('bukan-tanggal-valid'));

    expect(result.current).toBe('—');
  });

  it('formats a valid timestamp into the current compact relative label', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'));

    const { result } = renderHook(() => useRelativeTime('2026-01-10T11:58:00Z'));

    expect(result.current).toBe('2m lalu');
  });

  it('updates the relative time when the interval elapses', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'));

    const { result } = renderHook(() => useRelativeTime('2026-01-10T11:59:56Z'));

    expect(result.current).toBe('baru saja');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('5d lalu');
  });

  it('respects a custom refresh interval before recomputing the label', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'));

    const { result } = renderHook(() => useRelativeTime('2026-01-10T11:59:56Z', 5000));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current).toBe('baru saja');

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(result.current).toBe('9d lalu');
  });
});
