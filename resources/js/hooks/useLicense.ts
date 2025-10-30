import { useState, useEffect } from 'react';
import { License } from '../types/license';
import apiClient from '../services/apiClient';
import { useErrorHandler } from './useErrorHandler';
import { ApiError } from '../types';

interface UseLicenseReturn {
  license: License | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and managing single license data
 * Includes comprehensive error handling for all error types
 * @param id - License application ID
 * @returns License data, loading state, error state, and refetch function
 */
export const useLicense = (id: string): UseLicenseReturn => {
  const [license, setLicense] = useState<License | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  const fetchLicense = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getLicense(id);
      setLicense(data);
    } catch (err) {
      const enhancedError = handleError(err as ApiError, {
        context: 'useLicense.fetchLicense',
        licenseId: id,
      });
      
      setError(enhancedError.userMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchLicense();
    }
  }, [id]);

  return { license, loading, error, refetch: fetchLicense };
};
