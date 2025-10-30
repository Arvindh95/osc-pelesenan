import { useState, useEffect } from 'react';
import { Requirement } from '../types/license';
import apiClient from '../services/apiClient';
import { useErrorHandler } from './useErrorHandler';
import { ApiError } from '../types';

interface UseLicenseRequirementsReturn {
  requirements: Requirement[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook for fetching document requirements for a license type
 * Implements caching behavior - only fetches when jenisLesenId changes
 * Includes comprehensive error handling for all error types
 * @param jenisLesenId - License type ID (null to skip fetching)
 * @returns Requirements list, loading state, and error state
 */
export const useLicenseRequirements = (
  jenisLesenId: string | null
): UseLicenseRequirementsReturn => {
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Reset requirements if no license type selected
    if (!jenisLesenId) {
      setRequirements([]);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchRequirements = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiClient.getLicenseRequirements(jenisLesenId);
        console.log('[useLicenseRequirements] Fetched requirements:', data);
        setRequirements(data);
      } catch (err) {
        const enhancedError = handleError(err as ApiError, {
          context: 'useLicenseRequirements.fetchRequirements',
          jenisLesenId,
        });
        
        setError(enhancedError.userMessage);
        setRequirements([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, [jenisLesenId]);

  return { requirements, loading, error };
};
