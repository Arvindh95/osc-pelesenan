import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFileUpload } from '../useFileUpload';
import apiClient from '../../services/apiClient';
import * as licenseValidation from '../../utils/licenseValidation';

// Mock the apiClient
vi.mock('../../services/apiClient', () => ({
  default: {
    uploadLicenseDocument: vi.fn(),
  },
}));

// Mock the validation utility
vi.mock('../../utils/licenseValidation', () => ({
  validateFileUpload: vi.fn(),
}));

describe('useFileUpload', () => {
  const defaultOptions = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  const createMockFile = (
    name: string,
    size: number,
    type: string
  ): File => {
    const blob = new Blob(['a'.repeat(size)], { type });
    return new File([blob], name, { type });
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('file validation', () => {
    it('should validate file before upload', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(licenseValidation.validateFileUpload).toHaveBeenCalledWith(file, {
        maxSizeBytes: defaultOptions.maxFileSize,
        allowedTypes: defaultOptions.allowedTypes,
      });
    });

    it('should reject invalid file type', async () => {
      const errorMessage = 'Jenis fail tidak dibenarkan';
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(
        errorMessage
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.exe', 1024, 'application/x-msdownload');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe(errorMessage);
      expect(defaultOptions.onError).toHaveBeenCalledWith(errorMessage);
      expect(apiClient.uploadLicenseDocument).not.toHaveBeenCalled();
    });

    it('should reject file exceeding size limit', async () => {
      const errorMessage = 'Saiz fail melebihi had maksimum';
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(
        errorMessage
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile(
        'large.pdf',
        15 * 1024 * 1024,
        'application/pdf'
      );

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe(errorMessage);
      expect(defaultOptions.onError).toHaveBeenCalledWith(errorMessage);
      expect(apiClient.uploadLicenseDocument).not.toHaveBeenCalled();
    });

    it('should accept valid PDF file', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe(null);
      expect(apiClient.uploadLicenseDocument).toHaveBeenCalledWith(
        'license-1',
        file,
        'req-1'
      );
    });

    it('should accept valid image files', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.jpg',
        mime: 'image/jpeg',
        saiz_bait: 1024,
        url_storan: '/storage/test.jpg',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.jpg', 1024, 'image/jpeg');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe(null);
      expect(apiClient.uploadLicenseDocument).toHaveBeenCalled();
    });
  });

  describe('upload flow', () => {
    it('should upload file successfully', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      const mockDocument = {
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah' as const,
        created_at: '2025-01-01T00:00:00Z',
      };
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue(
        mockDocument
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(apiClient.uploadLicenseDocument).toHaveBeenCalledWith(
        'license-1',
        file,
        'req-1'
      );
      expect(result.current.progress).toBe(100);
      expect(result.current.error).toBe(null);
      expect(defaultOptions.onSuccess).toHaveBeenCalled();
    });

    it('should handle upload errors', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      const errorMessage = 'Upload failed';
      vi.mocked(apiClient.uploadLicenseDocument).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe(errorMessage);
      expect(defaultOptions.onError).toHaveBeenCalledWith(errorMessage);
      expect(defaultOptions.onSuccess).not.toHaveBeenCalled();
    });

    it('should handle upload errors without message', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockRejectedValue({});

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe('Gagal memuat naik fail');
      expect(defaultOptions.onError).toHaveBeenCalledWith(
        'Gagal memuat naik fail'
      );
    });
  });

  describe('uploading state', () => {
    it('should set uploading to true during upload', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(apiClient.uploadLicenseDocument).mockReturnValue(
        promise as any
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      act(() => {
        result.current.upload('license-1', file, 'req-1');
      });

      // Should be uploading
      await waitFor(() => {
        expect(result.current.uploading).toBe(true);
      });

      // Resolve the upload
      act(() => {
        resolvePromise!({
          id: 'doc-1',
          permohonan_id: 'license-1',
          keperluan_dokumen_id: 'req-1',
          nama_fail: 'test.pdf',
          mime: 'application/pdf',
          saiz_bait: 1024,
          url_storan: '/storage/test.pdf',
          status_sah: 'BelumSah',
          created_at: '2025-01-01T00:00:00Z',
        });
      });

      // Should not be uploading after completion
      await waitFor(() => {
        expect(result.current.uploading).toBe(false);
      });
    });

    it('should set uploading to false after successful upload', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.uploading).toBe(false);
    });

    it('should set uploading to false after failed upload', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockRejectedValue(
        new Error('Upload failed')
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.uploading).toBe(false);
    });

    it('should not set uploading for validation errors', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(
        'Invalid file'
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.exe', 1024, 'application/x-msdownload');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.uploading).toBe(false);
    });
  });

  describe('progress tracking', () => {
    it('should initialize progress at 0', () => {
      const { result } = renderHook(() => useFileUpload(defaultOptions));

      expect(result.current.progress).toBe(0);
    });

    it('should set progress to 0 at start of upload', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.progress).toBe(100);
    });

    it('should set progress to 100 on successful upload', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.progress).toBe(100);
    });
  });

  describe('error state', () => {
    it('should initialize error as null', () => {
      const { result } = renderHook(() => useFileUpload(defaultOptions));

      expect(result.current.error).toBe(null);
    });

    it('should clear error on successful upload', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe(null);
    });

    it('should clear previous error on new upload attempt', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);

      // First upload fails
      vi.mocked(apiClient.uploadLicenseDocument).mockRejectedValueOnce(
        new Error('First error')
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe('First error');

      // Second upload succeeds
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValueOnce({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('callback functions', () => {
    it('should call onSuccess callback on successful upload', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(defaultOptions.onSuccess).toHaveBeenCalledTimes(1);
    });

    it('should call onError callback on validation error', async () => {
      const errorMessage = 'Invalid file type';
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(
        errorMessage
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.exe', 1024, 'application/x-msdownload');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(defaultOptions.onError).toHaveBeenCalledWith(errorMessage);
    });

    it('should call onError callback on upload error', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      const errorMessage = 'Upload failed';
      vi.mocked(apiClient.uploadLicenseDocument).mockRejectedValue(
        new Error(errorMessage)
      );

      const { result } = renderHook(() => useFileUpload(defaultOptions));

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(defaultOptions.onError).toHaveBeenCalledWith(errorMessage);
    });

    it('should work without optional callbacks', async () => {
      vi.mocked(licenseValidation.validateFileUpload).mockReturnValue(null);
      vi.mocked(apiClient.uploadLicenseDocument).mockResolvedValue({
        id: 'doc-1',
        permohonan_id: 'license-1',
        keperluan_dokumen_id: 'req-1',
        nama_fail: 'test.pdf',
        mime: 'application/pdf',
        saiz_bait: 1024,
        url_storan: '/storage/test.pdf',
        status_sah: 'BelumSah',
        created_at: '2025-01-01T00:00:00Z',
      });

      const optionsWithoutCallbacks = {
        maxFileSize: 10 * 1024 * 1024,
        allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'],
      };

      const { result } = renderHook(() =>
        useFileUpload(optionsWithoutCallbacks)
      );

      const file = createMockFile('test.pdf', 1024, 'application/pdf');

      await act(async () => {
        await result.current.upload('license-1', file, 'req-1');
      });

      expect(result.current.error).toBe(null);
      expect(result.current.progress).toBe(100);
    });
  });
});
