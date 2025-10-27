import { useEffect, useRef, useCallback } from 'react';
import { screenReader, reducedMotion } from '../utils/accessibility';

/**
 * Hook for managing screen reader announcements
 */
export const useScreenReader = () => {
  const announce = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      screenReader.announce(message, priority);
    },
    []
  );

  return { announce };
};

/**
 * Hook for managing focus when component mounts or updates
 */
export const useFocusManagement = (
  shouldFocus: boolean = false,
  focusTarget?: 'first' | 'element',
  elementId?: string
) => {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && containerRef.current) {
      if (focusTarget === 'first') {
        const focusableElements = containerRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        if (firstElement) {
          firstElement.focus();
        }
      } else if (focusTarget === 'element' && elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          element.focus();
        }
      } else {
        containerRef.current.focus();
      }
    }
  }, [shouldFocus, focusTarget, elementId]);

  return { containerRef };
};

/**
 * Hook for handling reduced motion preferences
 */
export const useReducedMotion = () => {
  const prefersReducedMotion = reducedMotion.prefersReducedMotion();

  const getAnimationClasses = useCallback(
    (normalClasses: string, reducedClasses: string = '') => {
      return reducedMotion.getAnimationClasses(normalClasses, reducedClasses);
    },
    []
  );

  return {
    prefersReducedMotion,
    getAnimationClasses,
  };
};

/**
 * Hook for managing live regions for dynamic content updates
 */
export const useLiveRegion = () => {
  const liveRegionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.id = 'live-region';
      document.body.appendChild(liveRegion);
      (liveRegionRef as React.MutableRefObject<HTMLDivElement | null>).current =
        liveRegion;
    }

    return () => {
      if (
        liveRegionRef.current &&
        document.body.contains(liveRegionRef.current)
      ) {
        document.body.removeChild(liveRegionRef.current);
      }
    };
  }, []);

  const updateLiveRegion = useCallback(
    (message: string, priority: 'polite' | 'assertive' = 'polite') => {
      if (liveRegionRef.current) {
        liveRegionRef.current.setAttribute('aria-live', priority);
        liveRegionRef.current.textContent = message;
      }
    },
    []
  );

  return { updateLiveRegion };
};

/**
 * Hook for managing skip links
 */
export const useSkipLinks = () => {
  useEffect(() => {
    // Create skip link if it doesn't exist
    const existingSkipLink = document.getElementById('skip-to-main');
    if (!existingSkipLink) {
      const skipLink = document.createElement('a');
      skipLink.id = 'skip-to-main';
      skipLink.href = '#main-content';
      skipLink.textContent = 'Skip to main content';
      skipLink.className =
        'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg';

      // Insert at the beginning of body
      document.body.insertBefore(skipLink, document.body.firstChild);
    }

    return () => {
      const skipLink = document.getElementById('skip-to-main');
      if (skipLink && document.body.contains(skipLink)) {
        document.body.removeChild(skipLink);
      }
    };
  }, []);
};

/**
 * Hook for managing page title updates for screen readers
 */
export const usePageTitle = (title: string, announceChange: boolean = true) => {
  const { announce } = useScreenReader();

  useEffect(() => {
    const previousTitle = document.title;
    document.title = `${title} - OSC Pelesenan PBT`;

    if (announceChange && title !== previousTitle) {
      announce(`Page changed to ${title}`, 'polite');
    }

    return () => {
      // Don't restore previous title on cleanup to avoid conflicts
    };
  }, [title, announceChange, announce]);
};

/**
 * Hook for managing form validation announcements
 */
export const useFormValidation = () => {
  const { announce } = useScreenReader();

  const announceValidationError = useCallback(
    (fieldName: string, error: string) => {
      announce(`${fieldName}: ${error}`, 'assertive');
    },
    [announce]
  );

  const announceValidationSuccess = useCallback(
    (message: string = 'Form submitted successfully') => {
      announce(message, 'polite');
    },
    [announce]
  );

  const announceFieldError = useCallback(
    (errors: Record<string, string>) => {
      const errorCount = Object.keys(errors).length;
      if (errorCount > 0) {
        const message =
          errorCount === 1
            ? 'There is 1 error in the form'
            : `There are ${errorCount} errors in the form`;
        announce(message, 'assertive');
      }
    },
    [announce]
  );

  return {
    announceValidationError,
    announceValidationSuccess,
    announceFieldError,
  };
};

/**
 * Hook for managing loading state announcements
 */
export const useLoadingAnnouncement = () => {
  const { announce } = useScreenReader();

  const announceLoading = useCallback(
    (message: string = 'Loading...') => {
      announce(message, 'polite');
    },
    [announce]
  );

  const announceLoadingComplete = useCallback(
    (message: string = 'Loading complete') => {
      announce(message, 'polite');
    },
    [announce]
  );

  const announceError = useCallback(
    (message: string) => {
      announce(`Error: ${message}`, 'assertive');
    },
    [announce]
  );

  return {
    announceLoading,
    announceLoadingComplete,
    announceError,
  };
};
