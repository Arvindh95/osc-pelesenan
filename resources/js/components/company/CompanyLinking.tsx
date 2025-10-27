import React, { useState } from 'react';
import { Company, CompanyLinkResponse, ApiError } from '../../types';
import apiClient from '../../services/apiClient';

interface CompanyLinkingProps {
  availableCompanies?: Company[];
  onLinkSuccess?: (response: CompanyLinkResponse) => void;
  onLinkError?: (error: ApiError) => void;
  refreshCompanies?: () => void;
}

const CompanyLinking: React.FC<CompanyLinkingProps> = ({
  availableCompanies = [],
  onLinkSuccess,
  onLinkError,
  refreshCompanies,
}) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [linkResult, setLinkResult] = useState<CompanyLinkResponse | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const selectedCompany = availableCompanies.find(
    c => c.id === selectedCompanyId
  );

  const handleCompanySelect = (companyId: number) => {
    setSelectedCompanyId(companyId);
    setError(null);
    setLinkResult(null);
  };

  const handleLinkRequest = () => {
    if (!selectedCompanyId) return;
    setShowConfirmation(true);
  };

  const handleConfirmLink = async () => {
    if (!selectedCompanyId) return;

    setIsLoading(true);
    setError(null);
    setShowConfirmation(false);

    try {
      const response = await apiClient.linkCompany(selectedCompanyId);
      setLinkResult(response);
      onLinkSuccess?.(response);
      refreshCompanies?.();

      // Reset selection after successful link
      setSelectedCompanyId(null);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message);
      onLinkError?.(apiError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelLink = () => {
    setShowConfirmation(false);
  };

  const handleClearResult = () => {
    setLinkResult(null);
    setError(null);
  };

  // Filter out companies that are already owned by someone
  const linkableCompanies = availableCompanies.filter(
    company => company.owner_user_id === null && company.status === 'active'
  );

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Pautkan Syarikat
      </h2>

      {linkableCompanies.length === 0 ? (
        <div className="text-center py-8">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h3M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Tiada Syarikat Tersedia
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Tiada syarikat yang boleh dipautkan pada masa ini. Sahkan syarikat
            terlebih dahulu.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Pilih Syarikat untuk Dipautkan
            </label>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {linkableCompanies.map(company => (
                <div
                  key={company.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedCompanyId === company.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => handleCompanySelect(company.id)}
                >
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="company"
                      value={company.id}
                      checked={selectedCompanyId === company.id}
                      onChange={() => handleCompanySelect(company.id)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">
                          {company.name}
                        </p>
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Aktif
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        SSM: {company.ssm_no}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleLinkRequest}
                disabled={!selectedCompanyId || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Pautkan Syarikat
              </button>
            </div>
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {showConfirmation && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mt-4">
                Sahkan Pautan Syarikat
              </h3>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Adakah anda pasti untuk memautkan syarikat ini ke akaun anda?
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm font-medium text-gray-900">
                    {selectedCompany.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    SSM: {selectedCompany.ssm_no}
                  </p>
                </div>
                <p className="mt-2 text-xs text-gray-400">
                  Tindakan ini tidak boleh dibatalkan.
                </p>
              </div>
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCancelLink}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLink}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {isLoading ? 'Memautkan...' : 'Ya, Pautkan'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !showConfirmation && (
        <div className="mt-4 flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">
            Memautkan syarikat...
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
              <h3 className="text-sm font-medium text-red-800">Pautan Gagal</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleClearResult}
              className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Success state */}
      {linkResult && (
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
                Syarikat Berjaya Dipautkan
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  <strong>Nama Syarikat:</strong> {linkResult.company.name}
                </p>
                <p>
                  <strong>Nombor SSM:</strong> {linkResult.company.ssm_no}
                </p>
              </div>
              {linkResult.message && (
                <p className="mt-2 text-sm text-green-700">
                  {linkResult.message}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleClearResult}
              className="text-sm text-green-600 hover:text-green-800 focus:outline-none"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyLinking;
