import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useLicenseRequirements } from '../useLicenseRequirements';
import apiClient from '../../services/apiClient';

// Mock the apiClient
vi.mock('../../services/apiClient', () => ({
  default: {
    getLicenseRequirements: vi.fn(),
  },
}));

// Mock the useErrorHandler hook
vi.mock('../useErrorHandler', () => ({
  useErrorHandler: vi.fn(() => ({
    handleError: vi.fn((err) => ({
      userMessage: err.message || 'Gagal memuat keperluan dokumen',
      technicalMessage: err.message,
      statusCode: err.status || 500,
    })),
  })),
}));

describe('useLicenseRequirements', () => {
  const mockRequirements = [
    {
      id: 'req-1',
      jenis_lesen_id: 'jenis-1',
      nama: 'Salinan IC',
      keterangan: 'Salinan kad pengenalan pemohon',
      wajib: true,
    },
    {
      id: 'req-2',
      jenis_lesen_id: 'jenis-1',
      nama: 'Borang Permohonan',
      keterangan: 'Borang permohonan yang lengkap',
      wajib: true,
    },
    {
      id: 'req-3',
      jenis_lesen_id: 'jenis-1',
      nama: 'Pelan Tapak',
      keterangan: 'Pelan tapak premis',
      wajib: false,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial fetch', () => {
    it('should fetch requirements when jenisLesenId is provided', async () => {
      vi.mocked(apiClient.getLicenseRequirements).mockResolvedValue(
        mockRequirements
      );

      const { result } = renderHook(() => useLicenseRequirements('jenis-1'));

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.requirements).toEqual([]);
      expect(result.current.error).toBe(null);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.requirements).toEqual(mockRequirements);
      expect(result.current.error).toBe(null);
      expect(apiClient.getLicenseRequirements).toHaveBeenCalledWith('jenis-1');
      expect(apiClient.getLicenseRequirements).toHaveBeenCalledTimes(1);
    });

    it('should not fetch when jenisLesenId is null', async () => {
      const { result } = renderHook(() => useLicenseRequirements(null));

      expect(result.current.loading).toBe(false);
      expect(result.current.requirements).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(apiClient.getLicenseRequirements).not.toHaveBeenCalled();
    });

    it('should not fetch when jenisLesenId is empty string', async () => {
      const { result } = renderHook(() => useLicenseRequirements(''));

      expect(result.current.loading).toBe(false);
      expect(result.current.requirements).toEqual([]);
      expect(result.current.error).toBe(null);
      expect(apiClient.getLicenseRequirements).not.toHaveBeenCalled();
    });
  });

  describe('caching behavior', () => {
    it('should refetch when jenisLesenId changes', async () => {
      vi.mocked(apiClient.getLicenseRequirements).mockResolvedValue(
        mockRequirements
      );

      const { result, rerender } = renderHook(
        ({ id }) => useLicenseRequirements(id),
        { initialProps: { id: 'jenis-1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.getLicenseRequirements).toHaveBeenCalledWith('jenis-1');
      expect(apiClient.getLicenseRequirements).toHaveBeenCalledTimes(1);

      // Change jenisLesenId
      const newRequirements = [mockRequirements[0]];
      vi.mocked(apiClient.getLicenseRequirements).mockResolvedValue(
        newRequirements
      );

      rerender({ id: 'jenis-2' });

      await waitFor(() => {
        expect(apiClient.getLicenseRequirements).toHaveBeenCalledWith(
          'jenis-2'
        );
      });

      expect(apiClient.getLicenseRequirements).toHaveBeenCalledTimes(2);
      expect(result.current.requirements).toEqual(newRequirements);
    });

    it('should clear requirements when jenisLesenId changes to null', async () => {
      vi.mocked(apiClient.getLicenseRequirements).mockResolvedValue(
        mockRequirements
      );

      const { result, rerender } = renderHook(
        ({ id }: { id: string | null }) => useLicenseRequirements(id),
        { initialProps: { id: 'jenis-1' as string | null } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.requirements).toEqual(mockRequirements);

      // Change to null
      rerender({ id: null });

      expect(result.current.requirements).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should not refetch if jenisLesenId remains the same', async () => {
      vi.mocked(apiClient.getLicenseRequirements).mockResolvedValue(
        mockRequirements
      );

      const { result, rerender } = renderHook(
        ({ id }) => useLicenseRequirements(id),
        { initialProps: { id: 'jenis-1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(apiClient.getLicenseRequirements).toHaveBeenCalledTimes(1);

      // Rerender with same id
      rerender({ id: 'jenis-1' });

      // Should not fetch again
      expect(apiClient.getLicenseRequirements).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      const mockError = {
        message: 'Network error',
        status: 500,
      };
      vi.mocked(apiClient.getLicenseRequirements).mockRejectedValue(mockError);

      const { result } = renderHook(() => useLicenseRequirements('jenis-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.requirements).toEqual([]);
      expect(result.current.error).toBe('Network error');
    });

    it('should handle 404 not found errors', async () => {
      const mockError = {
        message: 'License type not found',
        status: 404,
      };
      vi.mocked(apiClient.getLicenseRequirements).mockRejectedValue(mockError);

      const { result } = renderHook(() => useLicenseRequirements('invalid-id'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.requirements).toEqual([]);
      expect(result.current.error).toBe('License type not found');
    });

    it('should clear requirements on error', async () => {
      // First call succeeds
      vi.mocked(apiClient.getLicenseRequirements).mockResolvedValueOnce(
        mockRequirements
      );

      const { result, rerender } = renderHook(
        ({ id }) => useLicenseRequirements(id),
        { initialProps: { id: 'jenis-1' } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.requirements).toEqual(mockRequirements);

      // Second call fails
      vi.mocked(apiClient.getLicenseRequirements).mockRejectedValueOnce({
        message: 'Error',
        status: 500,
      });

      rerender({ id: 'jenis-2' });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.requirements).toEqual([]);
      expect(result.current.error).toBe('Error');
    });
  });

  describe('loading states', () => {
    it('should set loading to true while fetching', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      vi.mocked(apiClient.getLicenseRequirements).mockReturnValue(
        promise as any
      );

      const { result } = renderHook(() => useLicenseRequirements('jenis-1'));

      expect(result.current.loading).toBe(true);

      resolvePromise!(mockRequirements);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after successful fetch', async () => {
      vi.mocked(apiClient.getLicenseRequirements).mockResolvedValue(
        mockRequirements
      );

      const { result } = renderHook(() => useLicenseRequirements('jenis-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.requirements).toEqual(mockRequirements);
    });

    it('should set loading to false after failed fetch', async () => {
      vi.mocked(apiClient.getLicenseRequirements).mockRejectedValue({
        message: 'Error',
        status: 500,
      });

      const { result } = renderHook(() => useLicenseRequirements('jenis-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
    });

    it('should not be loading when jenisLesenId is null', () => {
      const { result } = renderHook(() => useLicenseRequirements(null));

      expect(result.current.loading).toBe(false);
    });
  });

  describe('empty results', () => {
    it('should handle empty requirements array', async () => {
      vi.mocked(apiClient.getLicenseRequirements).mockResolvedValue([]);

      const { result } = renderHook(() => useLicenseRequirements('jenis-1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.requirements).toEqual([]);
      expect(result.current.error).toBe(null);
    });
  });
});
