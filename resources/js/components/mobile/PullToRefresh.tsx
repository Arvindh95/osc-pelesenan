import { ReactNode, useState, useEffect } from 'react';
import { useTouchGestures } from '../../hooks/useTouchGestures';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
  threshold?: number;
  className?: string;
}

export default function PullToRefresh({
  children,
  onRefresh,
  disabled = false,
  threshold = 80,
  className = '',
}: PullToRefreshProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);

  const handleRefresh = async () => {
    if (disabled || isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 500);
    }
  };

  const { elementRef, touchState, isPulling } = useTouchGestures({
    onPullToRefresh: handleRefresh,
    enablePullToRefresh: !disabled,
    pullThreshold: threshold,
  });

  // Update pull distance for visual feedback
  useEffect(() => {
    if (touchState.isDragging && window.scrollY === 0) {
      const distance = Math.max(0, touchState.currentY - touchState.startY);
      setPullDistance(Math.min(distance, threshold * 1.5));
    } else if (!touchState.isDragging && !isRefreshing) {
      setPullDistance(0);
    }
  }, [touchState, threshold, isRefreshing]);

  const pullProgress = Math.min(pullDistance / threshold, 1);
  const showIndicator = pullDistance > 10 || isRefreshing;

  return (
    <div ref={elementRef} className={`relative ${className}`}>
      {/* Pull indicator */}
      {showIndicator && (
        <div
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-center transition-all duration-200 ease-out"
          style={{
            transform: `translateY(${Math.max(0, pullDistance - 40)}px)`,
            opacity: isRefreshing ? 1 : pullProgress,
          }}
        >
          <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200">
            {isRefreshing ? (
              <div className="flex items-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm text-gray-600 font-medium">
                  Refreshing...
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <svg
                  className={`h-5 w-5 text-blue-600 transition-transform duration-200 ${
                    isPulling ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 14l-7 7m0 0l-7-7m7 7V3"
                  />
                </svg>
                <span className="text-sm text-gray-600 font-medium">
                  {isPulling ? 'Release to refresh' : 'Pull to refresh'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          transform: isRefreshing
            ? `translateY(60px)`
            : `translateY(${Math.max(0, pullDistance * 0.5)}px)`,
        }}
      >
        {children}
      </div>
    </div>
  );
}
