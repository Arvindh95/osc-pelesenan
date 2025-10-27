/**
 * Bundle analyzer utility for development
 * Helps identify bundle size issues and optimization opportunities
 */

import React from 'react';

interface BundleInfo {
  name: string;
  size: number;
  gzipSize?: number;
  loadTime?: number;
}

interface ComponentMetrics {
  name: string;
  renderTime: number;
  memoryUsage?: number;
  bundleSize?: number;
}

class BundleAnalyzer {
  private bundles: Map<string, BundleInfo> = new Map();
  private componentMetrics: Map<string, ComponentMetrics> = new Map();
  private loadStartTime: number = performance.now();

  /**
   * Track bundle loading
   */
  trackBundle(name: string, size: number, gzipSize?: number): void {
    const loadTime = performance.now() - this.loadStartTime;

    this.bundles.set(name, {
      name,
      size,
      gzipSize,
      loadTime,
    });

    if (import.meta.env.DEV) {
      console.log(
        `Bundle loaded: ${name} (${this.formatSize(size)}) in ${loadTime.toFixed(2)}ms`
      );
    }
  }

  /**
   * Track component performance
   */
  trackComponent(name: string, renderTime: number, memoryUsage?: number): void {
    this.componentMetrics.set(name, {
      name,
      renderTime,
      memoryUsage,
    });

    if (import.meta.env.DEV && renderTime > 16) {
      console.warn(
        `Slow component render: ${name} took ${renderTime.toFixed(2)}ms`
      );
    }
  }

  /**
   * Get bundle analysis report
   */
  getAnalysisReport(): {
    totalBundleSize: number;
    largestBundles: BundleInfo[];
    slowestComponents: ComponentMetrics[];
    recommendations: string[];
  } {
    const bundles = Array.from(this.bundles.values());
    const components = Array.from(this.componentMetrics.values());

    const totalBundleSize = bundles.reduce(
      (total, bundle) => total + bundle.size,
      0
    );
    const largestBundles = bundles.sort((a, b) => b.size - a.size).slice(0, 5);

    const slowestComponents = components
      .sort((a, b) => b.renderTime - a.renderTime)
      .slice(0, 5);

    const recommendations = this.generateRecommendations(bundles, components);

    return {
      totalBundleSize,
      largestBundles,
      slowestComponents,
      recommendations,
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(
    bundles: BundleInfo[],
    components: ComponentMetrics[]
  ): string[] {
    const recommendations: string[] = [];

    // Bundle size recommendations
    const largeBundles = bundles.filter(bundle => bundle.size > 100 * 1024); // > 100KB
    if (largeBundles.length > 0) {
      recommendations.push(
        `Consider code splitting for large bundles: ${largeBundles.map(b => b.name).join(', ')}`
      );
    }

    // Component performance recommendations
    const slowComponents = components.filter(comp => comp.renderTime > 16);
    if (slowComponents.length > 0) {
      recommendations.push(
        `Optimize slow components: ${slowComponents.map(c => c.name).join(', ')}`
      );
    }

    // Memory usage recommendations
    const memoryHeavyComponents = components.filter(
      comp => comp.memoryUsage && comp.memoryUsage > 10 * 1024 * 1024 // > 10MB
    );
    if (memoryHeavyComponents.length > 0) {
      recommendations.push(
        `Review memory usage in: ${memoryHeavyComponents.map(c => c.name).join(', ')}`
      );
    }

    // General recommendations
    const totalSize = bundles.reduce((total, bundle) => total + bundle.size, 0);
    if (totalSize > 1024 * 1024) {
      // > 1MB
      recommendations.push(
        'Consider implementing lazy loading for non-critical features'
      );
    }

    if (bundles.length > 10) {
      recommendations.push(
        'Consider bundle consolidation to reduce HTTP requests'
      );
    }

    return recommendations;
  }

  /**
   * Format file size for display
   */
  private formatSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';

    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Monitor resource loading
   */
  monitorResourceLoading(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;

            // Track JavaScript bundles
            if (resourceEntry.name.includes('.js')) {
              const bundleName =
                resourceEntry.name.split('/').pop() || 'unknown';
              const size = resourceEntry.transferSize || 0;
              const loadTime =
                resourceEntry.responseEnd - resourceEntry.requestStart;

              this.trackBundle(bundleName, size);

              if (import.meta.env.DEV) {
                console.log(
                  `Resource loaded: ${bundleName} in ${loadTime.toFixed(2)}ms`
                );
              }
            }
          }
        });
      });

      observer.observe({ entryTypes: ['resource'] });
    }
  }

  /**
   * Create performance report for development
   */
  createDevelopmentReport(): void {
    if (!import.meta.env.DEV) return;

    setTimeout(() => {
      const report = this.getAnalysisReport();

      console.group('📊 Bundle Analysis Report');
      console.log(
        `Total Bundle Size: ${this.formatSize(report.totalBundleSize)}`
      );

      if (report.largestBundles.length > 0) {
        console.group('🔍 Largest Bundles');
        report.largestBundles.forEach(bundle => {
          console.log(`${bundle.name}: ${this.formatSize(bundle.size)}`);
        });
        console.groupEnd();
      }

      if (report.slowestComponents.length > 0) {
        console.group('⚠️ Slowest Components');
        report.slowestComponents.forEach(comp => {
          console.log(`${comp.name}: ${comp.renderTime.toFixed(2)}ms`);
        });
        console.groupEnd();
      }

      if (report.recommendations.length > 0) {
        console.group('💡 Recommendations');
        report.recommendations.forEach(rec => console.log(`• ${rec}`));
        console.groupEnd();
      }

      console.groupEnd();
    }, 3000); // Wait 3 seconds for initial loading to complete
  }
}

// Create singleton instance
export const bundleAnalyzer = new BundleAnalyzer();

// Auto-start monitoring in development
if (import.meta.env.DEV) {
  bundleAnalyzer.monitorResourceLoading();
  bundleAnalyzer.createDevelopmentReport();
}

/**
 * Higher-order component for tracking component performance
 */
export function withPerformanceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const displayName =
    componentName ||
    WrappedComponent.displayName ||
    WrappedComponent.name ||
    'Component';

  const PerformanceTrackedComponent = (props: P) => {
    const startTime = React.useRef<number>(0);

    React.useEffect(() => {
      startTime.current = performance.now();
    });

    React.useEffect(() => {
      const renderTime = performance.now() - startTime.current;
      bundleAnalyzer.trackComponent(displayName, renderTime);
    });

    return React.createElement(WrappedComponent, props);
  };

  PerformanceTrackedComponent.displayName = `withPerformanceTracking(${displayName})`;

  return PerformanceTrackedComponent;
}

/**
 * Hook for component performance tracking
 */
export function usePerformanceTracking(componentName: string) {
  const startTime = React.useRef<number>(0);

  React.useEffect(() => {
    startTime.current = performance.now();

    return () => {
      const renderTime = performance.now() - startTime.current;
      bundleAnalyzer.trackComponent(componentName, renderTime);
    };
  }, [componentName]);
}
