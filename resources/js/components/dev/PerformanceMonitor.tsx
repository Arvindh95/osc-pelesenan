/**
 * Performance monitoring component for development
 * Shows real-time performance metrics and optimization suggestions
 */

import React, { useState, useEffect } from 'react';
import { bundleAnalyzer } from '../../utils/bundleAnalyzer';
import {
  useBundlePerformance,
  useMemoryOptimization,
  useNetworkOptimization,
} from '../../hooks/usePerformance';

interface PerformanceMonitorProps {
  enabled?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = import.meta.env.DEV,
  position = 'bottom-right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);

  const { generateReport } = useBundlePerformance();
  const { getMemoryUsage } = useMemoryOptimization();
  const { getNetworkInfo } = useNetworkOptimization();

  useEffect(() => {
    if (!enabled) return;

    const updateMetrics = () => {
      const bundleMetrics = generateReport();
      const memoryUsage = getMemoryUsage();
      const networkInfo = getNetworkInfo();
      const analysisReport = bundleAnalyzer.getAnalysisReport();

      setMetrics({
        bundle: bundleMetrics,
        memory: memoryUsage,
        network: networkInfo,
        analysis: analysisReport,
      });
    };

    // Update metrics every 5 seconds
    const interval = setInterval(updateMetrics, 5000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, [enabled, generateReport, getMemoryUsage, getNetworkInfo]);

  if (!enabled || !metrics) return null;

  const getPositionClasses = () => {
    const positions = {
      'top-left': 'top-4 left-4',
      'top-right': 'top-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'bottom-right': 'bottom-4 right-4',
    };
    return positions[position];
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    return ms ? `${ms.toFixed(2)}ms` : 'N/A';
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 font-mono text-xs`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg hover:bg-gray-800 transition-colors"
        title="Performance Monitor"
      >
        📊 {isOpen ? 'Hide' : 'Perf'}
      </button>

      {/* Performance Panel */}
      {isOpen && (
        <div className="mt-2 bg-white border border-gray-300 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {/* Bundle Metrics */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Bundle Performance
              </h3>
              <div className="space-y-1 text-gray-700">
                <div>
                  Load Time: {formatTime(metrics.bundle.bundleMetrics.loadTime)}
                </div>
                <div>
                  DOM Ready:{' '}
                  {formatTime(metrics.bundle.bundleMetrics.domContentLoaded)}
                </div>
                {metrics.bundle.bundleMetrics.firstContentfulPaint && (
                  <div>
                    FCP:{' '}
                    {formatTime(
                      metrics.bundle.bundleMetrics.firstContentfulPaint
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Memory Usage */}
            {metrics.memory.usedJSHeapSize && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Memory Usage
                </h3>
                <div className="space-y-1 text-gray-700">
                  <div>Used: {formatSize(metrics.memory.usedJSHeapSize)}</div>
                  <div>Total: {formatSize(metrics.memory.totalJSHeapSize)}</div>
                  <div>Limit: {formatSize(metrics.memory.jsHeapSizeLimit)}</div>
                  <div className="text-xs">
                    Usage:{' '}
                    {(
                      (metrics.memory.usedJSHeapSize /
                        metrics.memory.jsHeapSizeLimit) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                </div>
              </div>
            )}

            {/* Network Info */}
            {metrics.network.effectiveType && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Network</h3>
                <div className="space-y-1 text-gray-700">
                  <div>Type: {metrics.network.effectiveType}</div>
                  {metrics.network.downlink && (
                    <div>Speed: {metrics.network.downlink} Mbps</div>
                  )}
                  {metrics.network.rtt && (
                    <div>RTT: {metrics.network.rtt}ms</div>
                  )}
                  {metrics.network.saveData && (
                    <div className="text-orange-600">Save Data: ON</div>
                  )}
                </div>
              </div>
            )}

            {/* Bundle Analysis */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Bundle Analysis
              </h3>
              <div className="space-y-1 text-gray-700">
                <div>
                  Total Size: {formatSize(metrics.analysis.totalBundleSize)}
                </div>

                {metrics.analysis.largestBundles.length > 0 && (
                  <div>
                    <div className="font-medium mt-2 mb-1">
                      Largest Bundles:
                    </div>
                    {metrics.analysis.largestBundles
                      .slice(0, 3)
                      .map((bundle: any, index: number) => (
                        <div key={index} className="text-xs">
                          {bundle.name}: {formatSize(bundle.size)}
                        </div>
                      ))}
                  </div>
                )}

                {metrics.analysis.slowestComponents.length > 0 && (
                  <div>
                    <div className="font-medium mt-2 mb-1">
                      Slow Components:
                    </div>
                    {metrics.analysis.slowestComponents
                      .slice(0, 3)
                      .map((comp: any, index: number) => (
                        <div key={index} className="text-xs">
                          {comp.name}: {formatTime(comp.renderTime)}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommendations */}
            {metrics.analysis.recommendations.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Recommendations
                </h3>
                <div className="space-y-1">
                  {metrics.analysis.recommendations
                    .slice(0, 3)
                    .map((rec: string, index: number) => (
                      <div
                        key={index}
                        className="text-xs text-orange-600 bg-orange-50 p-2 rounded"
                      >
                        💡 {rec}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200">
              <button
                onClick={() => {
                  console.log('Full Performance Report:', metrics);
                  bundleAnalyzer.createDevelopmentReport();
                }}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                Log Full Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceMonitor;
