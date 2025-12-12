/**
 * Environment-aware logger utility
 * Suppresses console output in test environment to reduce noise
 */

type LogLevel = 'error' | 'warn' | 'info' | 'log';

/**
 * Checks if we're in a test environment
 */
function isTestEnvironment(): boolean {
  return process.env.NODE_ENV === 'test';
}

/**
 * Generic log function that respects environment
 */
function logMessage(
  level: LogLevel,
  message: string,
  ...args: unknown[]
): void {
  if (isTestEnvironment()) {
    // Suppress logging in test environment
    return;
  }

  // Log to console in non-test environments
  switch (level) {
    case 'error':
      console.error(message, ...args);
      break;
    case 'warn':
      console.warn(message, ...args);
      break;
    case 'info':
      // eslint-disable-next-line no-console
      console.info(message, ...args);
      break;
    case 'log':
      // eslint-disable-next-line no-console
      console.log(message, ...args);
      break;
  }
}

/**
 * Logger utility with environment-aware logging
 * Automatically suppresses output in test environment
 */
export const logger = {
  /**
   * Log error messages
   * Suppressed in test environment
   */
  error: (message: string, ...args: unknown[]): void => {
    logMessage('error', message, ...args);
  },

  /**
   * Log warning messages
   * Suppressed in test environment
   */
  warn: (message: string, ...args: unknown[]): void => {
    logMessage('warn', message, ...args);
  },

  /**
   * Log info messages
   * Suppressed in test environment
   */
  info: (message: string, ...args: unknown[]): void => {
    logMessage('info', message, ...args);
  },

  /**
   * Log debug/general messages
   * Suppressed in test environment
   */
  log: (message: string, ...args: unknown[]): void => {
    logMessage('log', message, ...args);
  },
};
