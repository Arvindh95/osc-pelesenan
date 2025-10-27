/**
 * Performance optimization utilities for the OSC Pelesenan frontend
 * Provides helpers for code splitting, lazy loading, and bundle optimization
 */

import { lazy, ComponentType, LazyExoticComponent } from 'react';

/**
 * Enhanced lazy loading with error handling and retry mechanism
 */
export const createLazyComponent = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retryCount: number = 3
): LazyExoticComponent<T> => {
  return lazy(() => {
    let retries = 0;

    const loadComponent = async (): Promise<{ default: T }> => {
      try {
        return await importFn();
      } catch (error) {
        if (retries < retryCount) {
          retries++;
          console.warn(
            `Failed to load component, retrying... (${retries}/${retryCount})`
          );
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000 * retries));
          return loadComponent();
        }
        throw error;
      }
    };

    return loadComponent();
  });
};

/**
 * Preload a component for better performance
 */
export const preloadComponent = (importFn: () => Promise<any>): void => {
  // Use requestIdleCallback if available, otherwise use setTimeout
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
};

/**
 * Bundle size optimization utilities
 */
export const bundleOptimization = {
  /**
   * Check if code splitting is supported
   */
  isCodeSplittingSupported: (): boolean => {
    return true; // Modern browsers support dynamic imports
  },

  /**
   * Get bundle loading performance metrics
   */
  getBundleMetrics: (): {
    loadTime: number;
    domContentLoaded: number;
    firstContentfulPaint?: number;
  } => {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    return {
      loadTime: navigation.loadEventEnd - navigation.loadEventStart,
      domContentLoaded:
        navigation.domContentLoadedEventEnd -
        navigation.domContentLoadedEventStart,
      firstContentfulPaint: paintEntries.find(
        entry => entry.name === 'first-contentful-paint'
      )?.startTime,
    };
  },

  /**
   * Monitor bundle loading performance
   */
  monitorBundlePerformance: (): void => {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            console.log('Bundle Performance:', {
              loadTime: navEntry.loadEventEnd - navEntry.loadEventStart,
              domContentLoaded:
                navEntry.domContentLoadedEventEnd -
                navEntry.domContentLoadedEventStart,
            });
          }
        });
      });

      observer.observe({ entryTypes: ['navigation'] });
    }
  },
};

/**
 * Resource loading optimization
 */
export const resourceOptimization = {
  /**
   * Preload critical resources
   */
  preloadCriticalResources: (resources: string[]): void => {
    resources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;

      // Determine resource type
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.match(/\.(woff2?|ttf|eot)$/)) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }

      document.head.appendChild(link);
    });
  },

  /**
   * Lazy load images with intersection observer
   */
  lazyLoadImages: (selector: string = 'img[data-src]'): void => {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll(selector).forEach(img => {
        imageObserver.observe(img);
      });
    } else {
      // Fallback for browsers without IntersectionObserver
      document.querySelectorAll(selector).forEach(img => {
        const imgElement = img as HTMLImageElement;
        const src = imgElement.dataset.src;
        if (src) {
          imgElement.src = src;
          imgElement.removeAttribute('data-src');
        }
      });
    }
  },

  /**
   * Optimize font loading
   */
  optimizeFontLoading: (): void => {
    // Add font-display: swap to improve loading performance
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Instrument Sans';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  },
};

/**
 * Memory optimization utilities
 */
export const memoryOptimization = {
  /**
   * Clean up unused resources
   */
  cleanupResources: (): void => {
    // Force garbage collection if available (development only)
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  },

  /**
   * Monitor memory usage
   */
  monitorMemoryUsage: (): {
    usedJSHeapSize?: number;
    totalJSHeapSize?: number;
    jsHeapSizeLimit?: number;
  } => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return {};
  },

  /**
   * Debounce function for performance optimization
   */
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number,
    immediate?: boolean
  ): ((...args: Parameters<T>) => void) => {
    let timeout: number | null = null;

    return function executedFunction(...args: Parameters<T>) {
      const later = () => {
        timeout = null;
        if (!immediate) func(...args);
      };

      const callNow = immediate && !timeout;

      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(later, wait) as unknown as number;

      if (callNow) func(...args);
    };
  },

  /**
   * Throttle function for performance optimization
   */
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;

    return function executedFunction(...args: Parameters<T>) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

/**
 * Network optimization utilities
 */
export const networkOptimization = {
  /**
   * Check network connection quality
   */
  getNetworkInfo: (): {
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  } => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    return {};
  },

  /**
   * Optimize requests based on network conditions
   */
  shouldOptimizeForSlowNetwork: (): boolean => {
    const networkInfo = networkOptimization.getNetworkInfo();
    return (
      networkInfo.effectiveType === 'slow-2g' ||
      networkInfo.effectiveType === '2g' ||
      networkInfo.saveData === true
    );
  },

  /**
   * Implement request caching
   */
  createCachedFetch: (cacheDuration: number = 5 * 60 * 1000) => {
    const cache = new Map<string, { data: any; timestamp: number }>();

    return async (url: string, options?: RequestInit): Promise<Response> => {
      const cacheKey = `${url}-${JSON.stringify(options)}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < cacheDuration) {
        return new Response(JSON.stringify(cached.data), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const response = await fetch(url, options);
      const data = await response.clone().json();

      cache.set(cacheKey, { data, timestamp: Date.now() });

      return response;
    };
  },
};

/**
 * Performance monitoring and reporting
 */
export const performanceMonitoring = {
  /**
   * Measure component render time
   */
  measureRenderTime: (componentName: string, renderFn: () => void): void => {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();

    console.log(`${componentName} render time: ${endTime - startTime}ms`);
  },

  /**
   * Track Core Web Vitals
   */
  trackCoreWebVitals: (): void => {
    if ('PerformanceObserver' in window) {
      // Largest Contentful Paint
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          console.log('LCP:', entry.startTime);
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          console.log('FID:', (entry as any).processingStart - entry.startTime);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            console.log('CLS:', (entry as any).value);
          }
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  },

  /**
   * Generate performance report
   */
  generatePerformanceReport: () => {
    return {
      bundleMetrics: bundleOptimization.getBundleMetrics(),
      memoryUsage: memoryOptimization.monitorMemoryUsage(),
      networkInfo: networkOptimization.getNetworkInfo(),
    };
  },
};
