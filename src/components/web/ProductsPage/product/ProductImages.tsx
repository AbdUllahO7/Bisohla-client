"use client"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { useLocale } from "next-intl"
import Image from "next/image"
import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

// Updated interface to match your API type
interface CarImage {
  id: number;
  carListingId: number;
  url: string;
  isPrimary: boolean;
  createdAt: string | Date;  // Allow both string and Date
  updatedAt?: string | Date;
  [key: string]: any;  // Allow any additional properties
}

interface ProductImagesProps {
  images?: CarImage[];
}

const ProductImages: React.FC<ProductImagesProps> = ({ images = [] }) => {
  const locale = useLocale()
  
  // Use fallback images if no images are provided
  const fallbackImages = Array(5).fill("/assets/images/car-card.png")
  
  // Get the primary image or first image or fallback
  const primaryImage = images.find(img => img?.isPrimary)?.url || 
                    images[0]?.url || 
                    "/assets/images/car-large.png"
  
  // All images
  const allImageUrls = images.length > 0 
    ? images.map(img => img.url) 
    : ["/assets/images/car-large.png", ...fallbackImages]

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
  const thumbnailImages = images.length > 0 
    ? images.filter(img => img.url !== primaryImage).map(img => img.url)
    : fallbackImages
  
  // Add a "more images" indicator if there are more than what we show
  const maxThumbnails = 5
  const hasMoreImages = thumbnailImages.length > maxThumbnails
  const visibleThumbnails = hasMoreImages ? thumbnailImages.slice(0, maxThumbnails - 1) : thumbnailImages
  const remainingCount = hasMoreImages ? thumbnailImages.length - (maxThumbnails - 1) : 0

  return (
    <Box variant="center" className="w-full">
      <Box variant="container" className="pl-0 pr-0">
        <Box variant="row" className="w-full items-start justify-center gap-2 lg:flex-nowrap xs:flex-wrap">
          {/* Main Image */}
          <Box className="xs:w-[90%] xl:w-[80%]">
            <Image
              src={primaryImage}
              alt="Car"
              width={400}
              height={500}
              className="w-full h-full rounded-md cursor-pointer max-w-[700px] max-h-[520px]"
              onClick={() => openCarousel(allImageUrls.indexOf(primaryImage))}
            />
          </Box>
          
          {/* Thumbnails */}
          <Box variant="center" className="relative justify-start items-start lg:w-[40%]">
            <Box variant="column" className="items-center lg:w-full xs:w-[90%]">
              <Box variant="row" className="flex-wrap lg:justify-start xs:justify-center w-full gap-2">
                {visibleThumbnails.map((src, index) => (
                  <Image
                    key={index}
                    src={src || "/placeholder.svg"}
                    alt="Car Thumbnail"
                    width={index === 0 ? 650 : 100}
                    height={index === 0 ? 450 : 100}
                    className={`rounded-md cursor-pointer object-contain  ${index === 0 ? 'max-w-[100%] max-h-[520px]' : 'w-24 h-24'}`}
                    onClick={() => openCarousel(allImageUrls.indexOf(src))}
                  />
                ))}

                {/* More Images Indicator */}
                {hasMoreImages && (
                  <Box className="relative">
                    <Image
                      src={thumbnailImages[maxThumbnails - 1] || "/assets/images/car-card.png"}
                      alt="More Cars"
                      width={100}
                      height={100}
                      className="rounded-md cursor-pointer w-24 h-24"
                      onClick={() => openCarousel(allImageUrls.indexOf(thumbnailImages[maxThumbnails - 1]))}
                    />
                    <div className="absolute inset-0 bg-black opacity-50 rounded-md"></div>
                    <Text className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                      +{remainingCount}
                    </Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Image Carousel/Lightbox */}
      {isCarouselOpen && (
        <Box className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <Box className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeCarousel}
              className="absolute top-4 right-4 text-white z-50 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
            >
              <X size={24} />
            </button>

            {/* Previous button */}
            <button
              onClick={goToPrevImage}
              className="absolute left-4 text-white z-50 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
            >
              <ChevronLeft size={24} />
            </button>

            {/* Current image */}
            <Box className="relative w-full h-full flex items-center justify-center">
              <Image
                src={allImageUrls[currentImageIndex] || "/placeholder.svg"}
                alt={`Image ${currentImageIndex + 1}`}
                width={1200}
                height={800}
                className="max-h-[90vh] max-w-[95vw] object-contain"
              />
            </Box>

            {/* Next button */}
            <button
              onClick={goToNextImage}
              className="absolute right-4 text-white z-50 p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-all"
            >
              <ChevronRight size={24} />
            </button>

            {/* Image counter */}
            <Box className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full">
              {currentImageIndex + 1} / {allImageUrls.length}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  )
}

export default ProductImages