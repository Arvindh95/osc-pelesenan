import { useState } from 'react';
import apiClient from '../services/apiClient';
import { validateFileUpload } from '../utils/licenseValidation';

interface UseFileUploadOptions {
  maxFileSize: number;
  allowedTypes: string[];
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseFileUploadReturn {
  upload: (
    licenseId: string,
    file: File,
    requirementId: string
  ) => Promise<void>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

/**
 * Custom hook for handling file upload with validation and progress tracking
 * @param options - Configuration options including file size limits and allowed types
 * @returns Upload function, uploading state, progress, and error state
 */
export const useFileUpload = (
  options: UseFileUploadOptions
): UseFileUploadReturn => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  /**
   * Validate file before upload
   * @param file - File to validate
   * @returns Error message if validation fails, null if valid
   */
  const validateFile = (file: File): string | null => {
    return validateFileUpload(file, {
      maxSizeBytes: options.maxFileSize,
      allowedTypes: options.allowedTypes,
    });
  };

  /**
   * Upload file to server
   * @param licenseId - License application ID
   * @param file - File to upload
   * @param requirementId - Document requirement ID
   */
  const upload = async (
    licenseId: string,
    file: File,
    requirementId: string
  ): Promise<void> => {
    // Validate file before upload
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      options.onError?.(validationError);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      setProgress(0);

      // Upload file
      await apiClient.uploadLicenseDocument(licenseId, file, requirementId);

      // Set progress to 100% on success
      setProgress(100);
      options.onSuccess?.();
    } catch (err: any) {
      const errorMsg = err.message || 'Gagal memuat naik fail';
      setError(errorMsg);
      options.onError?.(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, progress, error };
};
