import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CompanyProvider } from './contexts/CompanyContext';
import ErrorBoundary from './components/shared/ErrorBoundary';
import NotificationContainer from './components/shared/NotificationContainer';
import {
  LazyPageWrapper,
  LazyVerifiedWrapper,
  LazyAdminWrapper,
} from './components/shared/LazyWrapper';
import { createLazyComponent } from './utils/performance';
import {
  useBundlePerformance,
  useResourcePreloading,
} from './hooks/usePerformance';
import PerformanceMonitor from './components/dev/PerformanceMonitor';

// Critical pages - loaded immediately
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Non-critical pages - lazy loaded
const DashboardPage = createLazyComponent(
  () => import('./pages/DashboardPage')
);
const IdentityVerificationPage = createLazyComponent(
  () => import('./pages/IdentityVerificationPage')
);
const CompanyManagementPage = createLazyComponent(
  () => import('./pages/CompanyManagementPage')
);
const AccountSettingsPage = createLazyComponent(
  () => import('./pages/AccountSettingsPage')
);
const AuditLogsPage = createLazyComponent(
  () => import('./pages/AuditLogsPage')
);

// M02 License Management Pages - lazy loaded
const LicensesListPage = createLazyComponent(
  () => import('./pages/licenses/LicensesListPage')
);
const LicenseCreatePage = createLazyComponent(
  () => import('./pages/licenses/LicenseCreatePage')
);
const LicenseEditPage = createLazyComponent(
  () => import('./pages/licenses/LicenseEditPage')
);
const LicenseDetailsPage = createLazyComponent(
  () => import('./pages/licenses/LicenseDetailsPage')
);

function App() {
  // Initialize performance monitoring
  const { generateReport } = useBundlePerformance();
  const { preloadComponent } = useResourcePreloading();

  // Preload likely-to-be-used components
  React.useEffect(() => {
    // Preload dashboard after initial load
    preloadComponent(() => import('./pages/DashboardPage'));

    // Log performance metrics in development
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    ) {
      setTimeout(() => {
        console.log('Performance Report:', generateReport());
      }, 2000);
    }
  }, [generateReport, preloadComponent]);

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <CompanyProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <NotificationContainer />
              <PerformanceMonitor />
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Protected Routes - Lazy Loaded */}
                  <Route
                    path="/dashboard"
                    element={
                      <LazyPageWrapper>
                        <DashboardPage />
                      </LazyPageWrapper>
                    }
                  />
                  <Route
                    path="/identity"
                    element={
                      <LazyPageWrapper>
                        <IdentityVerificationPage />
                      </LazyPageWrapper>
                    }
                  />
                  <Route
                    path="/companies"
                    element={
                      <LazyVerifiedWrapper>
                        <CompanyManagementPage />
                      </LazyVerifiedWrapper>
                    }
                  />
                  <Route
                    path="/companies/verify"
                    element={
                      <LazyVerifiedWrapper>
                        <CompanyManagementPage />
                      </LazyVerifiedWrapper>
                    }
                  />
                  <Route
                    path="/companies/link"
                    element={
                      <LazyVerifiedWrapper>
                        <CompanyManagementPage />
                      </LazyVerifiedWrapper>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <LazyPageWrapper>
                        <AccountSettingsPage />
                      </LazyPageWrapper>
                    }
                  />
                  <Route
                    path="/settings/deactivate"
                    element={
                      <LazyPageWrapper>
                        <AccountSettingsPage />
                      </LazyPageWrapper>
                    }
                  />
                  <Route
                    path="/audit-logs"
                    element={
                      <LazyPageWrapper>
                        <AuditLogsPage />
                      </LazyPageWrapper>
                    }
                  />

                  {/* M02 License Management Routes - Lazy Loaded */}
                  <Route
                    path="/licenses"
                    element={
                      <LazyVerifiedWrapper>
                        <LicensesListPage />
                      </LazyVerifiedWrapper>
                    }
                  />
                  <Route
                    path="/licenses/new"
                    element={
                      <LazyVerifiedWrapper>
                        <LicenseCreatePage />
                      </LazyVerifiedWrapper>
                    }
                  />
                  <Route
                    path="/licenses/:id/edit"
                    element={
                      <LazyVerifiedWrapper>
                        <LicenseEditPage />
                      </LazyVerifiedWrapper>
                    }
                  />
                  <Route
                    path="/licenses/:id"
                    element={
                      <LazyVerifiedWrapper>
                        <LicenseDetailsPage />
                      </LazyVerifiedWrapper>
                    }
                  />

                  {/* Admin Routes - Lazy Loaded with Admin Wrapper */}
                  <Route
                    path="/admin/companies"
                    element={
                      <LazyAdminWrapper>
                        <CompanyManagementPage />
                      </LazyAdminWrapper>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <LazyAdminWrapper>
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                              User Management
                            </h2>
                            <p className="mt-2 text-gray-600">
                              User management features coming soon...
                            </p>
                          </div>
                        </div>
                      </LazyAdminWrapper>
                    }
                  />
                  <Route
                    path="/admin/audit"
                    element={
                      <LazyAdminWrapper>
                        <AuditLogsPage />
                      </LazyAdminWrapper>
                    }
                  />
                  <Route
                    path="/admin/*"
                    element={
                      <LazyAdminWrapper>
                        <div className="min-h-screen flex items-center justify-center">
                          <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                              Admin Panel
                            </h2>
                            <p className="mt-2 text-gray-600">
                              Admin features coming soon...
                            </p>
                          </div>
                        </div>
                      </LazyAdminWrapper>
                    }
                  />

                {/* 404 Not Found Route */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                          <svg
                            className="h-6 w-6 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m9 0V9m-9 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          Halaman Tidak Dijumpai
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Halaman yang anda cari tidak wujud.
                        </p>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() =>
                              (window.location.href = '/dashboard')
                            }
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Kembali ke Dashboard
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Routes>
              </div>
            </Router>
          </AuthProvider>
        </CompanyProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

// Mount the React app
const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
