import React, { useState, useRef } from 'react';
import { Requirement, LicenseDocument } from '../../types/license';
import { formatFileSize } from '../../utils/fileHelpers';
import { validateFileUpload } from '../../utils/licenseValidation';
import DocumentStatusBadge from './DocumentStatusBadge';

interface DocumentUploadSlotProps {
  requirement: Requirement;
  existingDocument?: LicenseDocument;
  onUpload: (file: File, requirementId: string) => Promise<void>;
  onDelete?: (documentId: string) => Promise<void>;
  maxFileSize: number;
  allowedTypes: string[];
  disabled?: boolean;
}

/**
 * DocumentUploadSlot Component
 * Handles single document upload with client-side validation
 * Provides exactly one upload slot per requirement
 * 
 * @param requirement - Document requirement details
 * @param existingDocument - Currently uploaded document (if any)
 * @param onUpload - Callback for file upload
 * @param onDelete - Callback for document deletion
 * @param maxFileSize - Maximum file size in bytes
 * @param allowedTypes - Array of allowed file extensions
 * @param disabled - Whether upload is disabled
 */
const DocumentUploadSlot: React.FC<DocumentUploadSlotProps> = ({
  requirement,
  existingDocument,
  onUpload,
  onDelete,
  maxFileSize,
  allowedTypes,
  disabled = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    return validateFileUpload(file, {
      maxSizeBytes: maxFileSize,
      allowedTypes: allowedTypes,
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setSuccess(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setError(null);
    setSuccess(false);
    setUploading(true);

    try {
      await onUpload(file, requirement.id);
      
      // Show success feedback
      setSuccess(true);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat naik fail. Sila cuba lagi.');
      setSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingDocument || !onDelete) return;

    try {
      setSuccess(false);
      await onDelete(existingDocument.id);
    } catch (err: any) {
      setError(err.message || 'Gagal memadam dokumen. Sila cuba lagi.');
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">
            {requirement.nama}
            {requirement.wajib && (
              <span className="text-red-600 ml-1" aria-label="Wajib">
                *
              </span>
            )}
          </h4>
          {requirement.keterangan && (
            <p className="text-sm text-gray-600 mt-1">
              {requirement.keterangan}
            </p>
          )}
        </div>
      </div>

      <div className="text-xs text-gray-500 mb-3">
        <span className="font-medium">Jenis fail:</span>{' '}
        {allowedTypes.map((t) => t.toUpperCase()).join(', ')} |{' '}
        <span className="font-medium">Saiz maksimum:</span>{' '}
        {formatFileSize(maxFileSize)}
      </div>

      {existingDocument ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {existingDocument.nama_fail}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {formatFileSize(existingDocument.saiz_bait)}
              </p>
              <div className="mt-2">
                <DocumentStatusBadge status={existingDocument.status_sah} />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label
                className={`inline-flex items-center justify-center px-3 py-1.5 border rounded-md text-sm font-medium transition-colors ${
                  uploading
                    ? 'border-blue-300 text-blue-700 bg-blue-50 cursor-not-allowed'
                    : disabled
                    ? 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                } focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}
              >
                {uploading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-1.5 h-3 w-3"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Memuat naik...
                  </>
                ) : (
                  'Ganti'
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  disabled={disabled || uploading}
                  accept={allowedTypes.map((t) => `.${t}`).join(',')}
                  aria-label={`Ganti dokumen ${requirement.nama}`}
                  aria-busy={uploading}
                />
              </label>
              {onDelete && existingDocument.status_sah === 'BelumSah' && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={disabled}
                  className="inline-flex items-center justify-center px-3 py-1.5 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`Padam dokumen ${requirement.nama}`}
                >
                  Padam
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label
            className={`inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
              uploading
                ? 'bg-blue-400 cursor-not-allowed'
                : disabled
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            } focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500`}
          >
            {uploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Memuat naik...
              </>
            ) : (
              <>
                <svg
                  className="-ml-1 mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.59L7.3 9.24a.75.75 0 00-1.1 1.02l3.25 3.5a.75.75 0 001.1 0l3.25-3.5a.75.75 0 10-1.1-1.02l-1.95 2.1V6.75z"
                    clipRule="evenodd"
                  />
                </svg>
                Muat Naik
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              className="sr-only"
              onChange={handleFileChange}
              disabled={disabled || uploading}
              accept={allowedTypes.map((t) => `.${t}`).join(',')}
              aria-label={`Muat naik dokumen ${requirement.nama}`}
              aria-busy={uploading}
            />
          </label>
        </div>
      )}

      {/* Success feedback */}
      {success && !existingDocument && (
        <div
          className="mt-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md p-2 flex items-center"
          role="status"
          aria-live="polite"
        >
          <svg
            className="h-5 w-5 text-green-500 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
              clipRule="evenodd"
            />
          </svg>
          Dokumen berjaya dimuat naik
        </div>
      )}

      {/* Error feedback */}
      {error && (
        <div
          className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 flex items-center"
          role="alert"
          aria-live="assertive"
        >
          <svg
            className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Screen reader announcements for upload status */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {uploading && `Sedang memuat naik dokumen ${requirement.nama}`}
        {success && `Dokumen ${requirement.nama} berjaya dimuat naik`}
        {error && `Ralat memuat naik dokumen ${requirement.nama}: ${error}`}
      </div>
    </div>
  );
};

export default DocumentUploadSlot;
