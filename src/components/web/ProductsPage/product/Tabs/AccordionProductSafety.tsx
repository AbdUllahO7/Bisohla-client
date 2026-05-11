"use client"

import Box from "@/components/ui/box"
import Text from "@/components/ui/text"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { useLocale, useTranslations } from "next-intl"
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
  const locale = useLocale()

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
        categories.map((category, categoryIndex) => (
          <Box key={category} variant="column" className="mb-8 w-[90%] justify-start items-start relative">
            {/* Enhanced category header with gradient */}
            <Box className="relative border-b-2 border-[#198341]/30 pb-3 mb-6 mx-6 w-full group">
              {/* Gradient underline that expands on hover */}
              <div className="absolute bottom-0 left-0 w-0 group-hover:w-full h-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] transition-all duration-500"></div>
              
              {/* Side accent indicator */}
              <div className="absolute left-0 top-0 w-1 h-0 group-hover:h-full bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-500 rounded-r-full"></div>
              
              <div className="flex items-center gap-3 pl-4">
                {/* Category indicator dot */}
                <div className="relative">
                  <div className="absolute inset-0 bg-[#ABDE3B] blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                  <div className="relative w-2 h-8 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full"></div>
                </div>
                
                <div>
                  <Text variant="large" className="font-bold text-[#2C3C39] group-hover:text-[#198341] capitalize tracking-wide transition-colors duration-300">
                    {t(`tabs.features.categories.${category.toLowerCase()}`)}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1 group-hover:text-[#198341] transition-colors duration-300">
                    {categorizedFeatures[category].length} {categorizedFeatures[category].length === 1 ? 'feature' : 'features'}
                  </Text>
                </div>
              </div>
            </Box>

            {/* Enhanced features grid */}
            <Box variant="row" className="flex-wrap gap-4 mx-6">
              {categorizedFeatures[category].map((featureItem) => (
                <div
                  key={`${featureItem.carListingId}-${featureItem.feature.id}`}
                  className="relative group/feature"
                >
                  {/* Outer glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-xl opacity-0 group-hover/feature:opacity-20 blur transition-opacity duration-300"></div>
                  
                  <Box
                    className="relative flex items-center bg-white p-3 rounded-xl shadow-sm border-2 border-slate-200 hover:border-[#198341] hover:shadow-lg transition-all duration-300 w-62 h-12 overflow-hidden"
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 to-[#ABDE3B]/5 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Left side indicator */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover/feature:h-8 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full"></div>
                    
                    {/* Checkbox with enhanced styling */}
                    <div className="relative mr-3 ml-1">
                      {/* Glow effect behind checkbox */}
                      <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover/feature:opacity-30 transition-opacity duration-300"></div>
                      
                      <Checkbox
                        id={`feature-${featureItem.carListingId}-${featureItem.feature.id}`}
                        checked={true}
                        onCheckedChange={() => {}}
                        className="relative h-5 w-5 border-2 border-[#198341] data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-[#198341] data-[state=checked]:to-[#198341] data-[state=checked]:border-[#198341] transition-all duration-300 shadow-sm group-hover/feature:scale-110"
                      />
                    </div>

                    <Label
                      htmlFor={`feature-${featureItem.carListingId}-${featureItem.feature.id}`}
                      className="relative z-10 text-sm max-w-[500px] font-medium text-[#2C3C39] truncate group-hover/feature:text-[#198341] group-hover/feature:font-semibold transition-all duration-300 cursor-pointer"
                    >
                      {typeof featureItem.feature.name === 'object' 
                        ? (featureItem.feature.name[locale] || Object.values(featureItem.feature.name)[0] || '')
                        : featureItem.feature.name}
                    </Label>
                    
                    {/* Top accent line that expands on hover */}
                    <div className="absolute top-0 left-0 w-0 group-hover/feature:w-full h-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] transition-all duration-300"></div>
                  </Box>
                </div>
              ))}
            </Box>
          </Box>
        ))
      ) : (
        <Box className="text-center py-12 mx-6 relative">
          {/* No features state with enhanced design */}
          <div className="relative inline-block">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#ABDE3B] blur-2xl opacity-20"></div>
            
            <div className="relative bg-gradient-to-br from-[#198341]/10 to-[#ABDE3B]/10 rounded-2xl p-8 border-2 border-[#198341]/30">
              {/* Icon */}
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#198341] to-[#ABDE3B] rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              
              <Text variant="mid" className="text-[#2C3C39] font-bold mb-2">No Features Available</Text>
              <Text className="text-sm text-gray-600">No additional features have been added to this listing yet.</Text>
            </div>
          </div>
        </Box>
      )}
    </Box>
  )
}

export default AccordionProductSafety