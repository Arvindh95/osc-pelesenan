import { useEffect, useRef, useState } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPullToRefresh?: () => void;
  threshold?: number;
  pullThreshold?: number;
  enablePullToRefresh?: boolean;
}

interface TouchState {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  isDragging: boolean;
  isPulling: boolean;
}

export const useTouchGestures = (options: TouchGestureOptions = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    threshold = 50,
    pullThreshold = 100,
    enablePullToRefresh = false,
  } = options;

  const [touchState, setTouchState] = useState<TouchState>({
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    isDragging: false,
    isPulling: false,
  });

  const [isPullRefreshing, setIsPullRefreshing] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchState({
      startX: touch.clientX,
      startY: touch.clientY,
      currentX: touch.clientX,
      currentY: touch.clientY,
      isDragging: true,
      isPulling: false,
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchState.isDragging) return;

    const touch = e.touches[0];
    const deltaY = touch.clientY - touchState.startY;

    setTouchState(prev => ({
      ...prev,
      currentX: touch.clientX,
      currentY: touch.clientY,
    }));

    // Handle pull-to-refresh
    if (enablePullToRefresh && deltaY > 0 && window.scrollY === 0) {
      e.preventDefault();
      setTouchState(prev => ({
        ...prev,
        isPulling: deltaY > pullThreshold,
      }));
    }
  };

  const handleTouchEnd = () => {
    if (!touchState.isDragging) return;

    const deltaX = touchState.currentX - touchState.startX;
    const deltaY = touchState.currentY - touchState.startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Handle pull-to-refresh
    if (touchState.isPulling && enablePullToRefresh && onPullToRefresh) {
      setIsPullRefreshing(true);
      onPullToRefresh();
      setTimeout(() => {
        setIsPullRefreshing(false);
      }, 1000);
    }
    // Handle swipe gestures
    else if (absDeltaX > threshold || absDeltaY > threshold) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    setTouchState({
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
      isPulling: false,
    });
  };

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add passive listeners for better performance
    element.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [touchState.isDragging, touchState.isPulling]);

  return {
    elementRef,
    touchState,
    isPullRefreshing,
    isDragging: touchState.isDragging,
    isPulling: touchState.isPulling,
  };
};

export default useTouchGestures;
