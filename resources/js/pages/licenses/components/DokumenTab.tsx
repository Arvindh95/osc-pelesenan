import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { License, Requirement } from '../../../types/license';
import DocumentUploadSlot from '../../../components/licenses/DocumentUploadSlot';
import { useNotification } from '../../../contexts/NotificationContext';
import apiClient from '../../../services/apiClient';
import Alert from '../../../components/shared/Alert';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ApiError } from '../../../types';

interface DokumenTabProps {
  license: License;
  requirements: Requirement[];
  onUploadSuccess: () => Promise<void>;
}

// File upload configuration
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_FILE_TYPES = ['pdf', 'jpg', 'jpeg', 'png'];

/**
 * DokumenTab Component
 * Manages document uploads for license application
 * Provides exactly one upload slot per requirement
 */
const DokumenTab: React.FC<DokumenTabProps> = ({
  license,
  requirements,
  onUploadSuccess,
}) => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const { handleError, showErrorNotification } = useErrorHandler();
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);

  const handleUpload = async (file: File, requirementId: string) => {
    try {
      setUploadingDocId(requirementId);

      await apiClient.uploadLicenseDocument(
        license.id,
        file,
        requirementId
      );

      addNotification({
        type: 'success',
        message: 'Dokumen berjaya dimuat naik',
      });

      // Refresh license data to show uploaded document
      await onUploadSuccess();
    } catch (err) {
      const enhancedError = handleError(err as ApiError, {
        context: 'DokumenTab.handleUpload',
        licenseId: license.id,
        requirementId,
        fileName: file.name,
      });
      
      // Handle specific error types
      if (enhancedError.status === 401) {
        navigate('/login');
      } else if (enhancedError.status === 403) {
        showErrorNotification(enhancedError);
      } else if (enhancedError.status === 422) {
        // Validation error - show specific message
        addNotification({
          type: 'error',
          message: enhancedError.userMessage,
        });
      } else {
        // Network or server errors
        addNotification({
          type: 'error',
          message: enhancedError.userMessage,
        });
      }
      throw enhancedError;
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleDelete = async (documentId: string) => {
    try {
      await apiClient.deleteLicenseDocument(license.id, documentId);

      addNotification({
        type: 'success',
        message: 'Dokumen berjaya dipadam',
      });

      // Refresh license data to remove deleted document
      await onUploadSuccess();
    } catch (err) {
      const enhancedError = handleError(err as ApiError, {
        context: 'DokumenTab.handleDelete',
        licenseId: license.id,
        documentId,
      });
      
      // Handle specific error types
      if (enhancedError.status === 401) {
        navigate('/login');
      } else if (enhancedError.status === 403) {
        showErrorNotification(enhancedError);
      } else {
        // Network or server errors
        addNotification({
          type: 'error',
          message: enhancedError.userMessage,
        });
      }
      throw enhancedError;
    }
  };

  // Get existing document for a requirement
  const getExistingDocument = (requirementId: string) => {
    console.log('[DokumenTab] Finding document for requirement:', requirementId);
    console.log('[DokumenTab] Available documents:', license.documents);

    const found = license.documents?.find(
      doc => {
        console.log('[DokumenTab] Comparing:', {
          docId: doc.keperluan_dokumen_id,
          docIdType: typeof doc.keperluan_dokumen_id,
          requirementId: requirementId,
          requirementIdType: typeof requirementId,
          match: doc.keperluan_dokumen_id === requirementId,
          looseMatch: doc.keperluan_dokumen_id == requirementId,
        });
        return doc.keperluan_dokumen_id === requirementId;
      }
    );

    console.log('[DokumenTab] Found document:', found);
    return found;
  };

  // Check if there are any requirements
  if (requirements.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <Alert
          type="info"
          message="Tiada keperluan dokumen untuk jenis lesen ini"
        />
      </div>
    );
  }

  // Separate required and optional documents
  const requiredDocs = requirements.filter(r => r.wajib);
  const optionalDocs = requirements.filter(r => !r.wajib);

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-2">
        Dokumen Permohonan
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        Muat naik dokumen yang diperlukan untuk permohonan lesen anda. Setiap
        dokumen mesti dalam format PDF, JPG, JPEG, atau PNG dan tidak melebihi
        10 MB.
      </p>

      {/* Required Documents */}
      {requiredDocs.length > 0 && (
        <div className="mb-8">
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Dokumen Wajib
          </h3>
          <div className="space-y-4">
            {requiredDocs.map(requirement => (
              <DocumentUploadSlot
                key={requirement.id}
                requirement={requirement}
                existingDocument={getExistingDocument(requirement.id)}
                onUpload={handleUpload}
                onDelete={handleDelete}
                maxFileSize={MAX_FILE_SIZE}
                allowedTypes={ALLOWED_FILE_TYPES}
                disabled={uploadingDocId !== null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Optional Documents */}
      {optionalDocs.length > 0 && (
        <div>
          <h3 className="text-base font-medium text-gray-900 mb-4">
            Dokumen Pilihan
          </h3>
          <div className="space-y-4">
            {optionalDocs.map(requirement => (
              <DocumentUploadSlot
                key={requirement.id}
                requirement={requirement}
                existingDocument={getExistingDocument(requirement.id)}
                onUpload={handleUpload}
                onDelete={handleDelete}
                maxFileSize={MAX_FILE_SIZE}
                allowedTypes={ALLOWED_FILE_TYPES}
                disabled={uploadingDocId !== null}
              />
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-medium text-blue-800">
              Panduan Muat Naik Dokumen
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Pastikan dokumen jelas dan mudah dibaca</li>
                <li>Dokumen mestilah dalam format PDF, JPG, JPEG, atau PNG</li>
                <li>Saiz fail tidak boleh melebihi 10 MB</li>
                <li>
                  Anda boleh menggantikan dokumen yang telah dimuat naik dengan
                  klik butang &quot;Ganti&quot;
                </li>
                <li>
                  Dokumen yang belum disahkan boleh dipadam dengan klik butang
                  &quot;Padam&quot;
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DokumenTab;
