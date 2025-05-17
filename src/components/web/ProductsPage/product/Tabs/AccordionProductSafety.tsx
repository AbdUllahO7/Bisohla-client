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

  // Render skeleton loading state
  if (isLoading) {
    return (
      <Box variant="column" className="w-full">
        {Array.from({ length: 2 }).map((_, categoryIndex) => (
          <Box
            key={`skeleton-category-${categoryIndex}`}
            variant="column"
            className="mb-6 w-full justify-start items-start"
          >
            <Box className="border-b pb-2 mb-4 mr-5 ml-5">
              <Skeleton className="h-6 w-48" />
            </Box>

            <Box variant="row" className="flex-wrap gap-3 mr-5 ml-5">
              {Array.from({ length: 6 }).map((_, featureIndex) => (
                <Skeleton key={`skeleton-feature-${categoryIndex}-${featureIndex}`} className="h-10 w-48 rounded-lg" />
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
          <Box key={category} variant="column" className="mb-6 w-full justify-start items-start">
            <Box className="border-b pb-2 mb-4 mr-5 ml-5">
              <Text variant="large" className="font-bold text-primary capitalize">
                {t(`tabs.features.categories.${category.toLowerCase()}`)}
              </Text>
            </Box>

            <Box variant="row" className="flex-wrap gap-3 mr-5 ml-5">
              {categorizedFeatures[category].map((featureItem) => (
                <Box
                  key={`${featureItem.carListingId}-${featureItem.feature.id}`}
                  className="flex items-center bg-white p-2 rounded-lg shadow-sm w-48 h-10"
                >
                  <Checkbox
                    id={`feature-${featureItem.carListingId}-${featureItem.feature.id}`}
                    checked={true}
                    onCheckedChange={() => {}}
                    className="mr-2 h-4 w-4"
                  />

                  <Label
                    htmlFor={`feature-${featureItem.carListingId}-${featureItem.feature.id}`}
                    className="text-xs font-medium truncate"
                  >
                    {featureItem.feature.name}
                  </Label>
                </Box>
              ))}
            </Box>
          </Box>
        ))
      ) : (
        <Box className="text-center py-4">
          {/* <Text variant="mid">{t('features.noFeatures', { fallback: 'No features available' })}</Text> */}
        </Box>
      )}
    </Box>
  )
}

export default AccordionProductSafety
