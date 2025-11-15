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
