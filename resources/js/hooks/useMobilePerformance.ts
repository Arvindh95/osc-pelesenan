import { useEffect, useState, useCallback } from 'react';

interface NetworkInfo {
  effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface PerformanceMetrics {
  isMobile: boolean;
  isSlowConnection: boolean;
  isLowEndDevice: boolean;
  shouldReduceAnimations: boolean;
  shouldLazyLoad: boolean;
  shouldPreloadImages: boolean;
  networkInfo: NetworkInfo | null;
  deviceMemory: number | null;
  hardwareConcurrency: number;
}

export const useMobilePerformance = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    isMobile: false,
    isSlowConnection: false,
    isLowEndDevice: false,
    shouldReduceAnimations: false,
    shouldLazyLoad: true,
    shouldPreloadImages: true,
    networkInfo: null,
    deviceMemory: null,
    hardwareConcurrency: navigator.hardwareConcurrency || 4,
  });

  const detectMobile = useCallback(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = [
      'mobile',
      'android',
      'iphone',
      'ipad',
      'ipod',
      'blackberry',
      'windows phone',
    ];
    return (
      mobileKeywords.some(keyword => userAgent.includes(keyword)) ||
      window.innerWidth <= 768 ||
      'ontouchstart' in window
    );
  }, []);

  const getNetworkInfo = useCallback((): NetworkInfo | null => {
    const connection = (navigator as any).connection || 
      (navigator as any).mozConnection || 
      (navigator as any).webkitConnection;

    if (!connection) return null;

    return {
      effectiveType: connection.effectiveType || '4g',
      downlink: connection.downlink || 10,
      rtt: connection.rtt || 100,
      saveData: connection.saveData || false,
    };
  }, []);

  const getDeviceMemory = useCallback((): number | null => {
    return (navigator as any).deviceMemory || null;
  }, []);

  const isSlowConnection = useCallback(
    (networkInfo: NetworkInfo | null): boolean => {
      if (!networkInfo) return false;

      return (
        networkInfo.effectiveType === 'slow-2g' ||
        networkInfo.effectiveType === '2g' ||
        networkInfo.downlink < 1.5 ||
        networkInfo.rtt > 300 ||
        networkInfo.saveData
      );
    },
    []
  );

  const isLowEndDevice = useCallback(
    (deviceMemory: number | null, hardwareConcurrency: number): boolean => {
      return (
        (deviceMemory !== null && deviceMemory <= 2) || hardwareConcurrency <= 2
      );
    },
    []
  );

  const updateMetrics = useCallback(() => {
    const isMobile = detectMobile();
    const networkInfo = getNetworkInfo();
    const deviceMemory = getDeviceMemory();
    const hardwareConcurrency = navigator.hardwareConcurrency || 4;

    const isSlowConn = isSlowConnection(networkInfo);
    const isLowEnd = isLowEndDevice(deviceMemory, hardwareConcurrency);

    setMetrics({
      isMobile,
      isSlowConnection: isSlowConn,
      isLowEndDevice: isLowEnd,
      shouldReduceAnimations: isLowEnd || isSlowConn,
      shouldLazyLoad: isMobile || isSlowConn,
      shouldPreloadImages: !isSlowConn && !isLowEnd,
      networkInfo,
      deviceMemory,
      hardwareConcurrency,
    });
  }, [
    detectMobile,
    getNetworkInfo,
    getDeviceMemory,
    isSlowConnection,
    isLowEndDevice,
  ]);

  // Initial metrics calculation
  useEffect(() => {
    updateMetrics();
  }, [updateMetrics]);

  // Listen for network changes
  useEffect(() => {
    const connection = (navigator as any).connection || 
      (navigator as any).mozConnection || 
      (navigator as any).webkitConnection;

    if (connection) {
      connection.addEventListener('change', updateMetrics);
      return () => connection.removeEventListener('change', updateMetrics);
    }
  }, [updateMetrics]);

  // Listen for window resize (mobile orientation changes)
  useEffect(() => {
    const handleResize = () => {
      setTimeout(updateMetrics, 100); // Debounce resize events
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateMetrics]);

  // Performance optimization utilities
  const optimizeForMobile = useCallback(
    (
      options: {
        enableAnimations?: boolean;
        preloadImages?: boolean;
        lazyLoadThreshold?: number;
      } = {}
    ) => {
      const {
        enableAnimations = !metrics.shouldReduceAnimations,
        preloadImages = metrics.shouldPreloadImages,
        lazyLoadThreshold = metrics.shouldLazyLoad ? 0.1 : 0,
      } = options;

      return {
        enableAnimations,
        preloadImages,
        lazyLoadThreshold,
        reducedMotion: metrics.shouldReduceAnimations,
      };
    },
    [metrics]
  );

  // Adaptive loading strategy
  const getLoadingStrategy = useCallback(() => {
    if (metrics.isSlowConnection) {
      return {
        imageQuality: 'low',
        chunkSize: 'small',
        prefetch: false,
        animations: false,
      };
    }

    if (metrics.isLowEndDevice) {
      return {
        imageQuality: 'medium',
        chunkSize: 'medium',
        prefetch: false,
        animations: false,
      };
    }

    return {
      imageQuality: 'high',
      chunkSize: 'large',
      prefetch: true,
      animations: true,
    };
  }, [metrics]);

  // Memory management
  const shouldUseVirtualization = useCallback(
    (itemCount: number) => {
      return metrics.isLowEndDevice && itemCount > 50;
    },
    [metrics.isLowEndDevice]
  );

  return {
    ...metrics,
    optimizeForMobile,
    getLoadingStrategy,
    shouldUseVirtualization,
    updateMetrics,
  };
};
