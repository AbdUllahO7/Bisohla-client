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
  createdAt: string | Date;
  updatedAt?: string | Date;
  [key: string]: any;
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

  const fallbackImages = Array(5).fill('/assets/images/car-card.png');

  const primaryImage =
    images.find((img) => img?.isPrimary)?.url ||
    images[0]?.url ||
    '/assets/images/car-large.png';

  const allImageUrls =
    images.length > 0
      ? images.map((img) => img.url)
      : ['/assets/images/car-large.png', ...fallbackImages];

  const [isCarouselOpen, setIsCarouselOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMainImageIndex, setCurrentMainImageIndex] = useState(0);

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

  const thumbnailImages =
    images.length > 0
      ? images.filter((img) => img.url !== primaryImage).map((img) => img.url)
      : fallbackImages;

  const maxThumbnails = 5;
  const hasMoreImages = thumbnailImages.length > maxThumbnails;
  const visibleThumbnails = hasMoreImages
    ? thumbnailImages.slice(0, maxThumbnails - 1)
    : thumbnailImages;
  const remainingCount = hasMoreImages
    ? thumbnailImages.length - (maxThumbnails - 1)
    : 0;

  const currentMainImage = allImageUrls[currentMainImageIndex] || primaryImage;

  if (isLoading) {
    return (
      <Box variant="center" className="w-full">
        <Box variant="container" className="px-0">
          <Box
            variant="column"
            className="w-full items-center md:items-start md:flex-row gap-3"
          >
            <Box className="w-full md:w-[60%] lg:w-[70%] xl:w-[75%]">
              <Skeleton className="w-full aspect-video sm:aspect-[4/3] rounded-md max-h-[300px] sm:max-h-[400px] md:max-h-[520px]" />
            </Box>

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
        {/* Mobile Layout Enhanced */}
        <div className="md:hidden w-full">
          <div className="relative w-full group">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            
            <div
              className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border-2 border-slate-200 group-hover:border-[#198341] transition-all duration-300"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] z-10"></div>
              
              <Image
                src={currentMainImage || '/placeholder.svg'}
                alt="Car"
                fill
                sizes="100vw"
                className="object-cover cursor-pointer"
                onClick={() => openCarousel(currentMainImageIndex)}
                priority
              />

              {/* Navigation Arrows - Enhanced */}
              {allImageUrls.length > 1 && (
                <>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 group/arrow">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover/arrow:opacity-40 transition-opacity duration-300 rounded-full"></div>
                    
                    <button
                    title='Previous Image'
                      onClick={(e) => {
                        e.stopPropagation();
                        goToPrevMainImage();
                      }}
                      className="relative p-2 bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white rounded-full backdrop-blur-sm hover:from-[#2C3C39] hover:to-[#198341] transition-all duration-300 z-10 shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="absolute right-2 top-1/2 -translate-y-1/2 group/arrow">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-[#ABDE3B] blur-md opacity-0 group-hover/arrow:opacity-40 transition-opacity duration-300 rounded-full"></div>
                    
                    <button
                    title='Next Image'
                      onClick={(e) => {
                        e.stopPropagation();
                        goToNextMainImage();
                      }}
                      className="relative p-2 bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white rounded-full backdrop-blur-sm hover:from-[#2C3C39] hover:to-[#198341] transition-all duration-300 z-10 shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}

              {/* Image Counter - Enhanced */}
              <div className="absolute bottom-3 right-3 bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm font-bold shadow-lg">
                {currentMainImageIndex + 1} / {allImageUrls.length}
              </div>

              {/* Fullscreen icon - Enhanced */}
              <div className="absolute top-3 right-3 group/fullscreen">
                <div className="absolute inset-0 bg-[#ABDE3B] blur-md opacity-0 group-hover/fullscreen:opacity-40 transition-opacity duration-300 rounded-full"></div>
                
                <button
                title='Open Carousel'
                  onClick={() => openCarousel(currentMainImageIndex)}
                  className="relative p-2 bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white rounded-full backdrop-blur-sm hover:from-[#2C3C39] hover:to-[#198341] transition-all duration-300 shadow-lg"
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
              
              {/* Side accent indicators */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-20 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-500 rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-20 bg-gradient-to-b from-[#ABDE3B] to-[#198341] transition-all duration-500 rounded-l-full"></div>
            </div>

            {/* Dot indicators - Enhanced */}
            {allImageUrls.length > 1 && (
              <div className="flex justify-center mt-3 gap-2">
                {allImageUrls.map((_, index) => (
                  <button
                  title='Select Image'
                    key={index}
                    onClick={() => setCurrentMainImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentMainImageIndex
                        ? 'bg-gradient-to-r from-[#198341] to-[#ABDE3B] w-6'
                        : 'bg-gray-300 hover:bg-[#198341]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout - Enhanced */}
        <Box
          variant="column"
          className="w-full items-center md:items-start md:flex-row gap-3 hidden md:flex"
        >
          {/* Main Image - Enhanced */}
          <Box className="w-full md:w-[60%] lg:w-[70%] xl:w-[75%] relative group">
            {/* Outer glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-md opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            
            <div className="relative border-2 border-slate-200 group-hover:border-[#198341] rounded-md overflow-hidden transition-all duration-300">
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] z-10"></div>
              
              <Image
                src={primaryImage || '/placeholder.svg'}
                alt="Car"
                width={700}
                height={500}
                className="w-full rounded-md cursor-pointer object-contain max-h-[300px] sm:max-h-[400px] md:max-h-[520px]"
                onClick={() => openCarousel(allImageUrls.indexOf(primaryImage))}
              />
              
              {/* Side accent indicators */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-32 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-500 rounded-r-full"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-32 bg-gradient-to-b from-[#ABDE3B] to-[#198341] transition-all duration-500 rounded-l-full"></div>
            </div>
          </Box>

          {/* Thumbnails - Enhanced */}
          <Box
            variant="center"
            className="w-full md:w-[40%] lg:w-[30%] xl:w-[25%] mt-2 md:mt-0"
          >
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-2 w-full">
              {visibleThumbnails.map((src, index) => (
                <div
                  key={index}
                  className="w-full aspect-square relative overflow-hidden rounded-md group"
                >
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-md opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
                  
                  <div className="relative w-full h-full border-2 border-slate-200 group-hover:border-[#198341] rounded-md overflow-hidden transition-all duration-300">
                    <Image
                      src={src || '/placeholder.svg'}
                      alt="Car Thumbnail"
                      fill
                      sizes="(max-width: 640px) calc(33.33vw - 16px), (max-width: 768px) calc(25vw - 16px), (max-width: 1024px) calc(20vw - 16px), (max-width: 1280px) calc(10vw - 16px), calc(12.5vw - 16px)"
                      className="cursor-pointer object-cover group-hover:scale-110 transition-transform duration-300"
                      onClick={() => openCarousel(allImageUrls.indexOf(src))}
                    />
                    
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#198341]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              ))}

              {/* More Images Indicator - Enhanced */}
              {hasMoreImages && (
                <div className="relative w-full aspect-square rounded-md overflow-hidden group">
                  {/* Glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-md opacity-0 group-hover:opacity-30 blur transition-opacity duration-300"></div>
                  
                  <div className="relative w-full h-full border-2 border-slate-200 group-hover:border-[#198341] rounded-md overflow-hidden transition-all duration-300">
                    <Image
                      src={
                        thumbnailImages[maxThumbnails - 1] ||
                        '/assets/images/car-card.png'
                      }
                      alt="More Cars"
                      fill
                      sizes="(max-width: 640px) calc(33.33vw - 16px), (max-width: 768px) calc(25vw - 16px), (max-width: 1024px) calc(20vw - 16px), (max-width: 1280px) calc(10vw - 16px), calc(12.5vw - 16px)"
                      className="cursor-pointer object-cover"
                      onClick={() =>
                        openCarousel(
                          allImageUrls.indexOf(
                            thumbnailImages[maxThumbnails - 1],
                          ),
                        )
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#2C3C39]/80 to-[#198341]/80 rounded-md"></div>
                    <Text className="absolute inset-0 flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold">
                      +{remainingCount}
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </Box>
        </Box>
      </Box>

      {/* Image Carousel/Lightbox - Enhanced */}
      {isCarouselOpen && (
        <Box
          className="relative inset-0 bg-black bg-opacity-95 z-50 flex items-center justify-center"
          onClick={closeCarousel}
        >
          <Box
            className="w-full h-full flex items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button - Enhanced */}
            <div className="absolute top-4 right-4 z-50 group">
              <div className="absolute inset-0 bg-red-500 blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-full"></div>
              
              <button
              title='Close Carousel'
                onClick={closeCarousel}
                className="relative text-white p-2 rounded-full bg-red-500/80 hover:bg-red-600 transition-all backdrop-blur-sm shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Previous button - Enhanced */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-50 group">
              <div className="absolute inset-0 bg-[#198341] blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-full"></div>
              
              <button
              title='Previous Image'
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrevImage();
                }}
                className="relative text-white p-3 rounded-full bg-gradient-to-r from-[#198341] to-[#ABDE3B] hover:from-[#2C3C39] hover:to-[#198341] transition-all backdrop-blur-sm shadow-xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>

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

            {/* Next button - Enhanced */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 z-50 group">
              <div className="absolute inset-0 bg-[#ABDE3B] blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300 rounded-full"></div>
              
              <button
              title='Next Image'
                onClick={(e) => {
                  e.stopPropagation();
                  goToNextImage();
                }}
                className="relative text-white p-3 rounded-full bg-gradient-to-r from-[#198341] to-[#ABDE3B] hover:from-[#2C3C39] hover:to-[#198341] transition-all backdrop-blur-sm shadow-xl"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Image counter - Enhanced */}
            <Box className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-white bg-gradient-to-r from-[#198341] to-[#ABDE3B] px-4 py-2 rounded-full text-base backdrop-blur-sm font-bold shadow-xl">
              {currentImageIndex + 1} / {allImageUrls.length}
            </Box>

            {/* Mobile: Swipe hint - Enhanced */}
            <div className="md:hidden absolute bottom-16 left-1/2 transform -translate-x-1/2 text-white/70 text-sm text-center bg-black/50 px-4 py-2 rounded-full backdrop-blur-sm">
              Swipe or tap arrows to navigate
            </div>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ProductImages;