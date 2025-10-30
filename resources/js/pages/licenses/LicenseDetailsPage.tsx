import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/layouts/AppLayout';
import Alert from '../../components/shared/Alert';
import ConfirmDialog from '../../components/shared/ConfirmDialog';
import { useLicense } from '../../hooks/useLicense';
import { useLicenseRequirements } from '../../hooks/useLicenseRequirements';
import LicenseSummaryCard from './components/LicenseSummaryCard';
import DocumentsSection from './components/DocumentsSection';
import apiClient from '../../services/apiClient';
import { useNotification } from '../../contexts/NotificationContext';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ApiError } from '../../types';

/**
 * LicenseDetailsPage Component
 * Read-only view of license application details
 * 
 * Route: /licenses/:id
 */
const LicenseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const { handleError, showErrorNotification } = useErrorHandler();

  const { license, loading, error } = useLicense(id || '');
  const { requirements } = useLicenseRequirements(license?.jenis_lesen_id || null);

  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleEditClick = () => {
    navigate(`/licenses/${id}/edit`);
  };

  const handleCancelClick = () => {
    setShowCancelDialog(true);
  };

  const handleCancelConfirm = async () => {
    if (!id) return;

    try {
      setCancelling(true);
      await apiClient.cancelLicense(id, 'Dibatalkan oleh pemohon');
      addNotification({
        type: 'success',
        message: 'Permohonan berjaya dibatalkan',
      });
      navigate('/licenses');
    } catch (err) {
      const enhancedError = handleError(err as ApiError, {
        context: 'LicenseDetailsPage.handleCancelConfirm',
        licenseId: id,
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
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  const breadcrumbItems = [
    { name: 'Lesen Saya', href: '/licenses' },
    { name: 'Butiran Permohonan', current: true },
  ];

  if (loading) {
    return (
      <AppLayout
        title="Butiran Permohonan"
        breadcrumbs={breadcrumbItems}
        showBreadcrumbs={true}
      >
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !license) {
    return (
      <AppLayout
        title="Butiran Permohonan"
        breadcrumbs={breadcrumbItems}
        showBreadcrumbs={true}
      >
        <Alert type="error" message={error || 'Gagal memuat data permohonan'} />
      </AppLayout>
    );
  }

  const isDraft = license.status === 'Draf';
  const isSubmitted = license.status === 'Diserahkan';

  return (
    <AppLayout
      title="Butiran Permohonan"
      breadcrumbs={breadcrumbItems}
      showBreadcrumbs={true}
    >

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Action Buttons */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">
              ID Permohonan: {license.id}
            </p>
          </div>

          {/* Action Buttons - Only show for draft applications */}
          {isDraft && (
            <div className="flex gap-3">
              <button
                onClick={handleEditClick}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                Edit
              </button>
              <button
                onClick={handleCancelClick}
                className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Batal Permohonan
              </button>
            </div>
          )}
        </div>

        {/* Info Banner for Submitted Applications */}
        {isSubmitted && (
          <div className="mb-6">
            <Alert
              type="info"
              message="Permohonan anda sedang dalam proses semakan PBT"
            />
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Summary Card */}
          <div>
            <LicenseSummaryCard license={license} />
          </div>

          {/* Documents Section */}
          <div>
            <DocumentsSection
              documents={license.documents}
              requirements={requirements}
            />
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showCancelDialog}
        title="Batal Permohonan"
        message="Adakah anda pasti untuk membatalkan permohonan ini? Tindakan ini tidak boleh dibatalkan."
        confirmText="Ya, Batalkan"
        cancelText="Tidak"
        onConfirm={handleCancelConfirm}
        onClose={() => setShowCancelDialog(false)}
        isLoading={cancelling}
        confirmButtonClass="bg-red-600 hover:bg-red-700 text-white"
      />
    </AppLayout>
  );
};

export default LicenseDetailsPage;
