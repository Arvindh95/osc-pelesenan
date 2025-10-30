import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layouts/AppLayout';
import FilterBar from '../../components/licenses/FilterBar';
import LicenseTable from './components/LicenseTable';
import Pagination from '../../components/shared/Pagination';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Alert from '../../components/shared/Alert';
import { License, LicenseFilters, LicenseListResponse } from '../../types/license';
import apiClient from '../../services/apiClient';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ApiError } from '../../types';

/**
 * LicensesListPage Component
 * Main page for displaying list of license applications
 * Supports filtering, pagination, and navigation to details/edit pages
 */
const LicensesListPage: React.FC = () => {
  const navigate = useNavigate();
  const { handleError, showErrorNotification } = useErrorHandler();

  // State management
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<LicenseFilters>({
    status: '',
    keyword: '',
    tarikh_dari: '',
    tarikh_hingga: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  // Fetch licenses with current filters and pagination
  const fetchLicenses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string | number> = {
        page: currentPage,
        per_page: itemsPerPage,
      };

      // Add filters if they have values
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.keyword) {
        params.keyword = filters.keyword;
      }
      if (filters.tarikh_dari) {
        params.tarikh_dari = filters.tarikh_dari;
      }
      if (filters.tarikh_hingga) {
        params.tarikh_hingga = filters.tarikh_hingga;
      }

      const response: LicenseListResponse = await apiClient.getLicenses(params);
      
      // Ensure response has expected structure
      if (response && response.data && Array.isArray(response.data)) {
        setLicenses(response.data);
        
        // Set pagination data with fallbacks
        if (response.meta) {
          setTotalPages(response.meta.last_page || 1);
          setTotalItems(response.meta.total || 0);
        } else {
          // If no meta, assume single page
          setTotalPages(1);
          setTotalItems(response.data.length);
        }
      } else {
        console.error('Invalid response structure:', response);
        setLicenses([]);
        setTotalPages(1);
        setTotalItems(0);
        setError('Format data tidak sah. Sila cuba sebentar lagi.');
      }
    } catch (err) {
      const enhancedError = handleError(err as ApiError, {
        context: 'LicensesListPage.fetchLicenses',
        filters,
        page: currentPage,
      });
      
      setError(enhancedError.userMessage);
      
      // Handle specific error types
      if (enhancedError.status === 401) {
        // Redirect to login handled by API client interceptor
        navigate('/login');
      } else if (enhancedError.status === 403) {
        showErrorNotification(enhancedError);
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, filters, handleError, showErrorNotification, navigate]);

  // Fetch licenses when filters or page changes
  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  // Handle filter changes
  const handleFilterChange = (newFilters: LicenseFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to details page
  const handleRowClick = (id: string) => {
    navigate(`/licenses/${id}`);
  };

  // Navigate to edit page
  const handleEdit = (id: string) => {
    navigate(`/licenses/${id}/edit`);
  };

  // Navigate to create page
  const handleCreateNew = () => {
    navigate('/licenses/new');
  };

  // Retry fetching on error
  const handleRetry = () => {
    fetchLicenses();
  };

  const breadcrumbs = [
    { name: 'Lesen Saya', href: '/licenses', current: true },
  ];

  return (
    <AppLayout
      title="Lesen Saya"
      breadcrumbs={breadcrumbs}
      showBreadcrumbs={true}
    >
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              Urus permohonan lesen perniagaan anda
            </p>
          </div>
          <button
            onClick={handleCreateNew}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            aria-label="Mohon lesen baharu"
          >
            <svg
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Mohon Lesen Baharu
          </button>
        </div>

        {/* Filter Bar */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" text="Memuatkan senarai permohonan..." />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <Alert
            type="error"
            className="mb-4"
            message={
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={handleRetry}
                  className="ml-4 text-sm font-medium text-red-800 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
                  aria-label="Cuba lagi"
                >
                  Cuba Lagi
                </button>
              </div>
            }
          />
        )}

        {/* Empty State */}
        {!loading && !error && licenses.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Tiada permohonan lesen
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.status || filters.keyword || filters.tarikh_dari || filters.tarikh_hingga
                ? 'Tiada permohonan yang sepadan dengan penapis anda.'
                : 'Mulakan permohonan lesen baharu untuk perniagaan anda.'}
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Mohon Lesen Baharu
              </button>
            </div>
          </div>
        )}

        {/* License Table */}
        {!loading && !error && licenses.length > 0 && (
          <>
            <LicenseTable
              licenses={licenses}
              onRowClick={handleRowClick}
              onEdit={handleEdit}
            />

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
            />
          </>
        )}
      </div>
    </AppLayout>
  );
};

export default LicensesListPage;
