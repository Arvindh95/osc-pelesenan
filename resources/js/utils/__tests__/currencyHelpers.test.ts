import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../currencyHelpers';

describe('currencyHelpers', () => {
  describe('formatCurrency', () => {
    it('should format zero correctly', () => {
      expect(formatCurrency(0)).toBe('RM 0.00');
    });

    it('should format positive integers correctly', () => {
      expect(formatCurrency(100)).toBe('RM 100.00');
      expect(formatCurrency(1500)).toBe('RM 1,500.00');
    });

    it('should format decimal values correctly', () => {
      expect(formatCurrency(99.99)).toBe('RM 99.99');
      expect(formatCurrency(1234.56)).toBe('RM 1,234.56');
    });

    it('should format large numbers with thousand separators', () => {
      expect(formatCurrency(1000000)).toBe('RM 1,000,000.00');
      expect(formatCurrency(50000)).toBe('RM 50,000.00');
    });

    it('should handle null values', () => {
      expect(formatCurrency(null)).toBe('RM 0.00');
    });

    it('should handle undefined values', () => {
      expect(formatCurrency(undefined)).toBe('RM 0.00');
    });

    it('should handle NaN values', () => {
      expect(formatCurrency(NaN)).toBe('RM 0.00');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(10.999)).toBe('RM 11.00');
      expect(formatCurrency(10.001)).toBe('RM 10.00');
    });
  });
});
