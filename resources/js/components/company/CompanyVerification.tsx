import React, { useState } from 'react';
import { CompanyVerificationResponse, ApiError } from '../../types';
import apiClient from '../../services/apiClient';

interface CompanyVerificationProps {
  onVerificationSuccess?: (response: CompanyVerificationResponse) => void;
  onVerificationError?: (error: ApiError) => void;
}

const CompanyVerification: React.FC<CompanyVerificationProps> = ({
  onVerificationSuccess,
  onVerificationError,
}) => {
  const [ssmNo, setSsmNo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] =
    useState<CompanyVerificationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // SSM number validation - format: 123456-A or 123456789012
  const validateSSMNumber = (ssm: string): string | null => {
    const trimmedSSM = ssm.trim();

    if (!trimmedSSM) {
      return 'Nombor SSM diperlukan';
    }

    // Check for old format (6 digits + hyphen + letter) or new format (12 digits)
    const oldFormatRegex = /^\d{6}-[A-Z]$/;
    const newFormatRegex = /^\d{12}$/;

    if (!oldFormatRegex.test(trimmedSSM) && !newFormatRegex.test(trimmedSSM)) {
      return 'Format nombor SSM tidak sah. Gunakan format 123456-A atau 123456789012';
    }

    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setSsmNo(value);

    // Clear previous errors when user starts typing
    if (validationError) {
      setValidationError(null);
    }
    if (error) {
      setError(null);
    }
    if (verificationResult) {
      setVerificationResult(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input
    const validationErr = validateSSMNumber(ssmNo);
    if (validationErr) {
      setValidationError(validationErr);
      return;
    }

    setIsLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const response = await apiClient.verifyCompany(ssmNo.trim());
      setVerificationResult(response);
      onVerificationSuccess?.(response);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      onVerificationError?.(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSsmNo('');
    setVerificationResult(null);
    setError(null);
    setValidationError(null);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Pengesahan Syarikat SSM
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="ssm-no"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nombor SSM
          </label>
          <div className="flex space-x-3">
            <input
              type="text"
              id="ssm-no"
              value={ssmNo}
              onChange={handleInputChange}
              placeholder="Contoh: 123456-A atau 123456789012"
              className={`flex-1 px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                validationError ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !ssmNo.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Mengesah...' : 'Sahkan'}
            </button>
          </div>
          {validationError && (
            <p className="mt-1 text-sm text-red-600">{validationError}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Masukkan nombor SSM dalam format lama (123456-A) atau format baru
            (123456789012)
          </p>
        </div>
      </form>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Mengesahkan syarikat...
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Pengesahan Gagal
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success state */}
      {verificationResult && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-green-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-green-800">
                Syarikat Berjaya Disahkan
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>Nombor SSM:</strong>{' '}
                  {verificationResult.company.ssm_no}
                </p>
                <p>
                  <strong>Nama Syarikat:</strong>{' '}
                  {verificationResult.company.name}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`ml-1 px-2 py-1 text-xs rounded-full ${
                      verificationResult.company.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : verificationResult.company.status === 'inactive'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {verificationResult.company.status === 'active'
                      ? 'Aktif'
                      : verificationResult.company.status === 'inactive'
                        ? 'Tidak Aktif'
                        : 'Tidak Diketahui'}
                  </span>
                </p>
              </div>
              {verificationResult.message && (
                <p className="mt-2 text-sm text-green-700">
                  {verificationResult.message}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Clear button */}
      {(verificationResult || error) && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            Sahkan Syarikat Lain
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyVerification;
