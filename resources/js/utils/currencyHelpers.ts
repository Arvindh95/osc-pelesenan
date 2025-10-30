/**
 * Currency Helper Utilities
 * Provides functions for currency formatting in Malaysian Ringgit (MYR)
 */

/**
 * Format number to Malaysian Ringgit currency format
 * @param amount - Amount to format
 * @returns Formatted currency string (e.g., "RM 1,500.00") or "RM 0.00" if invalid
 */
export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'RM 0.00';
  }

  return `RM ${amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
