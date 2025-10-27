import { useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiClient from '../services/apiClient';

interface UseVerificationStatusOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onStatusChange?: (isVerified: boolean) => void;
}

export function useVerificationStatus(
  options: UseVerificationStatusOptions = {}
) {
  const { enabled = false, interval = 30000, onStatusChange } = options; // Default 30 seconds
  const { user, updateProfile } = useAuth();

  const checkVerificationStatus = useCallback(async () => {
    if (!user || !enabled) return;

    try {
      // Fetch fresh user data from API
      const response = await apiClient.request({
        method: 'GET',
        url: '/user/profile',
      });

      if (response && typeof response === 'object' && 'user' in response) {
        const freshUser = (
          response as { user: { status_verified_person: boolean } }
        ).user;

        // Check if verification status has changed
        if (freshUser.status_verified_person !== user.status_verified_person) {
          // Update the user in context
          await updateProfile({});

          // Call the callback if provided
          if (onStatusChange) {
            onStatusChange(freshUser.status_verified_person);
          }
        }
      }
    } catch (error) {
      // Silently handle errors - don't disrupt user experience
      console.warn('Failed to check verification status:', error);
    }
  }, [user, enabled, onStatusChange, updateProfile]);

  useEffect(() => {
    if (!enabled || !user) return;

    // Check immediately
    checkVerificationStatus();

    // Set up interval
    const intervalId = setInterval(checkVerificationStatus, interval);

    // Cleanup
    return () => {
      clearInterval(intervalId);
    };
  }, [checkVerificationStatus, enabled, interval, user]);

  return {
    checkStatus: checkVerificationStatus,
    isVerified: user?.status_verified_person || false,
  };
}
