/**
 * Tests for environment detection utilities
 */

import { isDevelopment, isProduction } from '@/utils/env';

describe('Environment utilities', () => {
  describe('isDevelopment', () => {
    it('should return true when __DEV__ is true', () => {
      (global as typeof globalThis & { __DEV__: boolean }).__DEV__ = true;
      expect(isDevelopment()).toBe(true);
    });

    it('should return false when __DEV__ is false', () => {
      (global as typeof globalThis & { __DEV__: boolean }).__DEV__ = false;
      expect(isDevelopment()).toBe(false);
    });
  });

  describe('isProduction', () => {
    it('should return false when __DEV__ is true', () => {
      (global as typeof globalThis & { __DEV__: boolean }).__DEV__ = true;
      expect(isProduction()).toBe(false);
    });

    it('should return true when __DEV__ is false', () => {
      (global as typeof globalThis & { __DEV__: boolean }).__DEV__ = false;
      expect(isProduction()).toBe(true);
    });
  });
});
