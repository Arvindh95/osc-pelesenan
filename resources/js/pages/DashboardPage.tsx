import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layouts/AppLayout';
import { AuditLogDisplay } from '../components/shared';
import PullToRefresh from '../components/mobile/PullToRefresh';
import { useMobilePerformance } from '../hooks/useMobilePerformance';
import { useState } from 'react';

function DashboardPage() {
  const { user } = useAuth();
  const { isMobile, shouldReduceAnimations } = useMobilePerformance();
  const [refreshKey, setRefreshKey] = useState(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleRefresh = async () => {
    // Simulate refresh by updating key to force re-render of components
    setRefreshKey(prev => prev + 1);
    // In a real app, this would refetch data
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const dashboardContent = (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
              Welcome back, {user?.name}!
            </h2>
            <p className="text-gray-600 mt-1 text-sm md:text-base">
              Here&apos;s an overview of your account status and recent
              activity.
            </p>
          </div>
          <div className="flex items-center justify-start sm:justify-end">
            {user?.status_verified_person ? (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-green-800 font-medium text-sm">
                  Verified
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 bg-yellow-50 px-3 py-2 rounded-lg">
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <span className="text-yellow-800 font-medium text-sm">
                  Unverified
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* User Information Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Full Name
              </label>
              <p className="text-gray-900 font-medium">{user?.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Email Address
              </label>
              <p className="text-gray-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                IC Number
              </label>
              <p className="text-gray-900 font-medium font-mono">
                {user?.ic_no}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                Account Role
              </label>
              <p className="text-gray-900 font-medium">
                {user?.role === 'PENTADBIR_SYS'
                  ? 'System Administrator'
                  : 'Applicant'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Verification Status
              </label>
              <div className="flex items-center space-x-2">
                {user?.status_verified_person ? (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Verified
                    </span>
                    <span className="text-sm text-gray-500">
                      Identity confirmed
                    </span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Pending Verification
                    </span>
                    <span className="text-sm text-gray-500">
                      Identity verification required
                    </span>
                  </>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Member Since
              </label>
              <p className="text-gray-900 font-medium">
                {user?.created_at ? formatDate(user.created_at) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Identity Verification Card */}
        <div
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 ${!shouldReduceAnimations ? 'hover:shadow-md transition-shadow' : ''} touch-manipulation`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            {user?.status_verified_person && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Completed
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Identity Verification
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            {user?.status_verified_person
              ? 'Your identity has been verified. You can re-verify if needed.'
              : 'Verify your identity using your IC number to access all features.'}
          </p>
          <Link
            to="/identity"
            className={`inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 ${!shouldReduceAnimations ? 'transition-colors' : ''} touch-manipulation`}
          >
            {user?.status_verified_person
              ? 'Re-verify Identity'
              : 'Verify Identity'}
          </Link>
        </div>

        {/* Company Management Card */}
        <div
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 ${!shouldReduceAnimations ? 'hover:shadow-md transition-shadow' : ''} touch-manipulation`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Company Management
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Verify companies using SSM numbers and link them to your account for
            business operations.
          </p>
          <Link
            to="/companies"
            className={`inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 ${!shouldReduceAnimations ? 'transition-colors' : ''} touch-manipulation`}
          >
            Manage Companies
          </Link>
        </div>

        {/* Account Settings Card */}
        <div
          className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 ${!shouldReduceAnimations ? 'hover:shadow-md transition-shadow' : ''} touch-manipulation`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Settings
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Manage your account preferences, security settings, and personal
            information.
          </p>
          <Link
            to="/settings"
            className={`inline-flex items-center justify-center w-full px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!shouldReduceAnimations ? 'transition-colors' : ''} touch-manipulation`}
          >
            Account Settings
          </Link>
        </div>

        {/* Admin Panel Card - Only for admin users */}
        {user?.role === 'PENTADBIR_SYS' && (
          <div
            className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 ${!shouldReduceAnimations ? 'hover:shadow-md transition-shadow' : ''} touch-manipulation`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Admin
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Admin Panel
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Access administrative functions including user management and
              system oversight.
            </p>
            <Link
              to="/admin/companies"
              className={`inline-flex items-center justify-center w-full px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 ${!shouldReduceAnimations ? 'transition-colors' : ''} touch-manipulation`}
            >
              Admin Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 md:mb-6 space-y-2 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <Link
            to="/audit-logs"
            className={`text-sm text-blue-600 hover:text-blue-700 font-medium touch-manipulation ${!shouldReduceAnimations ? 'transition-colors' : ''}`}
          >
            View All Activity
          </Link>
        </div>

        <AuditLogDisplay
          key={refreshKey}
          limit={isMobile ? 3 : 5}
          autoRefresh={true}
          refreshInterval={30000}
        />
      </div>
    </div>
  );

  return (
    <AppLayout title="Dashboard">
      {isMobile ? (
        <PullToRefresh onRefresh={handleRefresh}>
          {dashboardContent}
        </PullToRefresh>
      ) : (
        dashboardContent
      )}
    </AppLayout>
  );
}

export default DashboardPage;
