'use client';

import type React from 'react';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

// Updated interface to match your API type
interface CarImage {
  id: number;
  carListingId: number;
  url: string;
  isPrimary: boolean;
  createdAt: string | Date; // Allow both string and Date
  updatedAt?: string | Date;
  [key: string]: any; // Allow any additional properties
}

interface ProductImagesProps {
  isLoading?: boolean;
  images?: CarImage[];
}

const ProductImages: React.FC<ProductImagesProps> = ({
  isLoading = false,
  images = [],
}) => {
  const locale = useLocale();
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Use fallback images if no images are provided
  const fallbackImages = Array(5).fill('/assets/images/car-card.png');

  // Get the primary image or first image or fallback
  const primaryImage =
    images.find((img) => img?.isPrimary)?.url ||
    images[0]?.url ||
    '/assets/images/car-large.png';

  // All images
  const allImageUrls =
    images.length > 0
      ? images.map((img) => img.url)
      : ['/assets/images/car-large.png', ...fallbackImages];

  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCarouselOpen) return;

      if (e.key === 'Escape') {
        setIsCarouselOpen(false);
      } else if (e.key === 'ArrowRight') {
        goToNextImage();
      } else if (e.key === 'ArrowLeft') {
        goToPrevImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Prevent scrolling when carousel is open
    if (isCarouselOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isCarouselOpen, currentImageIndex]);

  const openCarousel = (index: number) => {
    setCurrentImageIndex(index);
    setIsCarouselOpen(true);
  };

  const closeCarousel = () => {
    setIsCarouselOpen(false);
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === allImageUrls.length - 1 ? 0 : prev + 1,
    );
  };

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? allImageUrls.length - 1 : prev - 1,
    );
  };

  // Mobile-specific navigation for main image
  const goToNextMainImage = () => {
    setCurrentMainImageIndex((prev) =>
      prev === allImageUrls.length - 1 ? 0 : prev + 1,
    );
  };

  const goToPrevMainImage = () => {
    setCurrentMainImageIndex((prev) =>
      prev === 0 ? allImageUrls.length - 1 : prev - 1,
    );
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      goToNextMainImage();
    }
    if (isRightSwipe) {
      goToPrevMainImage();
    }
  };

  // Determine which images to show as thumbnails (skip the primary image)
  const thumbnailImages =
    images.length > 0
      ? images.filter((img) => img.url !== primaryImage).map((img) => img.url)
      : fallbackImages;

  // Add a "more images" indicator if there are more than what we show
  const maxThumbnails = 5;
  const hasMoreImages = thumbnailImages.length > maxThumbnails;
  const visibleThumbnails = hasMoreImages
    ? thumbnailImages.slice(0, maxThumbnails - 1)
    : thumbnailImages;
  const remainingCount = hasMoreImages
    ? thumbnailImages.length - (maxThumbnails - 1)
    : 0;

  // Get current main image for mobile
  const currentMainImage = allImageUrls[currentMainImageIndex] || primaryImage;

  // Render skeleton loading state
  if (isLoading) {
    return (
      <Box variant="center" className="w-full">
        <Box variant="container" className="px-0">
          <Box
            variant="column"
            className="w-full items-center md:items-start md:flex-row gap-3"
          >
            {/* Main Image Skeleton */}
            <Box className="w-full md:w-[60%] lg:w-[70%] xl:w-[75%]">
              <Skeleton className="w-full aspect-video sm:aspect-[4/3] rounded-md max-h-[300px] sm:max-h-[400px] md:max-h-[520px]" />
            </Box>

            {/* Thumbnails Skeletons - Hidden on mobile */}
            <Box
              variant="center"
              className="w-full md:w-[40%] lg:w-[30%] xl:w-[25%] mt-2 md:mt-0 hidden md:flex"
            >
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 gap-2 w-full">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton
                    key={index}
                    className="w-full aspect-square rounded-md"
                  />
                ))}
              </div>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box variant="center" className="w-full">
      <Box variant="container" className="px-0">
        {/* Mobile Layout (< md) */}
        <div className="md:hidden w-full">
          {/* Mobile: Full-width swipeable image */}
          <div className="relative w-full">
            <div
              className="aspect-[4/3] w-full relative overflow-hidden rounded-lg"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <Image
                src={currentMainImage || '/placeholder.svg'}
                alt="Car"
                fill
                sizes="100vw"
                className="object-cover cursor-pointer"
                onClick={() => openCarousel(currentMainImageIndex)}
                priority
              />

              {/* Mobile Navigation Arrows */}
              {allImageUrls.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToPrevMainImage();
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNextMainImage();
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors z-10"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Mobile Image Counter */}
              <div className="absolute bottom-3 right-3 bg-black/70 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                {currentMainImageIndex + 1} / {allImageUrls.length}
              </div>

              {/* Mobile: Fullscreen icon */}
              <button
                onClick={() => openCarousel(currentMainImageIndex)}
                className="absolute top-3 right-3 p-2 bg-black/50 text-white rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                  />
                </svg>
              </button>
            </div>

            {/* Mobile: Dot indicators */}
            {allImageUrls.length > 1 && (
              <div className="flex justify-center mt-3 gap-2">
                {allImageUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentMainImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentMainImageIndex
                        ? 'bg-primary-light'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout (>= md) - Keep original */}
        <Box
          variant="column"
          className="w-full items-center md:items-start md:flex-row gap-3 hidden md:flex"
        >
          {/* Main Image */}
          <Box className="w-full md:w-[60%] lg:w-[70%] xl:w-[75%]">
            <Image
              src={primaryImage || '/placeholder.svg'}
              alt="Car"
              width={700}
              height={500}
              className="w-full rounded-md cursor-pointer object-contain max-h-[300px] sm:max-h-[400px] md:max-h-[520px]"
              onClick={() => openCarousel(allImageUrls.indexOf(primaryImage))}
            />
          </Box>

          {/* Thumbnails */}
          <Box
            variant="center"
            className="w-full md:w-[40%] lg:w-[30%] xl:w-[25%] mt-2 md:mt-0"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 w-full">
              {visibleThumbnails.map((src, index) => (
                <div
                  key={index}
                  className="w-full aspect-square relative overflow-hidden rounded-md"
                >
                  <Image
                    src={src || '/placeholder.svg'}
                    alt="Car Thumbnail"
                    fill
                    sizes="(max-width: 640px) calc(33.33vw - 16px), (max-width: 768px) calc(25vw - 16px), (max-width: 1024px) calc(20vw - 16px), (max-width: 1280px) calc(10vw - 16px), calc(12.5vw - 16px)"
                    className="rounded-md cursor-pointer object-cover"
                    onClick={() => openCarousel(allImageUrls.indexOf(src))}
                  />
                </div>
              ))}

              {/* More Images Indicator */}
              {hasMoreImages && (
                <div className="relative w-full aspect-square rounded-md overflow-hidden">
                  <Image
                    src={
                      thumbnailImages[maxThumbnails - 1] ||
                      '/assets/images/car-card.png'
                    }
                    alt="More Cars"
                    fill
                    sizes="(max-width: 640px) calc(33.33vw - 16px), (max-width: 768px) calc(25vw - 16px), (max-width: 1024px) calc(20vw - 16px), (max-width: 1280px) calc(10vw - 16px), calc(12.5vw - 16px)"
                    className="rounded-md cursor-pointer object-cover"
                    onClick={() =>
                      openCarousel(
                        allImageUrls.indexOf(
                          thumbnailImages[maxThumbnails - 1],
                        ),
                      )
                    }
                  />
                  <div className="absolute inset-0 bg-black opacity-50 rounded-md"></div>
                  <Text className="absolute inset-0 flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold">
                    +{remainingCount}
                  </Text>
                </div>
              )}
            </div>
          </Box>
        </Box>
      </Box>

      {/* Image Carousel/Lightbox - Enhanced for mobile */}
      {isCarouselOpen && (
        <Box
          className="relative fixed inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeCarousel}
        >
          <Box
            className="w-full h-full flex items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeCarousel}
              className="absolute top-4 right-4 text-white z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-all backdrop-blur-sm"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Current image */}
            <Box
              className="relative w-full h-full flex items-center justify-center px-4 py-16"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allImageUrls[currentImageIndex] || '/placeholder.svg'}
                alt={`Image ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-full max-w-full object-contain"
              />
            </Box>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white z-50 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Image counter */}
            <Box className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white bg-black/70 px-4 py-2 rounded-full text-base backdrop-blur-sm">
              {currentImageIndex + 1} / {allImageUrls.length}
            </Box>

            {/* Mobile: Swipe hint */}
            <div className="md:hidden absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/70 text-sm text-center">
              Swipe or tap arrows to navigate
            </div>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProductImages;
