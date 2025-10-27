import { Suspense, ReactNode, useEffect } from 'react';
import { useReducedMotion } from '../../hooks/useAccessibility';

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  minLoadingTime?: number;
  onError?: (error: Error) => void;
}

/**
 * Loading skeleton component for lazy-loaded content
 */
const LoadingSkeleton = () => {
  // const { prefersReducedMotion } = useReducedMotion();

  return (
    <div className="animate-pulse" role="status" aria-label="Loading content">
      <div className="space-y-4 p-6">
        {/* Header skeleton */}
        <div className="h-8 bg-gray-200 rounded-md w-1/3"></div>

        {/* Content skeleton */}
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
        </div>

        {/* Button skeleton */}
        <div className="flex space-x-3 pt-4">
          <div className="h-10 bg-gray-200 rounded-md w-24"></div>
          <div className="h-10 bg-gray-200 rounded-md w-20"></div>
        </div>
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading page content, please wait...</span>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Enhanced loading spinner for critical components
 */
const LoadingSpinner = () => {
  const { prefersReducedMotion } = useReducedMotion();

  return (
    <div
      className="flex items-center justify-center min-h-[200px]"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center space-y-4">
        <div
          className={`w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full ${
            prefersReducedMotion ? '' : 'animate-spin'
          }`}
          aria-hidden="true"
        />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
      <span className="sr-only">Loading content, please wait...</span>
    </div>
  );
};

/**
 * Wrapper component for lazy-loaded components with enhanced loading states
 */
export default function LazyWrapper({
  children,
  fallback,
  minLoadingTime: _minLoadingTime = 300,
  onError: _onError,
}: LazyWrapperProps) {
  // const { prefersReducedMotion } = useReducedMotion();

  // Use custom fallback or default loading skeleton
  const loadingFallback = fallback || <LoadingSkeleton />;

  useEffect(() => {
    // Preload critical resources when component mounts
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        // Preload any critical resources here
      });
    }
  }, []);

  return <Suspense fallback={loadingFallback}>{children}</Suspense>;
}

/**
 * Specialized wrapper for page components
 */
export const LazyPageWrapper = ({ children }: { children: ReactNode }) => (
  <LazyWrapper fallback={<LoadingSkeleton />}>{children}</LazyWrapper>
);

/**
 * Specialized wrapper for modal/dialog components
 */
export const LazyModalWrapper = ({ children }: { children: ReactNode }) => (
  <LazyWrapper fallback={<LoadingSpinner />}>{children}</LazyWrapper>
);

/**
 * Specialized wrapper for admin components
 */
export const LazyAdminWrapper = ({ children }: { children: ReactNode }) => (
  <LazyWrapper
    fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-blue-600"
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
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Loading Admin Panel
            </h3>
            <p className="text-sm text-gray-600">
              Please wait while we load the admin features...
            </p>
          </div>
        </div>
      </div>
    }
  >
    {children}
  </LazyWrapper>
);
