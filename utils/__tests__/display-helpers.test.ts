/**
 * @jest-environment jsdom
 */

import { displayLH, isEmptyLH, displayProductName, displayNumeric } from '../display-helpers';

describe('Display Helper Utilities', () => {
  describe('displayLH', () => {
    test('should return "N/A" for null or undefined values', () => {
      expect(displayLH(null)).toBe('N/A');
      expect(displayLH(undefined as unknown as string | null)).toBe('N/A');
    });

    test('should return "N/A" for empty string', () => {
      expect(displayLH('')).toBe('N/A');
      expect(displayLH('   ')).toBe('N/A'); // whitespace only
    });

    test('should return "N/A" for zero value', () => {
      expect(displayLH('0')).toBe('N/A');
      expect(displayLH(' 0 ')).toBe('N/A'); // zero with whitespace
    });

    test('should return trimmed value for valid LH codes', () => {
      expect(displayLH('208')).toBe('208');
      expect(displayLH('  208  ')).toBe('208'); // with whitespace
      expect(displayLH('3068866')).toBe('3068866');
      expect(displayLH('TEST123')).toBe('TEST123');
    });

    test('should handle various edge cases', () => {
      expect(displayLH('00')).toBe('00'); // Should not be treated as zero string
      expect(displayLH('0.0')).toBe('0.0'); // Decimal zero should show
      expect(displayLH('test')).toBe('test'); // Any valid string
    });
  });

  describe('isEmptyLH', () => {
    test('should return true for empty/invalid LH values', () => {
      expect(isEmptyLH(null)).toBe(true);
      expect(isEmptyLH('')).toBe(true);
      expect(isEmptyLH('0')).toBe(true);
      expect(isEmptyLH('   ')).toBe(true);
    });

    test('should return false for valid LH values', () => {
      expect(isEmptyLH('208')).toBe(false);
      expect(isEmptyLH('TEST123')).toBe(false);
      expect(isEmptyLH('  208  ')).toBe(false);
    });
  });

  describe('displayProductName', () => {
    test('should return trimmed product name for valid input', () => {
      expect(displayProductName('Test Product')).toBe('Test Product');
      expect(displayProductName('  Test Product  ')).toBe('Test Product');
    });

    test('should return fallback for empty or invalid names', () => {
      expect(displayProductName('')).toBe('Unknown Product');
      expect(displayProductName('   ')).toBe('Unknown Product');
    });
  });

  describe('displayNumeric', () => {
    test('should return string representation of numbers', () => {
      expect(displayNumeric(42)).toBe('42');
      expect(displayNumeric(0)).toBe('0');
      expect(displayNumeric(-5)).toBe('-5');
    });

    test('should return default fallback for null/undefined', () => {
      expect(displayNumeric(null)).toBe('-');
      expect(displayNumeric(undefined)).toBe('-');
    });

    test('should return custom fallback when provided', () => {
      expect(displayNumeric(null, 'N/A')).toBe('N/A');
      expect(displayNumeric(undefined, 'Missing')).toBe('Missing');
    });
  });
});