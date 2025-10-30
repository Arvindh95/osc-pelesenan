import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime } from '../dateHelpers';

describe('dateHelpers', () => {
  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const result = formatDate('2025-10-29');
      expect(result).toBe('29/10/2025');
    });

    it('should format ISO datetime string correctly', () => {
      const result = formatDate('2025-10-29T10:30:00Z');
      expect(result).toBe('29/10/2025');
    });

    it('should return dash for null', () => {
      expect(formatDate(null)).toBe('—');
    });

    it('should return dash for undefined', () => {
      expect(formatDate(undefined)).toBe('—');
    });

    it('should return dash for empty string', () => {
      expect(formatDate('')).toBe('—');
    });

    it('should return dash for invalid date', () => {
      expect(formatDate('invalid-date')).toBe('—');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime string correctly', () => {
      const result = formatDateTime('2025-10-29T10:30:00Z');
      // Note: Result may vary based on timezone, so we check format pattern (with or without comma)
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}[, ]+\d{2}:\d{2}/);
    });

    it('should return dash for null', () => {
      expect(formatDateTime(null)).toBe('—');
    });

    it('should return dash for undefined', () => {
      expect(formatDateTime(undefined)).toBe('—');
    });

    it('should return dash for empty string', () => {
      expect(formatDateTime('')).toBe('—');
    });

    it('should return dash for invalid date', () => {
      expect(formatDateTime('invalid-date')).toBe('—');
    });
  });
});
