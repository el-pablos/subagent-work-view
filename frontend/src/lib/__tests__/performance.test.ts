import { describe, expect, it, vi } from 'vitest';
import { debounce, measureAsync, rafDebounce, throttle } from '../performance';

describe('performance utilities', () => {
  it('throttle executes immediately and schedules the latest call within the delay window', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const throttled = throttle(spy, 100);

    throttled('first');
    throttled('second');

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenLastCalledWith('first');

    vi.advanceTimersByTime(100);

    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith('second');
  });

  it('rafDebounce keeps only the latest scheduled frame callback', () => {
    const callbacks: FrameRequestCallback[] = [];
    vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
      callbacks.push(callback);
      return callbacks.length;
    }));
    vi.stubGlobal('cancelAnimationFrame', vi.fn());

    const spy = vi.fn();
    const debounced = rafDebounce(spy);

    debounced('first');
    debounced('second');

    expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    callbacks[1](performance.now());

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('second');
  });

  it('debounce delays execution until input settles', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    const debounced = debounce(spy, 200);

    debounced('first');
    vi.advanceTimersByTime(100);
    debounced('second');
    vi.advanceTimersByTime(199);

    expect(spy).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('second');
  });

  it('measureAsync returns the wrapped result and logs the measurement label', async () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await measureAsync('fetch-data', async () => 'ok');

    expect(result).toBe('ok');
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('[Perf] fetch-data:'));
  });
});
