import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ImageComposition } from '../utils/imageComposition';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackIcon?: React.ReactNode;
  loading?: 'lazy' | 'eager';
  quality?: 'low' | 'medium' | 'high';
  placeholder?: string;
  useDefaultBackground?: boolean; // Use default background as fallback
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  containerClassName = '',
  fallbackIcon,
  loading = 'lazy',
  quality = 'medium',
  placeholder,
  useDefaultBackground = true
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use default background if no src is provided
  const imageSrc = src || (useDefaultBackground ? ImageComposition.getDefaultBackgroundUrl() : '');

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (loading === 'eager') {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  // Performance optimization: Generate blur placeholder
  const generateBlurPlaceholder = (imgSrc: string): string => {
    if (placeholder) return placeholder;
    
    // Create a simple gradient placeholder based on image hash
    const hash = imgSrc.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const hue = Math.abs(hash) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 20%, 85%), hsl(${hue + 30}, 20%, 90%))`;
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(true);
  };

  // Quality-based sizing
  const getQualitySettings = () => {
    switch (quality) {
      case 'low':
        return { maxWidth: 400, quality: 0.6 };
      case 'high':
        return { maxWidth: 1200, quality: 0.9 };
      default:
        return { maxWidth: 800, quality: 0.8 };
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{
        background: isLoaded ? 'transparent' : generateBlurPlaceholder(imageSrc)
      }}
    >
      {isInView && (
        <>
          {/* Loading placeholder */}
          {!isLoaded && !hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Error fallback */}
          {hasError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
              {useDefaultBackground ? (
                <img
                  src={ImageComposition.getDefaultBackgroundUrl()}
                  alt="Default background"
                  className="w-full h-full object-cover"
                />
              ) : fallbackIcon ? (
                fallbackIcon
              ) : (
                <div className="w-12 h-12 text-gray-400">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Actual image */}
          <motion.img
            ref={imgRef}
            src={imageSrc}
            alt={alt}
            className={`transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            } ${className}`}
            onLoad={handleLoad}
            onError={handleError}
            loading={loading}
            style={{
              objectFit: 'contain',
              width: '100%',
              height: '100%'
            }}
            initial={{ scale: 0.95 }}
            animate={{ scale: isLoaded ? 1 : 0.95 }}
            transition={{ duration: 0.3 }}
          />
        </>
      )}
    </div>
  );
}
