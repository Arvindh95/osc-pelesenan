import { ReactNode, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import Breadcrumb from '../shared/Breadcrumb';
import MobileNavigation from '../mobile/MobileNavigation';
import { useSkipLinks, usePageTitle } from '../../hooks/useAccessibility';
import { createNavItemAria } from '../../utils/accessibility';

interface BreadcrumbItem {
  name: string;
  href?: string;
  current?: boolean;
}

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  breadcrumbs?: BreadcrumbItem[];
  showBreadcrumbs?: boolean;
}

export default function AppLayout({
  children,
  title,
  breadcrumbs,
  showBreadcrumbs = true,
}: AppLayoutProps) {
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false);

  // Initialize accessibility features
  useSkipLinks();
  usePageTitle(title || 'Dashboard');

  const handleLogout = () => {
    logout();
    addNotification({
      type: 'success',
      message: 'You have been logged out successfully',
    });
    navigate('/');
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed);
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 transition-all duration-300 ${
          isDesktopSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <Link
            to="/dashboard"
            className={`flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1 ${
              isDesktopSidebarCollapsed ? 'justify-center' : ''
            }`}
            aria-label="OSC Pelesenan PBT - Go to dashboard"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm" aria-hidden="true">
                OSC
              </span>
            </div>
            {!isDesktopSidebarCollapsed && (
              <span className="text-lg font-semibold text-gray-900 whitespace-nowrap">
                Pelesenan PBT
              </span>
            )}
          </Link>
          {!isDesktopSidebarCollapsed && (
            <button
              onClick={toggleDesktopSidebar}
              className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Collapse sidebar"
              type="button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Collapse Button - When Collapsed */}
        {isDesktopSidebarCollapsed && (
          <div className="flex justify-center py-2 border-b border-gray-200">
            <button
              onClick={toggleDesktopSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Expand sidebar"
              type="button"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto" role="menubar">
          <Link
            to="/dashboard"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isActive('/dashboard')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            } ${isDesktopSidebarCollapsed ? 'justify-center' : ''}`}
            role="menuitem"
            title={isDesktopSidebarCollapsed ? 'Dashboard' : undefined}
            {...createNavItemAria(isActive('/dashboard'))}
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 ${isDesktopSidebarCollapsed ? '' : 'mr-3'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            {!isDesktopSidebarCollapsed && <span>Dashboard</span>}
          </Link>

          <Link
            to="/identity"
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isActive('/identity')
                ? 'text-blue-600 bg-blue-50'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
            } ${isDesktopSidebarCollapsed ? 'justify-center' : ''}`}
            role="menuitem"
            title={isDesktopSidebarCollapsed ? 'Identity Verification' : undefined}
            {...createNavItemAria(isActive('/identity'))}
          >
            <svg
              className={`w-5 h-5 flex-shrink-0 ${isDesktopSidebarCollapsed ? '' : 'mr-3'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
              />
            </svg>
            {!isDesktopSidebarCollapsed && <span>Identity Verification</span>}
          </Link>

          {user?.status_verified_person && (
            <>
              <Link
                to="/companies"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive('/companies')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                } ${isDesktopSidebarCollapsed ? 'justify-center' : ''}`}
                role="menuitem"
                title={isDesktopSidebarCollapsed ? 'Company Management' : undefined}
                {...createNavItemAria(isActive('/companies'))}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 ${isDesktopSidebarCollapsed ? '' : 'mr-3'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
                {!isDesktopSidebarCollapsed && <span>Company Management</span>}
              </Link>

              <Link
                to="/licenses"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  isActive('/licenses')
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                } ${isDesktopSidebarCollapsed ? 'justify-center' : ''}`}
                role="menuitem"
                title={isDesktopSidebarCollapsed ? 'Lesen Saya' : undefined}
                {...createNavItemAria(isActive('/licenses'))}
              >
                <svg
                  className={`w-5 h-5 flex-shrink-0 ${isDesktopSidebarCollapsed ? '' : 'mr-3'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {!isDesktopSidebarCollapsed && <span>Lesen Saya</span>}
              </Link>
            </>
          )}

          {user?.role === 'PENTADBIR_SYS' && (
            <Link
              to="/admin/companies"
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive('/admin')
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              } ${isDesktopSidebarCollapsed ? 'justify-center' : ''}`}
              role="menuitem"
              title={isDesktopSidebarCollapsed ? 'Admin' : undefined}
              {...createNavItemAria(isActive('/admin'))}
            >
              <svg
                className={`w-5 h-5 flex-shrink-0 ${isDesktopSidebarCollapsed ? '' : 'mr-3'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
              {!isDesktopSidebarCollapsed && <span>Admin</span>}
            </Link>
          )}
        </nav>

        {/* User Section */}
        <div className="border-t border-gray-200 p-3">
          {!isDesktopSidebarCollapsed ? (
            <>
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-xs">
                    {user?.status_verified_person ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Link
                  to="/settings"
                  className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label="Account Settings"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center px-3 py-2 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                  aria-label="Logout"
                  type="button"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {user?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <Link
                to="/settings"
                className="flex justify-center p-2 text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Account Settings"
                title="Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex justify-center p-2 text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                aria-label="Logout"
                title="Logout"
                type="button"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={closeMobileSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <MobileNavigation isOpen={isMobileSidebarOpen} onClose={closeMobileSidebar} />
      </aside>

      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isDesktopSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Top Bar - Mobile */}
        <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={toggleMobileSidebar}
              className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={isMobileSidebarOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileSidebarOpen}
              type="button"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <Link
              to="/dashboard"
              className="flex items-center space-x-2"
              aria-label="OSC Pelesenan PBT"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm" aria-hidden="true">
                  OSC
                </span>
              </div>
              <span className="text-lg font-semibold text-gray-900">
                Pelesenan PBT
              </span>
            </Link>

            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        {/* Breadcrumbs */}
        {showBreadcrumbs && (
          <nav className="bg-white border-b border-gray-200" aria-label="Breadcrumb">
            <div className="px-4 sm:px-6 lg:px-8 py-3">
              <Breadcrumb items={breadcrumbs} />
            </div>
          </nav>
        )}

        {/* Page Title */}
        {title && (
          <div className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <h1 className="text-2xl font-bold text-gray-900" id="page-title">
                {title}
              </h1>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main
          className="px-4 sm:px-6 lg:px-8 py-8"
          id="main-content"
          role="main"
          aria-labelledby={title ? 'page-title' : undefined}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
