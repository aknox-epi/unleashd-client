import {
  isValidZipCode,
  formatZipCode,
  getBaseZipCode,
} from '../zipCodeValidation';

describe('zipCodeValidation', () => {
  describe('isValidZipCode', () => {
    it('should validate 5-digit zip codes', () => {
      expect(isValidZipCode('12345')).toBe(true);
      expect(isValidZipCode('90210')).toBe(true);
      expect(isValidZipCode('00000')).toBe(true);
    });

    it('should validate 5+4 zip codes', () => {
      expect(isValidZipCode('12345-6789')).toBe(true);
      expect(isValidZipCode('90210-1234')).toBe(true);
    });

    it('should reject invalid zip codes', () => {
      expect(isValidZipCode('1234')).toBe(false); // Too short
      expect(isValidZipCode('123456')).toBe(false); // Too long
      expect(isValidZipCode('abcde')).toBe(false); // Letters
      expect(isValidZipCode('12-456')).toBe(false); // Wrong format
      expect(isValidZipCode('')).toBe(false); // Empty
      expect(isValidZipCode('12345-67')).toBe(false); // Incomplete +4
    });

    it('should handle edge cases', () => {
      expect(isValidZipCode(' 12345 ')).toBe(true); // Spaces (trimmed)
      expect(isValidZipCode('12 345')).toBe(true); // Space in middle (removed)
      // @ts-expect-error Testing invalid input
      expect(isValidZipCode(null)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(isValidZipCode(undefined)).toBe(false);
      // @ts-expect-error Testing invalid input
      expect(isValidZipCode(12345)).toBe(false); // Number instead of string
    });
  });

  describe('formatZipCode', () => {
    it('should format 5-digit zip codes', () => {
      expect(formatZipCode('12345')).toBe('12345');
      expect(formatZipCode('90210')).toBe('90210');
    });

    it('should format 5+4 zip codes', () => {
      expect(formatZipCode('12345-6789')).toBe('12345-6789');
      expect(formatZipCode('90210-1234')).toBe('90210-1234');
    });

    it('should remove spaces and invalid characters', () => {
      expect(formatZipCode('12 345')).toBe('12345');
      expect(formatZipCode(' 12345 ')).toBe('12345');
      expect(formatZipCode('12345 6789')).toBe('12345'); // Space instead of hyphen, takes first 5
      expect(formatZipCode('12a345')).toBe('12345');
      expect(formatZipCode('12.345')).toBe('12345');
    });

    it('should truncate extra digits', () => {
      expect(formatZipCode('123456789')).toBe('12345');
      expect(formatZipCode('12345-67890')).toBe('12345-6789');
    });

    it('should handle empty input', () => {
      expect(formatZipCode('')).toBe('');
      // @ts-expect-error Testing invalid input
      expect(formatZipCode(null)).toBe('');
      // @ts-expect-error Testing invalid input
      expect(formatZipCode(undefined)).toBe('');
    });

    it('should handle partial +4 format', () => {
      expect(formatZipCode('12345-')).toBe('12345');
      expect(formatZipCode('12345-6')).toBe('12345-6');
      expect(formatZipCode('12345-67')).toBe('12345-67');
    });
  });

  describe('getBaseZipCode', () => {
    it('should extract base zip from 5-digit format', () => {
      expect(getBaseZipCode('12345')).toBe('12345');
      expect(getBaseZipCode('90210')).toBe('90210');
    });

    it('should extract base zip from 5+4 format', () => {
      expect(getBaseZipCode('12345-6789')).toBe('12345');
      expect(getBaseZipCode('90210-1234')).toBe('90210');
    });

    it('should handle formatted input', () => {
      expect(getBaseZipCode('12 345')).toBe('12345');
      expect(getBaseZipCode(' 12345-6789 ')).toBe('12345');
    });

    it('should handle empty input', () => {
      expect(getBaseZipCode('')).toBe('');
      // @ts-expect-error Testing invalid input
      expect(getBaseZipCode(null)).toBe('');
      // @ts-expect-error Testing invalid input
      expect(getBaseZipCode(undefined)).toBe('');
    });
  });
});
