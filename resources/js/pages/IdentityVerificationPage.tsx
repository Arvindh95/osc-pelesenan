import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { useVerificationStatus } from '../hooks/useVerificationStatus';
import AppLayout from '../components/layouts/AppLayout';
import VerificationForm from '../components/forms/VerificationForm';
import StatusDisplay from '../components/verification/StatusDisplay';
import { ApiError } from '../types';

function IdentityVerificationPage() {
  const navigate = useNavigate();
  const { user, verifyIdentity, isLoading } = useAuth();
  const { addNotification } = useNotification();

  const [verificationError, setVerificationError] = useState<string | null>(
    null
  );
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(
    null
  );
  const [showForm, setShowForm] = useState(true);

  // Use verification status hook for automatic updates
  const { checkStatus } = useVerificationStatus({
    enabled: !user?.status_verified_person, // Only check if not verified
    interval: 15000, // Check every 15 seconds
    onStatusChange: isVerified => {
      if (isVerified) {
        addNotification({
          type: 'success',
          message: 'Identiti anda telah disahkan secara automatik!',
          dismissible: true,
        });
        setVerificationSuccess('Identiti anda telah berjaya disahkan!');
        setShowForm(false);
      }
    },
  });

  // Clear messages when component mounts
  useEffect(() => {
    setVerificationError(null);
    setVerificationSuccess(null);
  }, []);

  const handleVerificationSubmit = async (icNo: string) => {
    setVerificationError(null);
    setVerificationSuccess(null);

    try {
      const response = await verifyIdentity(icNo);

      if (response.verified) {
        setVerificationSuccess(response.message);
        setShowForm(false);
        addNotification({
          type: 'success',
          message: 'Identiti berjaya disahkan!',
          dismissible: true,
        });

        // Check status immediately after successful verification
        await checkStatus();

        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        setVerificationError(response.message);
      }
    } catch (error) {
      console.error('Verification error:', error);

      if (error && typeof error === 'object' && 'message' in error) {
        const apiError = error as ApiError;
        setVerificationError(apiError.message);
      } else {
        setVerificationError(
          'Ralat berlaku semasa pengesahan identiti. Sila cuba lagi.'
        );
      }

      addNotification({
        type: 'error',
        message: 'Pengesahan identiti gagal. Sila cuba lagi.',
        dismissible: true,
      });
    }
  };

  const clearError = () => {
    setVerificationError(null);
  };

  const handleTryAgain = () => {
    setVerificationError(null);
    setVerificationSuccess(null);
    setShowForm(true);
  };

  return (
    <AppLayout title="Pengesahan Identiti">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Pengesahan Identiti
            </h1>
            <p className="text-gray-600">
              Sahkan identiti anda menggunakan nombor kad pengenalan untuk
              mengakses semua ciri sistem.
            </p>
          </div>

          {/* Current Status Display */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-medium text-gray-900">
                Status Semasa
              </h2>
              <button
                onClick={checkStatus}
                disabled={isLoading}
                className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Semak Status
              </button>
            </div>
            <StatusDisplay
              isVerified={user?.status_verified_person || false}
              isLoading={isLoading}
              lastVerified={user?.updated_at}
              error={verificationError}
              showActions={true}
              onRetry={handleTryAgain}
            />
          </div>

          {/* Verification Form or Success Message */}
          {user?.status_verified_person ? (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="text-center">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Identiti Telah Disahkan
                </h3>
                <p className="text-blue-700 mb-4">
                  Identiti anda telah disahkan. Anda boleh mengakses semua ciri
                  sistem.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Kembali ke Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {verificationSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-green-900 mb-2">
                      Pengesahan Berjaya!
                    </h3>
                    <p className="text-green-700 mb-4">{verificationSuccess}</p>
                    <p className="text-sm text-green-600">
                      Anda akan dialihkan ke dashboard dalam beberapa saat...
                    </p>
                  </div>
                </div>
              ) : showForm ? (
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-3">
                    Sahkan Identiti Anda
                  </h2>
                  <VerificationForm
                    onSubmit={handleVerificationSubmit}
                    isLoading={isLoading}
                    error={verificationError}
                    onClearError={clearError}
                  />
                </div>
              ) : (
                <div className="text-center">
                  <button
                    onClick={handleTryAgain}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cuba Lagi
                  </button>
                </div>
              )}
            </>
          )}

          {/* Information Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Maklumat Penting
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>
                • Pengesahan identiti diperlukan untuk mengakses ciri pengurusan
                syarikat
              </li>
              <li>
                • Pastikan nombor kad pengenalan yang dimasukkan adalah tepat
              </li>
              <li>• Proses pengesahan mungkin mengambil masa beberapa saat</li>
              <li>• Jika menghadapi masalah, sila hubungi pentadbir sistem</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default IdentityVerificationPage;
