import { useEffect, useRef, useState } from "react";

/**
 * Throttle function - limits execution frequency to once per specified delay
 * Returns a throttled version of the provided function
 */
export function throttle<Args extends unknown[]>(
  func: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;

  return function throttled(...args: Args) {
    const now = Date.now();
    const timeSinceLastExec = now - lastExecTime;

    if (timeSinceLastExec >= delay) {
      lastExecTime = now;
      func(...args);
    } else {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(
        () => {
          lastExecTime = Date.now();
          func(...args);
        },
        delay - timeSinceLastExec
      );
    }
  };
}

/**
 * RequestAnimationFrame-based debounce
 * Executes function on next animation frame, canceling pending frames
 * Perfect for scroll/resize handlers and animations
 */
export function rafDebounce<Args extends unknown[]>(
  func: (...args: Args) => void
): (...args: Args) => void {
  let rafId: number | null = null;

  return function debounced(...args: Args) {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
    rafId = requestAnimationFrame(() => {
      func(...args);
      rafId = null;
    });
  };
}

/**
 * React hook to measure component render time
 * Useful for identifying performance bottlenecks during development
 * 
 * @param componentName - Name to display in console
 * @param enabled - Toggle measurement (disable in production)
 * @returns Render count and average render time
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { renderCount, avgTime } = useRenderTime('MyComponent', import.meta.env.DEV);
 *   // Component logic...
 * }
 * ```
 */
export function useRenderTime(
  componentName: string,
  enabled: boolean = false
): { renderCount: number; avgTime: number } {
  const [renderCount, setRenderCount] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const totalTime = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const renderStartTime = performance.now();
    
    // Measure after render completes (next tick)
    const timeoutId = setTimeout(() => {
      const renderTime = performance.now() - renderStartTime;
      
      setRenderCount(prev => {
        const newCount = prev + 1;
        totalTime.current += renderTime;
        const newAvgTime = totalTime.current / newCount;
        setAvgTime(newAvgTime);
        
        // Log every 10 renders to avoid console spam
        if (newCount % 10 === 0) {
          console.log(
            `[Perf] ${componentName} - Renders: ${newCount}, Avg: ${newAvgTime.toFixed(2)}ms, Last: ${renderTime.toFixed(2)}ms`
          );
        }
        
        return newCount;
      });
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [enabled, componentName]);

  return { renderCount, avgTime };
}

/**
 * Preload font to avoid FOUT (Flash of Unstyled Text)
 * Call early in app initialization for critical fonts
 * 
 * @param fontFamily - Font family name
 * @param fontUrl - URL to font file (woff2 recommended)
 * @param fontWeight - Font weight (default: '400')
 * @param fontStyle - Font style (default: 'normal')
 * 
 * @example
 * ```tsx
 * // In App.tsx or main.tsx
 * useEffect(() => {
 *   preloadFont('Inter', '/fonts/inter-var.woff2', '400');
 *   preloadFont('JetBrains Mono', '/fonts/jetbrains-mono.woff2', '400');
 * }, []);
 * ```
 */
export function preloadFont(
  fontFamily: string,
  fontUrl: string,
  fontWeight: string = "400",
  fontStyle: string = "normal"
): Promise<FontFace> {
  // Check if font is already loaded
  if (document.fonts.check(`${fontWeight} 1em ${fontFamily}`)) {
    return Promise.resolve(new FontFace(fontFamily, `url(${fontUrl})`));
  }

  const fontFace = new FontFace(fontFamily, `url(${fontUrl})`, {
    weight: fontWeight,
    style: fontStyle,
  });

  return fontFace
    .load()
    .then((loadedFont) => {
      document.fonts.add(loadedFont);
      return loadedFont;
    })
    .catch((error) => {
      console.warn(`Failed to preload font ${fontFamily}:`, error);
      throw error;
    });
}

/**
 * Helper to measure async function execution time
 * Useful for profiling API calls, heavy computations
 * 
 * @param label - Label for console output
 * @param fn - Async function to measure
 * @returns Result of the function
 */
export async function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const end = performance.now();
    console.log(`[Perf] ${label}: ${(end - start).toFixed(2)}ms`);
    return result;
  } catch (error) {
    const end = performance.now();
    console.error(`[Perf] ${label} failed after ${(end - start).toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Debounce function with TypeScript support
 * Delays function execution until after delay milliseconds have elapsed
 * since the last invocation
 */
export function debounce<Args extends unknown[]>(
  func: (...args: Args) => void,
  delay: number
): (...args: Args) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Args) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = null;
    }, delay);
  };
}
