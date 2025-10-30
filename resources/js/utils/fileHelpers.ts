/**
 * File Helper Utilities
 * Provides functions for file size formatting, extension extraction, and type validation
 */

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "500 KB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Extract file extension from filename
 * @param filename - Name of the file
 * @returns File extension in lowercase (e.g., "pdf", "jpg") or empty string if no extension
 */
export const getFileExtension = (filename: string): string => {
  const parts = filename.split('.');
  if (parts.length < 2) return '';
  return parts.pop()?.toLowerCase() || '';
};

/**
 * Check if file type is allowed based on extension
 * @param filename - Name of the file
 * @param allowedTypes - Array of allowed extensions (e.g., ['pdf', 'jpg', 'png'])
 * @returns True if file type is allowed, false otherwise
 */
export const isAllowedFileType = (
  filename: string,
  allowedTypes: string[]
): boolean => {
  const extension = getFileExtension(filename);
  return allowedTypes.map(type => type.toLowerCase()).includes(extension);
};
