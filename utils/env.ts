/**
 * Environment detection utilities
 * Uses Metro bundler's __DEV__ global variable
 */

/* global __DEV__ */

/**
 * Check if running in development mode
 * @returns true if in development, false otherwise
 */
export function isDevelopment(): boolean {
  return __DEV__;
}

/**
 * Check if running in production mode
 * @returns true if in production, false otherwise
 */
export function isProduction(): boolean {
  return !__DEV__;
}
