/**
 * Tests for RescueGroups API type guards and error handling utilities
 */

import {
  RescueGroupsAPIError,
  isRescueGroupsAPIError,
  getErrorMessage,
} from '@/services/rescuegroups/types';

describe('RescueGroups types utilities', () => {
  describe('RescueGroupsAPIError', () => {
    it('should create error with message only', () => {
      const error = new RescueGroupsAPIError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('RescueGroupsAPIError');
      expect(error.statusCode).toBeUndefined();
      expect(error.errors).toBeUndefined();
    });

    it('should create error with status code', () => {
      const error = new RescueGroupsAPIError('Test error', 404);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(404);
    });

    it('should create error with field errors', () => {
      const fieldErrors = { apikey: ['Invalid API key'], search: ['Required'] };
      const error = new RescueGroupsAPIError(
        'Validation failed',
        400,
        fieldErrors
      );
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toEqual(fieldErrors);
    });
  });

  describe('isRescueGroupsAPIError', () => {
    it('should return true for RescueGroupsAPIError instance', () => {
      const error = new RescueGroupsAPIError('Test error', 500);
      expect(isRescueGroupsAPIError(error)).toBe(true);
    });

    it('should return false for standard Error', () => {
      const error = new Error('Standard error');
      expect(isRescueGroupsAPIError(error)).toBe(false);
    });

    it('should return false for non-Error objects', () => {
      expect(isRescueGroupsAPIError('string error')).toBe(false);
      expect(isRescueGroupsAPIError(null)).toBe(false);
      expect(isRescueGroupsAPIError(undefined)).toBe(false);
      expect(isRescueGroupsAPIError({ message: 'not an error' })).toBe(false);
    });
  });

  describe('getErrorMessage', () => {
    it('should return default message for null/undefined', () => {
      expect(getErrorMessage(null)).toBe('An error occurred');
      expect(getErrorMessage(undefined)).toBe('An error occurred');
    });

    it('should return standard error message', () => {
      const error = new Error('Something went wrong');
      expect(getErrorMessage(error)).toBe('Something went wrong');
    });

    it('should format RescueGroupsAPIError with status code', () => {
      const error = new RescueGroupsAPIError('API request failed', 500);
      expect(getErrorMessage(error)).toBe('API request failed (500)');
    });

    it('should format RescueGroupsAPIError with field errors', () => {
      const fieldErrors = {
        apikey: ['Invalid API key'],
        search: ['Required field'],
      };
      const error = new RescueGroupsAPIError(
        'Validation failed',
        400,
        fieldErrors
      );
      const message = getErrorMessage(error);
      expect(message).toContain('apikey: Invalid API key');
      expect(message).toContain('search: Required field');
      expect(message).toContain('Validation failed');
    });

    it('should format field errors without main message when message is generic', () => {
      const fieldErrors = { field1: ['Error 1', 'Error 2'] };
      const error = new RescueGroupsAPIError(
        'API request failed',
        400,
        fieldErrors
      );
      const message = getErrorMessage(error);
      expect(message).toBe('field1: Error 1, field1: Error 2');
    });

    it('should handle multiple field errors with multiple messages', () => {
      const fieldErrors = {
        field1: ['Error 1a', 'Error 1b'],
        field2: ['Error 2a'],
      };
      const error = new RescueGroupsAPIError(
        'Multiple errors',
        400,
        fieldErrors
      );
      const message = getErrorMessage(error);
      expect(message).toContain('field1: Error 1a');
      expect(message).toContain('field1: Error 1b');
      expect(message).toContain('field2: Error 2a');
      expect(message).toContain('Multiple errors');
    });

    it('should handle non-Error objects', () => {
      expect(getErrorMessage('string error')).toBe('string error');
      expect(getErrorMessage(123)).toBe('123');
      expect(getErrorMessage({ foo: 'bar' })).toBe('{"foo":"bar"}');
    });

    it('should handle Error without message', () => {
      const error = new Error();
      error.message = '';
      const message = getErrorMessage(error);
      expect(message).toBeTruthy();
    });
  });
});
