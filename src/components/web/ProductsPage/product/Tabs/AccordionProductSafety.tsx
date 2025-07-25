"use client"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useTranslations } from "next-intl"
import type React from "react"
import { useMemo } from "react"

// Define TypeScript interfaces for the feature data structure
interface FeatureDetails {
  category: string
  createdAt: string
  deletedAt: null | string
  icon: string
  id: number
  name: string
  updatedAt: string
}

interface FeatureItem {
  carListingId: number
  feature: FeatureDetails
}

// Define props interface for the component
interface AccordionProductSafetyProps {
  features?: FeatureItem[]
  isLoading?: boolean
}

const AccordionProductSafety: React.FC<AccordionProductSafetyProps> = ({ features = [], isLoading = false }) => {
  const t = useTranslations("product")

  // Group features by category
  const categorizedFeatures = useMemo(() => {
    const grouped: Record<string, FeatureItem[]> = {}

    features.forEach((featureItem) => {
      const category = featureItem.feature.category
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(featureItem)
    })

    return grouped
  }, [features])

  // Get all unique categories
  const categories = Object.keys(categorizedFeatures)
  const hasFeatures = categories.length > 0

  // Render skeleton loading state with subtle improvements
  if (isLoading) {
    return (
      <Box variant="column" className="w-full">
        {Array.from({ length: 2 }).map((_, categoryIndex) => (
          <Box
            key={`skeleton-category-${categoryIndex}`}
            variant="column"
            className="mb-8 w-full justify-start items-start"
          >
            <Box className="border-b border-gray-200 pb-3 mb-6 mx-6">
              <Skeleton className="h-7 w-48 rounded-lg" />
            </Box>

            <Box variant="row" className="flex-wrap gap-4 mx-6">
              {Array.from({ length: 6 }).map((_, featureIndex) => (
                <Skeleton key={`skeleton-feature-${categoryIndex}-${featureIndex}`} className="h-12 w-52 rounded-xl" />
              ))}
            </Box>
          </Box>
        ))}
      </Box>
    )
  }

  return (
    <Box variant="column" className="w-full">
      {hasFeatures ? (
        categories.map((category) => (
          <Box key={category} variant="column" className="mb-8 w-full justify-start items-start">
            {/* Enhanced category header */}
            <Box className="border-b-2 border-gray-200 pb-3 mb-6 mx-6 w-full">
              <Text variant="large" className="font-bold text-gray-800 capitalize tracking-wide">
                {t(`tabs.features.categories.${category.toLowerCase()}`)}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {categorizedFeatures[category].length} 
              </Text>
            </Box>

            {/* Enhanced features grid */}
            <Box variant="row" className="flex-wrap gap-4 mx-6">
              {categorizedFeatures[category].map((featureItem) => (
                <Box
                  key={`${featureItem.carListingId}-${featureItem.feature.id}`}
                  className="flex items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition-all duration-300 w-62 h-12 group"
                >
                  <Checkbox
                    id={`feature-${featureItem.carListingId}-${featureItem.feature.id}`}
                    checked={true}
                    onCheckedChange={() => {}}
                    className="mr-3 h-4 w-4 border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />

                  <Label
                    htmlFor={`feature-${featureItem.carListingId}-${featureItem.feature.id}`}
                    className="text-sm max-w-[500px] font-medium text-gray-700 truncate group-hover:text-green-700 transition-colors duration-200 cursor-pointer"
                  >
                    {featureItem.feature.name}
                  </Label>
                </Box>
              ))}
            </Box>
          </Box>
        ))
      ) : (
        <Box className="text-center py-8 mx-6">
          <Text variant="mid" className="text-gray-500">No features available</Text>
        </Box>
      )}
    </Box>
  )
}

export default AccordionProductSafety