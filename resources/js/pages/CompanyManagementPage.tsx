import { useState, useEffect } from 'react';
import { useCompany } from '../contexts/CompanyContext';
import { useNotification } from '../contexts/NotificationContext';
import {
  CompanyVerification,
  CompanyLinking,
  MyCompanies,
} from '../components/company';
import {
  Company,
  CompanyVerificationResponse,
  CompanyLinkResponse,
  ApiError,
} from '../types';
import { useMobilePerformance } from '../hooks/useMobilePerformance';
import { useTouchGestures } from '../hooks/useTouchGestures';
import AppLayout from '../components/layouts/AppLayout';
import PullToRefresh from '../components/mobile/PullToRefresh';

function CompanyManagementPage() {
  const {
    companies,
    isLoading,
    error,
    getMyCompanies,
    getAvailableCompanies,
    clearError,
  } = useCompany();
  const { addNotification } = useNotification();
  const { isMobile, shouldReduceAnimations } = useMobilePerformance();
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [verifiedCompany, setVerifiedCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState<
    'verify' | 'link' | 'my-companies'
  >('verify');

  // Load user's companies on component mount
  useEffect(() => {
    loadMyCompanies();
    loadAllCompanies();
  }, []);

  const loadMyCompanies = async () => {
    try {
      await getMyCompanies();
    } catch (error) {
      // Error is handled by context
    }
  };

  const loadAllCompanies = async () => {
    try {
      const companies = await getAvailableCompanies();
      setAllCompanies(companies);
    } catch (error) {
      // Error is handled by context, but we might want to show a notification
      console.error('Failed to load available companies:', error);
    }
  };

  const handleVerificationSuccess = (response: CompanyVerificationResponse) => {
    setVerifiedCompany(response.company);
    addNotification({
      type: 'success',
      message: `Syarikat ${response.company.name} berjaya disahkan!`,
    });

    // Switch to linking tab if company is available for linking
    if (
      response.company.owner_user_id === null &&
      response.company.status === 'active'
    ) {
      setActiveTab('link');
    }

    // Refresh all companies list
    loadAllCompanies();
  };

  const handleVerificationError = (error: ApiError) => {
    addNotification({
      type: 'error',
      message: error.message,
    });
  };

  const handleLinkSuccess = (response: CompanyLinkResponse) => {
    addNotification({
      type: 'success',
      message: `Syarikat ${response.company.name} berjaya dipautkan ke akaun anda!`,
    });

    // Switch to my companies tab to show the newly linked company
    setActiveTab('my-companies');

    // Refresh companies lists
    loadMyCompanies();
    loadAllCompanies();

    // Clear verified company
    setVerifiedCompany(null);
  };

  const handleLinkError = (error: ApiError) => {
    addNotification({
      type: 'error',
      message: error.message,
    });
  };

  const refreshCompanies = async () => {
    await loadMyCompanies();
    await loadAllCompanies();
  };

  // Touch gestures for mobile tab navigation
  const { elementRef } = useTouchGestures({
    onSwipeLeft: () => {
      if (activeTab === 'verify') setActiveTab('link');
      else if (activeTab === 'link') setActiveTab('my-companies');
    },
    onSwipeRight: () => {
      if (activeTab === 'my-companies') setActiveTab('link');
      else if (activeTab === 'link') setActiveTab('verify');
    },
    threshold: 100,
  });

  // Get companies available for linking (not owned by anyone and not unknown)
  const availableCompanies = allCompanies.filter(
    company => company.owner_user_id === null && company.status !== 'unknown'
  );

  const pageContent = (
    <div className="space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Pengurusan Syarikat
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Sahkan, pautkan, dan urus syarikat yang berkaitan dengan akaun anda.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav
          className={`flex ${isMobile ? 'space-x-4 overflow-x-auto pb-2' : 'space-x-8'}`}
          aria-label="Tabs"
        >
          <button
            onClick={() => setActiveTab('verify')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm touch-manipulation ${
              activeTab === 'verify'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 ${!shouldReduceAnimations ? 'transition-colors' : ''}`
            }`}
          >
            Sahkan Syarikat
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm touch-manipulation ${
              activeTab === 'link'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 ${!shouldReduceAnimations ? 'transition-colors' : ''}`
            }`}
          >
            Pautkan Syarikat
            {availableCompanies.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {availableCompanies.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('my-companies')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm touch-manipulation ${
              activeTab === 'my-companies'
                ? 'border-blue-500 text-blue-600'
                : `border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 ${!shouldReduceAnimations ? 'transition-colors' : ''}`
            }`}
          >
            Syarikat Saya
            {companies.length > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {companies.length}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div ref={elementRef} className="space-y-6 touch-manipulation">
        {activeTab === 'verify' && (
          <CompanyVerification
            onVerificationSuccess={handleVerificationSuccess}
            onVerificationError={handleVerificationError}
          />
        )}

        {activeTab === 'link' && (
          <CompanyLinking
            availableCompanies={availableCompanies}
            onLinkSuccess={handleLinkSuccess}
            onLinkError={handleLinkError}
            refreshCompanies={refreshCompanies}
          />
        )}

        {activeTab === 'my-companies' && (
          <MyCompanies
            companies={companies}
            onRefresh={loadMyCompanies}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Recently Verified Company Notice */}
      {verifiedCompany && activeTab !== 'verify' && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md touch-manipulation">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Syarikat Baru Disahkan
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                <strong>{verifiedCompany.name}</strong> telah disahkan.
                {verifiedCompany.owner_user_id === null &&
                  verifiedCompany.status === 'active' && (
                    <span>
                      {' '}
                      Anda boleh memautkannya ke akaun anda di tab
                      &ldquo;Pautkan Syarikat&rdquo;.
                    </span>
                  )}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={() => setVerifiedCompany(null)}
                className="inline-flex text-blue-400 hover:text-blue-600 focus:outline-none touch-manipulation p-1"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md touch-manipulation">
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
              <h3 className="text-sm font-medium text-red-800">Ralat Sistem</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                type="button"
                onClick={clearError}
                className="inline-flex text-red-400 hover:text-red-600 focus:outline-none touch-manipulation p-1"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AppLayout title="Pengurusan Syarikat">
      {isMobile ? (
        <PullToRefresh onRefresh={refreshCompanies}>
          {pageContent}
        </PullToRefresh>
      ) : (
        pageContent
      )}
    </AppLayout>
  );
}

export default CompanyManagementPage;
