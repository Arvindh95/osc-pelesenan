import React, { useState } from 'react';
import { Company, ApiError } from '../../types';

interface MyCompaniesProps {
  companies?: Company[];
  onRefresh?: () => void;
  isLoading?: boolean;
}

const MyCompanies: React.FC<MyCompaniesProps> = ({
  companies = [],
  onRefresh,
  isLoading = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      setError(null);
      try {
        await onRefresh();
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message);
      } finally {
        setRefreshing(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ms-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
            Aktif
          </span>
        );
      case 'inactive':
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
            Tidak Aktif
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
            Tidak Diketahui
          </span>
        );
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Syarikat Saya</h2>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={isLoading || refreshing}
          className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <svg
            className={`-ml-0.5 mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {refreshing ? 'Menyegar...' : 'Segar'}
        </button>
      </div>

      {/* Loading state */}
      {isLoading && companies.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-sm text-gray-600">
            Memuatkan syarikat...
          </span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
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
                Ralat Memuatkan Data
              </h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && companies.length === 0 && !error && (
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
            Tiada Syarikat Dipautkan
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Anda belum memautkan mana-mana syarikat ke akaun anda.
          </p>
          <div className="mt-4">
            <p className="text-xs text-gray-400">
              Sahkan dan pautkan syarikat menggunakan bahagian di atas.
            </p>
          </div>
        </div>
      )}

      {/* Companies list */}
      {companies.length > 0 && (
        <div className="space-y-4">
          {companies.map(company => (
            <div
              key={company.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {company.name}
                    </h3>
                    {getStatusBadge(company.status)}
                  </div>

                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Nombor SSM:</span>{' '}
                      {company.ssm_no}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Tarikh Dipautkan:</span>{' '}
                      {formatDate(company.created_at)}
                    </p>
                    {company.updated_at !== company.created_at && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Kemaskini Terakhir:</span>{' '}
                        {formatDate(company.updated_at)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0 ml-4">
                  <div className="flex items-center space-x-2">
                    {/* Company status indicator */}
                    <div
                      className={`w-3 h-3 rounded-full ${
                        company.status === 'active'
                          ? 'bg-green-400'
                          : company.status === 'inactive'
                            ? 'bg-yellow-400'
                            : 'bg-gray-400'
                      }`}
                      title={`Status: ${company.status}`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Additional company information */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>ID Syarikat: {company.id}</span>
                  {company.status === 'active' && (
                    <span className="flex items-center text-green-600">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Syarikat Aktif
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>
                Jumlah syarikat dipautkan: <strong>{companies.length}</strong>
              </span>
              <span>
                Aktif:{' '}
                <strong>
                  {companies.filter(c => c.status === 'active').length}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCompanies;
