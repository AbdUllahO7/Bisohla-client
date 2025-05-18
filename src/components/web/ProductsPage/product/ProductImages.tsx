"use client"

import type React from "react"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale } from "next-intl"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

// Updated interface to match your API type
interface CarImage {
  id: number
  carListingId: number
  url: string
  isPrimary: boolean
  createdAt: string | Date // Allow both string and Date
  updatedAt?: string | Date
  [key: string]: any // Allow any additional properties
}

interface ProductImagesProps {
  isLoading?: boolean
  images?: CarImage[]
}

const ProductImages: React.FC<ProductImagesProps> = ({ isLoading = false, images = [] }) => {
  const locale = useLocale()

  // Use fallback images if no images are provided
  const fallbackImages = Array(5).fill("/assets/images/car-card.png")

  // Get the primary image or first image or fallback
  const primaryImage = images.find((img) => img?.isPrimary)?.url || images[0]?.url || "/assets/images/car-large.png"

  // All images
  const allImageUrls =
    images.length > 0 ? images.map((img) => img.url) : ["/assets/images/car-large.png", ...fallbackImages]

  const [isCarouselOpen, setIsCarouselOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isCarouselOpen) return

      if (e.key === "Escape") {
        setIsCarouselOpen(false)
      } else if (e.key === "ArrowRight") {
        goToNextImage()
      } else if (e.key === "ArrowLeft") {
        goToPrevImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Prevent scrolling when carousel is open
    if (isCarouselOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
  }, [isCarouselOpen, currentImageIndex])

  const openCarousel = (index: number) => {
    setCurrentImageIndex(index)
    setIsCarouselOpen(true)
  }

  const closeCarousel = () => {
    setIsCarouselOpen(false)
  }

  const goToNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImageUrls.length - 1 ? 0 : prev + 1))
  }

  const goToPrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImageUrls.length - 1 : prev - 1))
  }

  // Determine which images to show as thumbnails (skip the primary image)
  const thumbnailImages =
    images.length > 0 ? images.filter((img) => img.url !== primaryImage).map((img) => img.url) : fallbackImages

  // Add a "more images" indicator if there are more than what we show
  const maxThumbnails = 5
  const hasMoreImages = thumbnailImages.length > maxThumbnails
  const visibleThumbnails = hasMoreImages ? thumbnailImages.slice(0, maxThumbnails - 1) : thumbnailImages
  const remainingCount = hasMoreImages ? thumbnailImages.length - (maxThumbnails - 1) : 0

  // Render skeleton loading state
  if (isLoading) {
    return (
      <Box variant="center" className="w-full">
        <Box variant="container" className="px-0">
          <Box variant="column" className="w-full items-center md:items-start md:flex-row gap-3">
            {/* Main Image Skeleton */}
            <Box className="w-full md:w-[60%] lg:w-[70%] xl:w-[75%]">
              <Skeleton className="w-full aspect-video sm:aspect-[4/3] rounded-md max-h-[300px] sm:max-h-[400px] md:max-h-[520px]" />
            </Box>

            {/* Thumbnails Skeletons */}
            <Box variant="center" className="w-full md:w-[40%] lg:w-[30%] xl:w-[25%] mt-2 md:mt-0">
              <Box variant="row" className="flex-wrap justify-center md:justify-start w-full gap-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="w-[70px] h-[70px] sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md" />
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    )
  }

  return (
    <Box variant="center" className="w-full">
      <Box variant="container" className="px-0">
        <Box variant="column" className="w-full items-center md:items-start md:flex-row gap-3">
          {/* Main Image */}
          <Box className="w-full md:w-[60%] lg:w-[70%] xl:w-[75%]">
            <Image
              src={primaryImage || "/placeholder.svg"}
              alt="Car"
              width={700}
              height={500}
              className="w-full rounded-md cursor-pointer object-contain max-h-[300px] sm:max-h-[400px] md:max-h-[520px]"
              onClick={() => openCarousel(allImageUrls.indexOf(primaryImage))}
            />
          </Box>

          {/* Thumbnails */}
          <Box variant="center" className="w-full md:w-[40%] lg:w-[30%] xl:w-[25%] mt-2 md:mt-0">
            <Box variant="row" className="flex-wrap justify-center md:justify-start w-full gap-2">
              {visibleThumbnails.map((src, index) => (
                <div
                  key={index}
                  className="w-[70px] h-[70px] sm:w-20 sm:h-20 md:w-24 md:h-24 relative overflow-hidden rounded-md"
                >
                  <Image
                    src={src || "/placeholder.svg"}
                    alt="Car Thumbnail"
                    fill
                    sizes="(max-width: 640px) 70px, (max-width: 768px) 80px, 96px"
                    className="rounded-md cursor-pointer object-cover"
                    onClick={() => openCarousel(allImageUrls.indexOf(src))}
                  />
                </div>
              ))}

              {/* More Images Indicator */}
              {hasMoreImages && (
                <div className="relative w-[70px] h-[70px] sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-md overflow-hidden">
                  <Image
                    src={thumbnailImages[maxThumbnails - 1] || "/assets/images/car-card.png"}
                    alt="More Cars"
                    fill
                    sizes="(max-width: 640px) 70px, (max-width: 768px) 80px, 96px"
                    className="rounded-md cursor-pointer object-cover"
                    onClick={() => openCarousel(allImageUrls.indexOf(thumbnailImages[maxThumbnails - 1]))}
                  />
                  <div className="absolute inset-0 bg-black opacity-50 rounded-md"></div>
                  <Text className="absolute inset-0 flex items-center justify-center text-white text-lg sm:text-xl md:text-2xl font-bold">
                    +{remainingCount}
                  </Text>
                </div>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Image Carousel/Lightbox */}
      {isCarouselOpen && (
        <Box
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeCarousel} // Add click handler to the background
        >
          <Box
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // Prevent clicks on content from closing
          >
            {/* Close button */}
            <button
              onClick={closeCarousel}
              className="absolute top-2 right-2 md:top-4 md:right-4 text-white z-50 p-1 md:p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
            >
              <X size={20} className="md:h-6 md:w-6" />
            </button>

            {/* Previous button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToPrevImage()
              }}
              className="absolute left-2 md:left-4 text-white z-50 p-1 md:p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft size={20} className="md:h-6 md:w-6" />
            </button>

            {/* Current image */}
            <Box
              className="relative w-full h-full flex items-center justify-center p-2 md:p-0"
              onClick={(e) => e.stopPropagation()} // Prevent image clicks from closing
            >
              <Image
                src={allImageUrls[currentImageIndex] || "/placeholder.svg"}
                alt={`Image ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-[80vh] max-w-[90vw] md:max-h-[90vh] md:max-w-[95vw] object-contain"
              />
            </Box>

            {/* Next button */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                goToNextImage()
              }}
              className="absolute right-2 md:right-4 text-white z-50 p-1 md:p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
            >
              <ChevronRight size={20} className="md:h-6 md:w-6" />
            </button>

            {/* Image counter */}
            <Box className="absolute bottom-2 md:bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-2 py-1 md:px-4 md:py-2 rounded-full text-sm md:text-base">
              {currentImageIndex + 1} / {allImageUrls.length}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ProductImages
