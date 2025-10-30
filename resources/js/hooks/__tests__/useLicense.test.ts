import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLicense } from '../useLicense';
import apiClient from '../../services/apiClient';

// Mock the apiClient
vi.mock('../../services/apiClient', () => ({
  default: {
    getLicense: vi.fn(),
  },
}));

// Mock the useErrorHandler hook
vi.mock('../useErrorHandler', () => ({
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn((err) => ({
      userMessage: err.message || 'Gagal memuat data permohonan',
      technicalMessage: err.message,
      statusCode: err.status || 500,
    })),
  })),
}));

describe('useLicense', () => {
  const mockLicense = {
    id: 'license-1',
    user_id: 'user-1',
    company_id: 'company-1',
    jenis_lesen_id: 'jenis-1',
    jenis_lesen_nama: 'Lesen Perniagaan',
    kategori: 'Tidak Berisiko' as const,
    status: 'Draf' as const,
    tarikh_serahan: null,
    butiran_operasi: {
      alamat_premis: {
        alamat_1: 'Jalan Test',
        bandar: 'Kuala Lumpur',
        poskod: '50000',
        negeri: 'Wilayah Persekutuan',
      },
      nama_perniagaan: 'Test Business',
    },
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial fetch', () => {
    it('should fetch license data on mount', async () => {
      vi.mocked(apiClient.getLicense).mockResolvedValue(mockLicense);

      const { result } = renderHook(() => useLicense('license-1'));

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.license).toBe(null);
      expect(result.current.error).toBe(null);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.license).toEqual(mockLicense);
      expect(result.current.error).toBe(null);
      expect(apiClient.getLicense).toHaveBeenCalledWith('license-1');
      expect(apiClient.getLicense).toHaveBeenCalledTimes(1);
    });

    it('should not fetch if id is empty', async () => {
      const { result } = renderHook(() => useLicense(''));

      expect(result.current.loading).toBe(true);
      expect(apiClient.getLicense).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const mockError = {
        message: 'Network error',
        status: 500,
      };
      vi.mocked(apiClient.getLicense).mockRejectedValue(mockError);

      const { result } = renderHook(() => useLicense('license-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.license).toBe(null);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle 404 not found errors', async () => {
      const mockError = {
        message: 'License not found',
        status: 404,
      };
      vi.mocked(apiClient.getLicense).mockRejectedValue(mockError);

      const { result } = renderHook(() => useLicense('invalid-id'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.license).toBe(null);
      expect(result.current.error).toBe('License not found');
    });

    it('should handle 403 authorization errors', async () => {
      const mockError = {
        message: 'Tidak dibenarkan',
        status: 403,
      };
      vi.mocked(apiClient.getLicense).mockRejectedValue(mockError);

      const { result } = renderHook(() => useLicense('license-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.license).toBe(null);
      expect(result.current.error).toBe('Tidak dibenarkan');
    });
  });

  describe('refetch functionality', () => {
    it('should refetch license data when refetch is called', async () => {
      vi.mocked(apiClient.getLicense).mockResolvedValue(mockLicense);

      const { result } = renderHook(() => useLicense('license-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.getLicense).toHaveBeenCalledTimes(1);

      // Call refetch
      await result.current.refetch();

      expect(apiClient.getLicense).toHaveBeenCalledTimes(2);
      expect(result.current.license).toEqual(mockLicense);
    });

    it('should update loading state during refetch', async () => {
      vi.mocked(apiClient.getLicense).mockResolvedValue(mockLicense);

      const { result } = renderHook(() => useLicense('license-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Start refetch and wait for loading state to update
      await waitFor(async () => {
        await result.current.refetch();
      });

      // Should not be loading after refetch
      expect(result.current.loading).toBe(false);
    });

    it('should clear previous error on successful refetch', async () => {
      // First call fails
      vi.mocked(apiClient.getLicense).mockRejectedValueOnce({
        message: 'Network error',
        status: 500,
      });

      const { result } = renderHook(() => useLicense('license-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');

      // Second call succeeds
      vi.mocked(apiClient.getLicense).mockResolvedValueOnce(mockLicense);

      await waitFor(async () => {
        await result.current.refetch();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(null);
      });
      
      expect(result.current.license).toEqual(mockLicense);
    });
  });

  describe('loading states', () => {
    it('should set loading to true while fetching', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(apiClient.getLicense).mockReturnValue(promise as any);

      const { result } = renderHook(() => useLicense('license-1'));

      expect(result.current.loading).toBe(true);

      resolvePromise!(mockLicense);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after successful fetch', async () => {
      vi.mocked(apiClient.getLicense).mockResolvedValue(mockLicense);

      const { result } = renderHook(() => useLicense('license-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.license).toEqual(mockLicense);
    });

    it('should set loading to false after failed fetch', async () => {
      vi.mocked(apiClient.getLicense).mockRejectedValue({
        message: 'Error',
        status: 500,
      });

      const { result } = renderHook(() => useLicense('license-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('id changes', () => {
    it('should refetch when id changes', async () => {
      vi.mocked(apiClient.getLicense).mockResolvedValue(mockLicense);

      const { result, rerender } = renderHook(
        ({ id }) => useLicense(id),
        { initialProps: { id: 'license-1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.getLicense).toHaveBeenCalledWith('license-1');

      // Change id
      rerender({ id: 'license-2' });

      await waitFor(() => {
        expect(apiClient.getLicense).toHaveBeenCalledWith('license-2');
      });

      expect(apiClient.getLicense).toHaveBeenCalledTimes(2);
    });
  });
});
