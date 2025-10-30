/**
 * Date Helper Utilities
 * Provides functions for date and datetime formatting
 */

/**
 * Format date string to Malaysian locale format (DD/MM/YYYY)
 * @param dateString - ISO date string or Date object
 * @returns Formatted date string (e.g., "29/10/2025") or "—" if invalid
 */
export const formatDate = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '—';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) return '—';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return '—';
  }
};

/**
 * Format datetime string to Malaysian locale format (DD/MM/YYYY HH:MM)
 * @param dateString - ISO datetime string or Date object
 * @returns Formatted datetime string (e.g., "29/10/2025 14:30") or "—" if invalid
 */
export const formatDateTime = (dateString: string | Date | null | undefined): string => {
  if (!dateString) return '—';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    if (isNaN(date.getTime())) return '—';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return '—';
  }
};
