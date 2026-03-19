import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  useIsDesktop,
  useIsMobile,
  useIsTablet,
  useMediaQuery,
} from '../useMediaQuery';

type Listener = (event: MediaQueryListEvent) => void;

function installMatchMedia(options: { initialMatches: boolean; legacy?: boolean }) {
  const listeners = new Set<Listener>();
  let matches = options.initialMatches;

  const mediaQueryList = {
    media: '(max-width: 639px)',
    matches,
    onchange: null,
    addEventListener: options.legacy ? undefined : (_event: string, listener: Listener) => listeners.add(listener),
    removeEventListener: options.legacy ? undefined : (_event: string, listener: Listener) => listeners.delete(listener),
    addListener: (listener: Listener) => listeners.add(listener),
    removeListener: (listener: Listener) => listeners.delete(listener),
    dispatchEvent: () => true,
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => mediaQueryList),
  });

  return {
    emit(next: boolean) {
      matches = next;
      mediaQueryList.matches = next;
      const event = { matches: next } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

describe('useMediaQuery', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the current match state from matchMedia', () => {
    installMatchMedia({ initialMatches: true });
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));

    expect(result.current).toBe(true);
  });

  it('reacts to modern change events from MediaQueryList', () => {
    const controller = installMatchMedia({ initialMatches: false });
    const { result } = renderHook(() => useMediaQuery('(max-width: 639px)'));

    act(() => {
      controller.emit(true);
    });

    expect(result.current).toBe(true);
  });

  it('falls back to legacy addListener support and powers helper hooks', () => {
    const controller = installMatchMedia({ initialMatches: false, legacy: true });
    const { result: mobile } = renderHook(() => useIsMobile());
    const { result: tablet } = renderHook(() => useIsTablet());
    const { result: desktop } = renderHook(() => useIsDesktop());

    expect(mobile.current).toBe(false);
    expect(tablet.current).toBe(false);
    expect(desktop.current).toBe(false);

    act(() => {
      controller.emit(true);
    });

    expect(mobile.current).toBe(true);
    expect(tablet.current).toBe(true);
    expect(desktop.current).toBe(true);
  });
});
