import { useEffect, useCallback, useRef } from 'react';
import {
  performanceMonitoring,
  bundleOptimization,
  memoryOptimization,
  networkOptimization,
} from '../utils/performance';

/**
 * Hook for monitoring component performance
 */
export const useComponentPerformance = (componentName: string) => {
  const renderStartTime = useRef<number>(0);

  useEffect(() => {
    renderStartTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      if (import.meta.env.DEV) {
        console.log(
          `${componentName} total render time: ${renderTime.toFixed(2)}ms`
        );
      }
    };
  });

  const measureOperation = useCallback(
    (operationName: string, operation: () => void) => {
      const startTime = performance.now();
      operation();
      const endTime = performance.now();

      if (import.meta.env.DEV) {
        console.log(
          `${componentName} - ${operationName}: ${(endTime - startTime).toFixed(2)}ms`
        );
      }
    },
    [componentName]
  );

  return { measureOperation };
};

/**
 * Hook for monitoring bundle performance
 */
export const useBundlePerformance = () => {
  useEffect(() => {
    // Monitor bundle performance on mount
    bundleOptimization.monitorBundlePerformance();

    // Track Core Web Vitals
    performanceMonitoring.trackCoreWebVitals();
  }, []);

  const getBundleMetrics = useCallback(() => {
    return bundleOptimization.getBundleMetrics();
  }, []);

  const generateReport = useCallback(() => {
    return performanceMonitoring.generatePerformanceReport();
  }, []);

  return {
    getBundleMetrics,
    generateReport,
  };
};

/**
 * Hook for memory optimization
 */
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanupFunction = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  const cleanup = useCallback(() => {
    cleanupFunctions.current.forEach(fn => fn());
    cleanupFunctions.current = [];
    memoryOptimization.cleanupResources();
  }, []);

  const getMemoryUsage = useCallback(() => {
    return memoryOptimization.monitorMemoryUsage();
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    addCleanupFunction,
    cleanup,
    getMemoryUsage,
    debounce: memoryOptimization.debounce,
    throttle: memoryOptimization.throttle,
  };
};

/**
 * Hook for network-aware optimizations
 */
export const useNetworkOptimization = () => {
  const getNetworkInfo = useCallback(() => {
    return networkOptimization.getNetworkInfo();
  }, []);

  const shouldOptimizeForSlowNetwork = useCallback(() => {
    return networkOptimization.shouldOptimizeForSlowNetwork();
  }, []);

  const createCachedFetch = useCallback((cacheDuration?: number) => {
    return networkOptimization.createCachedFetch(cacheDuration);
  }, []);

  return {
    getNetworkInfo,
    shouldOptimizeForSlowNetwork,
    createCachedFetch,
  };
};

/**
 * Hook for lazy loading optimization
 */
export const useLazyLoading = () => {
  const observerRef = useRef<IntersectionObserver | null>(null);

  const createLazyObserver = useCallback(
    (
      callback: (entries: IntersectionObserverEntry[]) => void,
      options?: IntersectionObserverInit
    ) => {
      if ('IntersectionObserver' in window) {
        observerRef.current = new IntersectionObserver(callback, {
          rootMargin: '50px',
          threshold: 0.1,
          ...options,
        });
        return observerRef.current;
      }
      return null;
    },
    []
  );

  const observeElement = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.observe(element);
    }
  }, []);

  const unobserveElement = useCallback((element: Element) => {
    if (observerRef.current) {
      observerRef.current.unobserve(element);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    createLazyObserver,
    observeElement,
    unobserveElement,
  };
};

/**
 * Hook for performance-aware rendering
 */
export const usePerformanceAwareRendering = () => {
  const { shouldOptimizeForSlowNetwork } = useNetworkOptimization();
  const { debounce, throttle } = useMemoryOptimization();

  const shouldReduceComplexity = useCallback(() => {
    // const _networkInfo = networkOptimization.getNetworkInfo();
    const memoryInfo = memoryOptimization.monitorMemoryUsage();

    // Reduce complexity on slow networks or low memory
    return (
      shouldOptimizeForSlowNetwork() ||
      (memoryInfo.usedJSHeapSize &&
        memoryInfo.jsHeapSizeLimit &&
        memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit > 0.8)
    );
  }, [shouldOptimizeForSlowNetwork]);

  const createOptimizedHandler = useCallback(
    <T extends (...args: any[]) => any>(
      handler: T,
      optimization: 'debounce' | 'throttle' = 'debounce',
      delay: number = 300
    ) => {
      if (shouldReduceComplexity()) {
        return optimization === 'debounce'
          ? debounce(handler, delay)
          : throttle(handler, delay);
      }
      return handler;
    },
    [shouldReduceComplexity, debounce, throttle]
  );

  return {
    shouldReduceComplexity,
    createOptimizedHandler,
  };
};

/**
 * Hook for resource preloading
 */
export const useResourcePreloading = () => {
  const preloadedResources = useRef<Set<string>>(new Set());

  const preloadResource = useCallback(
    (
      resource: string,
      type: 'script' | 'style' | 'font' | 'image' = 'script'
    ) => {
      if (preloadedResources.current.has(resource)) {
        return;
      }

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      link.as = type;

      if (type === 'font') {
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
      preloadedResources.current.add(resource);
    },
    []
  );

  const preloadComponent = useCallback((importFn: () => Promise<any>) => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        importFn().catch(() => {
          // Silently fail preloading
        });
      });
    } else {
      setTimeout(() => {
        importFn().catch(() => {
          // Silently fail preloading
        });
      }, 100);
    }
  }, []);

  return {
    preloadResource,
    preloadComponent,
  };
};
