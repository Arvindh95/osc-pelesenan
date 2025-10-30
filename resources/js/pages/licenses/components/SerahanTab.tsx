import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { License, Requirement } from '../../../types/license';
import CompletenessChecklist from '../../../components/licenses/CompletenessChecklist';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { useNotification } from '../../../contexts/NotificationContext';
import apiClient from '../../../services/apiClient';
import Alert from '../../../components/shared/Alert';
import { useErrorHandler } from '../../../hooks/useErrorHandler';
import { ApiError } from '../../../types';

interface SerahanTabProps {
  license: License;
  requirements: Requirement[];
}

/**
 * SerahanTab Component
 * Displays completeness checklist and handles application submission
 * Enables submission only when all requirements are met
 */
const SerahanTab: React.FC<SerahanTabProps> = ({ license, requirements }) => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { handleError, handleValidationErrors, showErrorNotification } = useErrorHandler();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Check if application is complete
  const hasBasicInfo = !!license.jenis_lesen_id && !!license.company_id;

  const hasPremiseAddress =
    !!license.butiran_operasi?.alamat_premis?.alamat_1 &&
    !!license.butiran_operasi?.alamat_premis?.bandar &&
    !!license.butiran_operasi?.alamat_premis?.poskod &&
    !!license.butiran_operasi?.alamat_premis?.negeri;

  const requiredDocs = requirements.filter(r => r.wajib);
  const hasAllRequiredDocs = requiredDocs.every(req =>
    license.documents?.some(doc => doc.keperluan_dokumen_id === req.id)
  );

  const isComplete = hasBasicInfo && hasPremiseAddress && hasAllRequiredDocs;

  const handleSubmitClick = () => {
    setValidationErrors([]);
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setValidationErrors([]);

      await apiClient.submitLicense(license.id);

      addNotification({
        type: 'success',
        message: 'Permohonan berjaya dihantar',
      });

      // Navigate to details page
      navigate(`/licenses/${license.id}`);
    } catch (err) {
      setShowConfirmDialog(false);
      
      const enhancedError = handleError(err as ApiError, {
        context: 'SerahanTab.handleConfirmSubmit',
        licenseId: license.id,
      });

      // Handle specific error types
      if (enhancedError.status === 401) {
        navigate('/login');
      } else if (enhancedError.status === 403) {
        showErrorNotification(enhancedError);
      } else if (enhancedError.status === 422 && enhancedError.errors) {
        // Handle validation errors - extract all error messages
        const formattedErrors = handleValidationErrors(enhancedError.errors);
        const errors: string[] = [];
        Object.values(formattedErrors).forEach(error => {
          errors.push(error);
        });
        setValidationErrors(errors);
      } else {
        // Network or server errors
        addNotification({
          type: 'error',
          message: enhancedError.userMessage,
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Completeness Checklist */}
      <CompletenessChecklist license={license} requirements={requirements} />

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert
          type="error"
          message={
            <div>
              <p className="font-medium mb-2">
                Permohonan tidak dapat dihantar kerana:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          }
        />
      )}

      {/* Submission Information */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Hantar Permohonan
        </h3>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Perhatian
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Setelah permohonan dihantar, anda tidak boleh lagi
                    mengedit maklumat atau dokumen. Pastikan semua maklumat
                    adalah betul sebelum menghantar.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="mb-2">
              Dengan menghantar permohonan ini, anda mengesahkan bahawa:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Semua maklumat yang diberikan adalah benar dan tepat</li>
              <li>Semua dokumen yang dimuat naik adalah sah dan terkini</li>
              <li>
                Anda memahami bahawa maklumat palsu boleh menyebabkan
                permohonan ditolak
              </li>
            </ul>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={handleSubmitClick}
              disabled={!isComplete || submitting}
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                  Menghantar...
                </>
              ) : (
                <>
                  <svg
                    className="-ml-1 mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                  Hantar Permohonan
                </>
              )}
            </button>
            {!isComplete && (
              <p className="mt-2 text-sm text-gray-500 text-center">
                Sila lengkapkan semua keperluan sebelum menghantar permohonan
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmSubmit}
        title="Sahkan Penghantaran"
        message={
          <div className="space-y-3">
            <p>
              Adakah anda pasti untuk menghantar permohonan ini?
            </p>
            <p className="font-medium text-gray-900">
              Setelah dihantar, anda tidak boleh lagi mengedit permohonan ini.
            </p>
          </div>
        }
        confirmText="Ya, Hantar"
        cancelText="Batal"
        confirmButtonClass="bg-green-600 hover:bg-green-700 text-white"
        isLoading={submitting}
      />
    </div>
  );
};

export default SerahanTab;
