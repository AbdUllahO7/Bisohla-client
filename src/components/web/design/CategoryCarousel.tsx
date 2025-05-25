"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"
import Text from "@/components/text/text"
import {Link} from "@/i18n/routing"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"
import { 
  Car, 
  Truck, 
  Bus, 
  Bike, 
  Crown, 
  Zap, 
  Mountain, 
  ChevronLeft, 
  ChevronRight,
  Sparkles
} from "lucide-react"

// Update the props interface to include the loading state
interface CategoryItem {
  title: string
  carCount: string
  image: string
  value: string
}

interface CarouselComponentProps {
  data: CategoryItem[]
  direction: string
  isLoading?: boolean
}

// Icon mapping for different car categories
const getCategoryIcon = (value: string, title: string) => {
  const lowerValue = value.toLowerCase()
  const lowerTitle = title.toLowerCase()
  
  if (lowerValue.includes('suv') || lowerTitle.includes('suv') || lowerValue.includes('crossover')) {
    return <Truck className="w-6 h-6" />
  }
  if (lowerValue.includes('truck') || lowerTitle.includes('truck') || lowerValue.includes('pickup')) {
    return <Truck className="w-6 h-6" />
  }
  if (lowerValue.includes('bus') || lowerTitle.includes('bus') || lowerValue.includes('van')) {
    return <Bus className="w-6 h-6" />
  }
  if (lowerValue.includes('bike') || lowerTitle.includes('motorcycle') || lowerValue.includes('scooter')) {
    return <Bike className="w-6 h-6" />
  }
  if (lowerValue.includes('luxury') || lowerTitle.includes('luxury') || lowerValue.includes('premium')) {
    return <Crown className="w-6 h-6" />
  }
  if (lowerValue.includes('electric') || lowerTitle.includes('electric') || lowerValue.includes('hybrid')) {
    return <Zap className="w-6 h-6" />
  }
  if (lowerValue.includes('sport') || lowerTitle.includes('sport') || lowerValue.includes('racing')) {
    return <Sparkles className="w-6 h-6" />
  }
  
  // Default car icon
  return <Car className="w-6 h-6" />
}

// Get category color based on type
const getCategoryColor = (value: string, title: string) => {
  return 'from-primary to-primary-light'
}

const CategoryCarousel: React.FC<CarouselComponentProps> = ({ data, direction, isLoading = false }) => {
  // Get current URL parameters to detect active category
  const searchParams = useSearchParams()
  const activeBodyType = searchParams.get("bodyType")
  
  // Determine if RTL based on direction prop
  const isRTL = direction === "rtl"

  return (
    <div className="relative w-full">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          direction: isRTL ? "rtl" : "ltr",
        }}
        className="w-full"
        dir={direction}
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {isLoading
            ? // Enhanced loading skeletons
              Array(6)
                .fill(0)
                .map((_, index) => (
                  <CarouselItem key={`skeleton-${index}`} className="pl-2 md:pl-4 xs:basis-1/2 md:basis-1/4 lg:basis-1/6">
                    <div className="p-1">
                      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl shadow-sm">
                        <CardContent className="flex flex-col items-center justify-center p-6 h-[160px]">
                          <div className="relative">
                            <Skeleton className="w-16 h-16 rounded-full mb-4 bg-gradient-to-r from-gray-200 to-gray-300" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse rounded-full" />
                          </div>
                          <Skeleton className="h-4 w-20 mb-2 bg-gradient-to-r from-gray-200 to-gray-300" />
                          <Skeleton className="h-3 w-16 bg-gradient-to-r from-gray-200 to-gray-300" />
                        </CardContent>
                      </Card>
                    </div>
                  </CarouselItem>
                ))
            : // Enhanced category cards
              data.map((item, index) => {
                const isActive = activeBodyType === item.value
                const categoryIcon = getCategoryIcon(item.value, item.title)
                const categoryColor = getCategoryColor(item.value, item.title)

                return (
                  <CarouselItem key={index} className="pl-2 md:pl-4 xs:basis-1/2 md:basis-1/4 lg:basis-1/6">
                    <Link href={`/products?bodyType=${item.value}`} className="block group">
                      <Card
                        className={`
                          relative overflow-hidden rounded-xl shadow-md hover:shadow-xl 
                          transition-all duration-300 cursor-pointer transform hover:scale-105
                          border-2 group-hover:border-opacity-50
                          ${isActive 
                            ? `border-primary-light bg-gradient-to-br from-blue-50 to-white shadow-lg  ` 
                            : `border-gray-200 bg-white hover:border-gray-300`
                          }
                        `}
                      >
                        {/* Background decoration */}
                        <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${categoryColor} opacity-10 rounded-full transform translate-x-8 -translate-y-8`} />
                        
                        <CardContent className="relative flex flex-col items-center justify-center p-6 h-[160px]">
                          {/* Icon container with gradient background */}
                          <div className={`
                            relative w-16 h-16 mb-4 rounded-full bg-gradient-to-br ${categoryColor} 
                            flex items-center justify-center shadow-lg group-hover:shadow-xl
                            transition-all duration-300 group-hover:scale-110
                            ${isActive ? 'ring-2 ring-offset-2 ring-primary-light' : ''}
                          `}>
                            <div className="text-white">
                              {categoryIcon}
                            </div>
                            
                            {/* Shine effect */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          {/* Category title */}
                          <Text 
                            variant="mid" 
                            className={`
                              font-cairo font-bold text-center leading-tight mb-2
                              transition-colors duration-300
                              ${isActive ? 'text-primary' : 'text-gray-800 group-hover:text-gray-900'}
                            `}
                          >
                            {item.title}
                          </Text>

                          {/* Car count with enhanced styling */}
                          <div className={`
                            px-3 py-1 rounded-full text-xs font-medium transition-all duration-300
                            ${isActive 
                              ? 'bg-blue-100 text-primary' 
                              : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                            }
                          `}>
                            <Text variant="small" className="font-semibold" dir={direction}>
                              {item.carCount} {isRTL ? "سيارات" : "cars"}
                            </Text>
                          </div>

                          {/* Active indicator */}
                          {isActive && (
                            <div className="absolute top-3 right-3 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                )
              })}
        </CarouselContent>

        {/* Enhanced navigation arrows */}
        {isRTL ? (
          <>
            <CarouselPrevious className={`
              left-2 bg-white/90 hover:bg-transparent hover:text-black  shadow-lg hover:shadow-xl 
              border border-gray-200 hover:border-gray-300 transition-all duration-300
              w-10 h-10 rounded-full backdrop-blur-sm
              hover:scale-110 active:scale-95
            `}>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </CarouselPrevious>
            <CarouselNext className={`
              right-2 bg-white/90 hover:bg-transparent hover:text-black shadow-lg hover:shadow-xl 
              border border-gray-200 hover:border-gray-300 transition-all duration-300
              w-10 h-10 rounded-full backdrop-blur-sm
              hover:scale-110 active:scale-95
            `}>
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </CarouselNext>
          </>
        ) : (
          <>
            <CarouselNext className={`
              -right-2 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl 
              border border-gray-200 hover:border-gray-300 transition-all duration-300
              w-10 h-10 rounded-full backdrop-blur-sm
              hover:scale-110 active:scale-95
            `}>
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </CarouselNext>
            <CarouselPrevious className={`
              -left-2 bg-white/90 hover:bg-white shadow-lg hover:shadow-xl 
              border border-gray-200 hover:border-gray-300 transition-all duration-300
              w-10 h-10 rounded-full backdrop-blur-sm
              hover:scale-110 active:scale-95
            `}>
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </CarouselPrevious>
          </>
        )}
      </Carousel>
    </div>
  )
}

export default CategoryCarousel