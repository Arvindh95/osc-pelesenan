import { describe, it, expect } from 'vitest';
import { formatFileSize, getFileExtension, isAllowedFileType } from '../fileHelpers';

describe('fileHelpers', () => {
  describe('formatFileSize', () => {
    it('should format 0 bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
      expect(formatFileSize(5242880)).toBe('5 MB');
    });

    it('should format gigabytes correctly', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });

    it('should handle decimal values correctly', () => {
      expect(formatFileSize(1536000)).toBe('1.46 MB');
    });
  });

  describe('getFileExtension', () => {
    it('should extract extension from filename', () => {
      expect(getFileExtension('document.pdf')).toBe('pdf');
      expect(getFileExtension('image.jpg')).toBe('jpg');
      expect(getFileExtension('photo.PNG')).toBe('png');
    });

    it('should handle multiple dots in filename', () => {
      expect(getFileExtension('my.document.pdf')).toBe('pdf');
    });

    it('should return empty string for files without extension', () => {
      expect(getFileExtension('README')).toBe('');
    });

    it('should return lowercase extension', () => {
      expect(getFileExtension('FILE.PDF')).toBe('pdf');
    });
  });

  describe('isAllowedFileType', () => {
    const allowedTypes = ['pdf', 'jpg', 'jpeg', 'png'];

    it('should return true for allowed file types', () => {
      expect(isAllowedFileType('document.pdf', allowedTypes)).toBe(true);
      expect(isAllowedFileType('image.jpg', allowedTypes)).toBe(true);
      expect(isAllowedFileType('photo.jpeg', allowedTypes)).toBe(true);
      expect(isAllowedFileType('picture.png', allowedTypes)).toBe(true);
    });

    it('should return false for disallowed file types', () => {
      expect(isAllowedFileType('document.docx', allowedTypes)).toBe(false);
      expect(isAllowedFileType('archive.zip', allowedTypes)).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(isAllowedFileType('IMAGE.JPG', allowedTypes)).toBe(true);
      expect(isAllowedFileType('DOCUMENT.PDF', allowedTypes)).toBe(true);
    });

    it('should return false for files without extension', () => {
      expect(isAllowedFileType('README', allowedTypes)).toBe(false);
    });
  });
});
