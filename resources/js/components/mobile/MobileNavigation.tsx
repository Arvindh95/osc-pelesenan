import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { useTouchGestures } from '../../hooks/useTouchGestures';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { useFocusManagement } from '../../hooks/useAccessibility';
import { createNavItemAria, createModalAria } from '../../utils/accessibility';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileNavigation({
  isOpen,
  onClose,
}: MobileNavigationProps) {
  const { user, logout } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const [isClosing, setIsClosing] = useState(false);
  const navigationRef = useRef<HTMLDivElement>(null);

  // Focus management for modal
  const { containerRef } = useFocusManagement(isOpen, 'first');

  const handleLogout = () => {
    logout();
    addNotification({
      type: 'success',
      message: 'You have been logged out successfully',
    });
    onClose();
    navigate('/');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  // Touch gestures for mobile navigation
  const { elementRef } = useTouchGestures({
    onSwipeRight: handleClose,
    threshold: 100,
  });

  // Keyboard navigation for modal
  useKeyboardNavigation({
    onEscape: handleClose,
    trapFocus: true,
    containerRef: navigationRef,
  });

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, [isOpen]);

  // Navigation items for keyboard navigation
  const baseNavigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      id: 'nav-dashboard',
      icon: (
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
          />
        </svg>
      ),
    },
    {
      name: 'Identity Verification',
      href: '/identity',
      id: 'nav-identity',
      icon: (
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
            d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
          />
        </svg>
      ),
    },
    {
      name: 'Account Settings',
      href: '/settings',
      id: 'nav-settings',
      icon: (
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
  ];

  // Add Company Management and Licenses items only if user is verified
  const navigationItems = [...baseNavigationItems];
  if (user?.status_verified_person) {
    navigationItems.splice(2, 0, {
      name: 'Company Management',
      href: '/companies',
      id: 'nav-companies',
      icon: (
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
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    });
    navigationItems.splice(3, 0, {
      name: 'Lesen Saya',
      href: '/licenses',
      id: 'nav-licenses',
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    });
  }

  // Add admin item if user is admin
  if (user?.role === 'PENTADBIR_SYS') {
    navigationItems.push({
      name: 'Admin Panel',
      href: '/admin/companies',
      id: 'nav-admin',
      icon: (
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
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    });
  }

  if (!isOpen) return null;

  const modalAria = createModalAria(
    'mobile-menu-title',
    'mobile-menu-description'
  );

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop with fade animation */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-50'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Navigation drawer */}
      <div
        ref={el => {
          if (elementRef.current !== el) {
            (elementRef as React.MutableRefObject<HTMLElement | null>).current =
              el;
          }
          if (navigationRef.current !== el) {
            (
              navigationRef as React.MutableRefObject<HTMLElement | null>
            ).current = el;
          }
          if (containerRef.current !== el) {
            (
              containerRef as React.MutableRefObject<HTMLElement | null>
            ).current = el;
          }
        }}
        className={`fixed inset-y-0 right-0 max-w-xs w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isClosing ? 'translate-x-full' : 'translate-x-0'
        }`}
        id="mobile-menu"
        {...modalAria}
      >
        <div className="flex flex-col h-full">
          {/* Header with close button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span
                  className="text-white font-bold text-sm"
                  aria-hidden="true"
                >
                  OSC
                </span>
              </div>
              <h2
                id="mobile-menu-title"
                className="text-lg font-semibold text-gray-900"
              >
                Navigation Menu
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Close navigation menu"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User info section */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3" role="banner">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                <span
                  className="text-white font-semibold text-lg"
                  aria-hidden="true"
                >
                  {user?.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name}
                </div>
                <div className="text-xs text-gray-600 truncate">
                  {user?.email}
                </div>
                <div className="mt-1">
                  {user?.status_verified_person ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="sr-only">Identity status: </span>Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <svg
                        className="w-3 h-3 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="sr-only">Identity status: </span>
                      Unverified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex-1 overflow-y-auto py-4">
            <nav
              className="px-4 space-y-1"
              role="navigation"
              aria-label="Mobile navigation"
              id="mobile-menu-description"
            >
              {navigationItems.map(item => {
                const isActive =
                  location.pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    location.pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    id={item.id}
                    to={item.href}
                    className={`flex items-center px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                      isActive
                        ? 'text-blue-700 bg-blue-50 border-l-4 border-blue-600 shadow-sm'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50 active:bg-gray-100'
                    }`}
                    onClick={handleClose}
                    {...createNavItemAria(isActive)}
                  >
                    <span
                      className={`mr-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.name}</span>
                    {isActive && (
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 rounded-xl text-base font-medium text-red-600 hover:bg-red-50 active:bg-red-100 transition-colors duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              type="button"
              aria-label="Logout from your account"
            >
              <svg
                className="w-6 h-6 mr-4"
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
              <span className="flex-1 text-left">Logout</span>
            </button>
          </div>

          {/* Swipe indicator */}
          <div className="absolute top-1/2 -left-1 transform -translate-y-1/2">
            <div className="w-1 h-12 bg-gray-300 rounded-r-full opacity-50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
