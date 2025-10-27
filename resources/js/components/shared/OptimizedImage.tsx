/**
 * Optimized image component with lazy loading and performance features
 */

import React, { useState, useRef, useEffect } from 'react';
import { useLazyLoading } from '../../hooks/usePerformance';

interface OptimizedImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  lazy?: boolean;
  placeholder?: string;
  fallback?: string;
  aspectRatio?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  lazy = true,
  placeholder,
  fallback,
  aspectRatio,
  sizes,
  priority = false,
  onLoad,
  onError,
  className = '',
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(
    priority ? src : placeholder || ''
  );
  const imgRef = useRef<HTMLImageElement>(null);
  const { createLazyObserver, observeElement, unobserveElement } =
    useLazyLoading();

  // Lazy loading setup
  useEffect(() => {
    if (!lazy || priority) {
      setCurrentSrc(src);
      return;
    }

    const observer = createLazyObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && entry.target === imgRef.current) {
            setCurrentSrc(src);
            if (observer) {
              unobserveElement(entry.target);
            }
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1,
      }
    );

    if (observer && imgRef.current) {
      observeElement(imgRef.current);
    }

    return () => {
      if (observer && imgRef.current) {
        unobserveElement(imgRef.current);
      }
    };
  }, [
    lazy,
    priority,
    src,
    createLazyObserver,
    observeElement,
    unobserveElement,
  ]);

  // Handle image load
  const handleLoad = () => {
    setIsLoaded(true);
    setIsError(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsError(true);
    if (fallback && currentSrc !== fallback) {
      setCurrentSrc(fallback);
    } else {
      onError?.();
    }
  };

  // Generate responsive image attributes
  const getResponsiveAttributes = () => {
    const attrs: any = {};

    if (sizes) {
      attrs.sizes = sizes;
    }

    // Add loading attribute for native lazy loading
    if (lazy && !priority) {
      attrs.loading = 'lazy';
    } else if (priority) {
      attrs.loading = 'eager';
    }

    return attrs;
  };

  // Generate container styles
  const getContainerStyles = (): React.CSSProperties => {
    const containerStyle: React.CSSProperties = {
      position: 'relative',
      overflow: 'hidden',
      ...style,
    };

    if (aspectRatio) {
      containerStyle.aspectRatio = aspectRatio;
    }

    return containerStyle;
  };

  // Generate image styles
  const getImageStyles = (): React.CSSProperties => {
    return {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: 'opacity 0.3s ease-in-out',
      opacity: isLoaded ? 1 : 0,
    };
  };

  // Generate placeholder styles
  const getPlaceholderStyles = (): React.CSSProperties => {
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      opacity: isLoaded ? 0 : 1,
      transition: 'opacity 0.3s ease-in-out',
    };
  };

  return (
    <div
      className={`optimized-image-container ${className}`}
      style={getContainerStyles()}
    >
      {/* Main image */}
      <img
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        style={getImageStyles()}
        {...getResponsiveAttributes()}
        {...props}
      />

      {/* Placeholder/Loading state */}
      {!isLoaded && !isError && (
        <div style={getPlaceholderStyles()}>
          {placeholder ? (
            <img
              src={placeholder}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              aria-hidden="true"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-gray-400">
              <svg
                className="w-8 h-8 mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span className="text-xs">Loading...</span>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {isError && !fallback && (
        <div style={getPlaceholderStyles()}>
          <div className="flex flex-col items-center justify-center text-gray-400">
            <svg
              className="w-8 h-8 mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-xs">Failed to load</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

/**
 * Avatar component with optimized image loading
 */
export const OptimizedAvatar: React.FC<{
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallbackText?: string;
  className?: string;
}> = ({ src, alt, size = 'md', fallbackText, className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const fallbackContent = fallbackText || alt.charAt(0).toUpperCase();

  if (!src) {
    return (
      <div
        className={`${sizeClasses[size]} bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold ${className}`}
      >
        {fallbackContent}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={`${sizeClasses[size]} rounded-full ${className}`}
      aspectRatio="1"
      fallback={`data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="50" fill="#3b82f6"/>
          <text x="50" y="50" text-anchor="middle" dy="0.35em" fill="white" font-size="40" font-family="system-ui">${fallbackContent}</text>
        </svg>
      `)}`}
    />
  );
};
