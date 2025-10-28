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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header role="banner">
        <nav
          className="bg-white shadow-sm border-b border-gray-200"
          role="navigation"
          aria-label="Main navigation"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              {/* Logo and Brand */}
              <div className="flex items-center">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md p-1"
                  onClick={closeMenu}
                  aria-label="OSC Pelesenan PBT - Go to dashboard"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span
                      className="text-white font-bold text-sm"
                      aria-hidden="true"
                    >
                      OSC
                    </span>
                  </div>
                  <span className="text-xl font-semibold text-gray-900">
                    Pelesenan PBT
                  </span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div
                className="hidden md:flex items-center space-x-8"
                role="menubar"
              >
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    location.pathname === '/dashboard'
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  role="menuitem"
                  {...createNavItemAria(location.pathname === '/dashboard')}
                >
                  Dashboard
                </Link>
                <Link
                  to="/identity"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    location.pathname.startsWith('/identity')
                      ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                  role="menuitem"
                  {...createNavItemAria(
                    location.pathname.startsWith('/identity')
                  )}
                >
                  Identity Verification
                </Link>
                {user?.status_verified_person && (
                  <Link
                    to="/companies"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      location.pathname.startsWith('/companies')
                        ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                    role="menuitem"
                    {...createNavItemAria(
                      location.pathname.startsWith('/companies')
                    )}
                  >
                    Company Management
                  </Link>
                )}
                {user?.role === 'PENTADBIR_SYS' && (
                  <Link
                    to="/admin/companies"
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      location.pathname.startsWith('/admin')
                        ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                    role="menuitem"
                    {...createNavItemAria(
                      location.pathname.startsWith('/admin')
                    )}
                  >
                    Admin
                  </Link>
                )}
              </div>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                {/* User Info - Desktop */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name}
                    </div>
                    <div className="text-xs text-gray-500">
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
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Settings and Logout - Desktop */}
                <div className="hidden md:flex items-center space-x-2">
                  <Link
                    to="/settings"
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="Account Settings"
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
                    className="text-gray-500 hover:text-red-600 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    aria-label="Logout"
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

                {/* Mobile Menu Button */}
                <button
                  onClick={toggleMenu}
                  className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMenuOpen}
                  aria-controls="mobile-menu"
                  type="button"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    {isMenuOpen ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation */}
          <MobileNavigation isOpen={isMenuOpen} onClose={closeMenu} />
        </nav>
      </header>

      {/* Breadcrumbs */}
      {showBreadcrumbs && (
        <nav
          className="bg-white border-b border-gray-200"
          aria-label="Breadcrumb"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <Breadcrumb items={breadcrumbs} />
          </div>
        </nav>
      )}

      {/* Page Title */}
      {title && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900" id="page-title">
              {title}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        id="main-content"
        role="main"
        aria-labelledby={title ? 'page-title' : undefined}
      >
        {children}
      </main>
    </div>
  );
}
