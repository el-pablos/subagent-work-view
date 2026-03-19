import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useRelativeTime } from '../useRelativeTime';

describe('useRelativeTime', () => {
  it('returns fallback placeholders for null timestamps', () => {
    const { result } = renderHook(() => useRelativeTime(null));

    expect(result.current).toEqual({
      relativeTime: '—',
      absoluteTime: '—',
    });
  });

  it('formats relative and absolute time for a valid timestamp', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'));

    const { result } = renderHook(() =>
      useRelativeTime('2026-01-10T11:58:00Z', { updateInterval: 1000 }),
    );

    expect(result.current.relativeTime).toBe('2 menit yang lalu');
    expect(result.current.absoluteTime).toContain('10 Jan 2026');
  });

  it('updates the relative time when the interval elapses', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'));

    const { result } = renderHook(() =>
      useRelativeTime('2026-01-10T11:59:56Z', { updateInterval: 1000 }),
    );

    expect(result.current.relativeTime).toBe('baru saja');

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.relativeTime).toBe('5 detik yang lalu');
  });

  it('does not start interval updates when disabled', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-10T12:00:00Z'));

    const { result } = renderHook(() =>
      useRelativeTime('2026-01-10T11:59:00Z', { updateInterval: 1000, enabled: false }),
    );

    act(() => {
      vi.advanceTimersByTime(10_000);
    });

    expect(result.current.relativeTime).toBe('1 menit yang lalu');
  });
});
