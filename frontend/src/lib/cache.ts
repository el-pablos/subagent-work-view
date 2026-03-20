/**
 * Cache versioning utility
 *
 * Used to force clear all stores when schema changes to prevent
 * hydration errors from stale localStorage data.
 *
 * Increment CACHE_VERSION when making breaking changes to:
 * - Store schemas
 * - API response shapes
 * - localStorage key structures
 */

const CACHE_VERSION_KEY = "cacheVersion";
const CURRENT_CACHE_VERSION = "1";

interface CacheVersionCheckResult {
  shouldClear: boolean;
  previousVersion: string | null;
  currentVersion: string;
}

/**
 * Check if cache version matches. Returns true if stores should be cleared.
 */
export function checkCacheVersion(): CacheVersionCheckResult {
  const stored = localStorage.getItem(CACHE_VERSION_KEY);
  const shouldClear = stored !== CURRENT_CACHE_VERSION;

  return {
    shouldClear,
    previousVersion: stored,
    currentVersion: CURRENT_CACHE_VERSION,
  };
}

/**
 * Update stored cache version to current
 */
export function updateCacheVersion(): void {
  localStorage.setItem(CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
}

/**
 * Clear cache version (for testing/debugging)
 */
export function clearCacheVersion(): void {
  localStorage.removeItem(CACHE_VERSION_KEY);
}
