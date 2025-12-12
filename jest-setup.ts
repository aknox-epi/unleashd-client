/**
 * Jest setup file for testing environment configuration
 * This file runs after the test framework is installed but before tests execute
 */

// Extend Jest matchers with React Native Testing Library matchers
import '@testing-library/jest-native/extend-expect';

// Mock global.__DEV__ for environment testing
(global as typeof globalThis & { __DEV__: boolean }).__DEV__ = true;

// Mock environment variables for testing
process.env.EXPO_PUBLIC_RESCUEGROUPS_API_KEY = 'test-api-key-12345';

// Suppress act() warnings for animations and async state updates
// These warnings are expected in tests due to Animated API timing and async context operations
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args: unknown[]) => {
  const fullMessage = args.join(' ');

  // Suppress act() warnings from Animated components
  if (
    fullMessage.includes('An update to Animated') ||
    fullMessage.includes('not wrapped in act')
  ) {
    return;
  }

  // Suppress act() warnings from ThemeContext async operations
  if (fullMessage.includes('An update to ThemeProvider')) {
    return;
  }

  // Suppress AnimatedHeight error boundary warnings (component still works correctly)
  if (
    fullMessage.includes('An error occurred in the <AnimatedHeight> component')
  ) {
    return;
  }

  originalError.call(console, ...args);
};

console.warn = (...args: unknown[]) => {
  const fullMessage = args.join(' ');

  // Suppress AnimatedHeight error boundary warnings
  if (
    fullMessage.includes('An error occurred in the <AnimatedHeight> component')
  ) {
    return;
  }

  originalWarn.call(console, ...args);
};
