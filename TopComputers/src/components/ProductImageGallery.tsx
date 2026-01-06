import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';
import { ProgressiveImageLoader } from '../utils/imageOptimization';

interface ProductImageGalleryProps {
  images: string[];
  productTitle: string;
  className?: string;
}

// COST OPTIMIZATION: Lazy loading with progressive enhancement
const OptimizedImage = React.memo(({ src, alt, className, onClick }: {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    img.onload = () => setIsLoaded(true);
    img.onerror = () => setError(true);
    img.src = src;
  }, [src]);

  if (error) {
    return (
      <div className={`bg-white dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-gray-600 dark:text-gray-400 text-sm">Image not available</span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-white dark:bg-gray-800 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-contain transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClick}
        loading="lazy"
      />
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default function ProductImageGallery({ images, productTitle, className }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);

  // PERFORMANCE OPTIMIZATION: Memoize filtered images
  const validImages = React.useMemo(() => {
    return images.filter(img => img && img.trim() !== '');
  }, [images]);

  // COST OPTIMIZATION: Preload only adjacent images to reduce bandwidth
  useEffect(() => {
    if (validImages.length === 0) return;

    const preloadIndexes = [
      currentIndex,
      (currentIndex + 1) % validImages.length,
      currentIndex > 0 ? currentIndex - 1 : validImages.length - 1
    ];

    preloadIndexes.forEach(index => {
      const img = new Image();
      img.src = validImages[index];
    });
  }, [currentIndex, validImages]);

  // Touch handlers for mobile swipe
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && validImages.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }
    if (isRightSwipe && validImages.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  }, [touchStart, touchEnd, validImages.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          if (validImages.length > 1) {
            setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
          }
          break;
        case 'ArrowRight':
          if (validImages.length > 1) {
            setCurrentIndex((prev) => (prev + 1) % validImages.length);
          }
          break;
        case 'Escape':
          setIsModalOpen(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, validImages.length]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    if (validImages.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length);
    }
  }, [validImages.length]);

  const goToNext = useCallback(() => {
    if (validImages.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % validImages.length);
    }
  }, [validImages.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  // Default image if no images available
  if (validImages.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-xl flex flex-col items-center justify-center p-12 ${className} border-2 border-dashed border-gray-300 dark:border-gray-600`}>
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Images Available</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Product images will be added soon</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Gallery */}
      <div className={`relative group ${className}`} ref={galleryRef}>
        {/* Main Image */}
        <div 
          className="relative w-full h-96 bg-white dark:bg-gray-800 rounded-lg overflow-hidden cursor-zoom-in flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <OptimizedImage
            src={validImages[currentIndex]}
            alt={`${productTitle} - Image ${currentIndex + 1}`}
            className="w-full h-full"
            onClick={() => setIsModalOpen(true)}
          />
          
          {/* Image Counter */}
          {validImages.length > 1 && (
            <div className="absolute top-4 right-4 bg-gray-900/60 dark:bg-gray-100/90 text-white dark:text-gray-900 px-2 py-1 rounded text-sm backdrop-blur-sm shadow-sm">
              {currentIndex + 1} / {validImages.length}
            </div>
          )}

          {/* Navigation Arrows */}
          {validImages.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-600"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-600"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Zoom Icon */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-600"
            aria-label="View full size"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>

        {/* Thumbnail Navigation */}
        {validImages.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {validImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all duration-200 ${
                  index === currentIndex 
                    ? 'border-blue-500 dark:border-blue-400 ring-2 ring-blue-200 dark:ring-blue-800' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
              >
                <OptimizedImage
                  src={image}
                  alt={`${productTitle} thumbnail ${index + 1}`}
                  className="w-full h-full"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Full-Screen Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40 flex items-center justify-center">
          <div className="relative w-[80vw] max-w-[1200px] max-h-[80vh] bg-white dark:bg-gray-800 rounded-xl p-2 md:p-4 flex items-center justify-center shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 z-10"
              aria-label="Close"
            >
              <X className="w-6 h-6 md:w-8 md:h-8" />
            </button>

            {/* Navigation in Modal */}
            {validImages.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute -left-2 md:-left-6 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 p-2 rounded-full shadow-md"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                </button>
                
                <button
                  onClick={goToNext}
                  className="absolute -right-2 md:-right-6 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 p-2 rounded-full shadow-md"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                </button>
              </>
            )}

            {/* Modal Image */}
            <div 
              className="w-full h-full flex items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <img
                src={validImages[currentIndex]}
                alt={`${productTitle} - Image ${currentIndex + 1}`}
                className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-xl"
              />
            </div>

            {/* Modal Counter */}
            {validImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded">
                {currentIndex + 1} / {validImages.length}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
