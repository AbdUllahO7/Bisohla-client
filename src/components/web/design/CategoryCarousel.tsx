"use client"

import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import Image from "next/image"
import Text from "@/components/text/text"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { useSearchParams } from "next/navigation"

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

const CategoryCarousel: React.FC<CarouselComponentProps> = ({ data, direction, isLoading = false }) => {
  // Get current URL parameters to detect active category
  const searchParams = useSearchParams()
  const activeBodyType = searchParams.get("bodyType")
  
  // Determine if RTL based on direction prop
  const isRTL = direction === "rtl"

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
        // The direction option in opts controls the sliding direction
        direction: isRTL ? "rtl" : "ltr",
      }}
      className="w-full"
      dir={direction} // Set the main dir attribute based on language direction
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {isLoading
          ? // Display loading skeletons when data is loading
            Array(6)
              .fill(0)
              .map((_, index) => (
                <CarouselItem key={`skeleton-${index}`} className="pl-2 md:pl-4 xs:basis-1/2 md:basis-1/4 lg:basis-1/6">
                  <div className="p-1">
                    <Card className="bg-white border-none rounded-lg shadow-sm">
                      <CardContent className="flex flex-col items-center justify-center p-4 h-[140px]">
                        <Skeleton className="w-12 h-12 rounded-full mb-2" />
                        <Skeleton className="h-4 w-16 mt-2" />
                        <Skeleton className="h-3 w-12 mt-1" />
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))
          : // Display actual data when loaded
            data.map((item, index) => {
              // Check if this category is active
              const isActive = activeBodyType === item.value

              return (
                <CarouselItem key={index} className="pl-2 md:pl-4 xs:basis-1/2 md:basis-1/4 lg:basis-1/6">
                  <Link href={`/products?bodyType=${item.value}`} className="block">
                    <Card
                      className={`
                      border-none rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer
                      ${isActive ? "bg-white border-primary" : "bg-white"}
                    `}
                    >
                      <CardContent className="flex flex-col items-center justify-center p-4 h-[140px]">
                        <div className="w-12 h-12 mb-2 flex items-center justify-center">
                          <Image
                            src={item.image || "/placeholder.svg"}
                            alt={`${item.title} image`}
                            width={48}
                            height={48}
                            className="object-contain"
                          />
                        </div>
                        <Text variant="mid" className={`font-cairo font-bold text-primary text-center`}>
                          {item.title}
                        </Text>
                        <Text variant="small" className="text-gray-500 text-center mt-1" dir={direction}>
                          {item.carCount} {isRTL ? "سيارات" : "cars"}
                        </Text>
                      </CardContent>
                    </Card>
                  </Link>
                </CarouselItem>
              )
            })}
      </CarouselContent>
      {/* Conditionally swap positions for RTL */}
      {isRTL ? (
        <>
         <CarouselPrevious className="left-0 bg-white shadow-md " />
          <CarouselNext className="right-0 bg-white shadow-md " />
        </>
      ) : (
        <>
              <CarouselNext className="left-0 right-auto bg-white shadow-md " />
          <CarouselPrevious className="right-0 left-auto bg-white shadow-md " />
        </>
      )}
    </Carousel>
  )
}

export default CategoryCarousel