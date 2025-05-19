"use client"
import React, { useEffect, useRef } from "react"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import Text from "@/components/text/text"
import { useAddProductStepThree } from "./hooks"
import CarConditionTable from "./CarConditionTable"
import CarPhotosSection from "./CarPhotosSection"
import type { AddProductStepThreeProps } from "./types"

/**
 * Step Three of Add Product form - Car Condition and Photos
 */
const AddProductStepThree: React.FC<AddProductStepThreeProps> = ({
  onValidationChange,
  isEditMode = false,
  initialData = null,
}) => {
  const {
    isClient,
    direction,
    labels,
    options,
    carCondition,
    setIsFormDisabled,
    coverImageRef,
    handleSectionStatusChange,
    isStatusSelected,
    handleCoverImageChange,
    setInitialDamages,
    isEditMode: currentEditMode, // Get edit mode status from the hook
    storageKey, // Get the current storage key
  } = useAddProductStepThree(onValidationChange, isEditMode) // Pass isEditMode prop to hook

  // Flag to track if edit data has been applied
  const editDataApplied = useRef(false)

  // Apply edit data when in edit mode
  useEffect(() => {
    if (isEditMode && initialData && initialData.data && !editDataApplied.current) {
      // Process damages data for the component
      if (initialData.data.damages && initialData.data.damages.length > 0) {
        // Create a map of damages by zone
        const damagesMap: {
          [key: string | number]: { status: any; description: string }
        } = {}

        // Transform API format to our component format
        initialData.data.damages.forEach(
          (damage: {
            damageZone: string | number
            damageType: any
            description: any
          }) => {
            if (damage.damageZone && damage.damageType) {
              // Store as object with status and description
              damagesMap[damage.damageZone] = {
                status: damage.damageType,
                description: damage.description || "",
              }
            }
          },
        )

        setInitialDamages(damagesMap)
      }

      // Set the flag to prevent reapplying
      editDataApplied.current = true
    }
  }, [isEditMode, initialData, setInitialDamages])

  // Don't render full content during SSR to avoid hydration issues
  if (!isClient) {
    return (
      <div className="  px-2 sm:px-4">
        <Card className=" shadow-sm">
          <CardHeader className="bg-gray-100 py-3 sm:py-4">
            <Text className="text-lg sm:text-xl font-bold text-primary text-center">Loading...</Text>
          </CardHeader>
          <CardContent className="p-0 h-40 sm:h-60 flex items-center justify-center">
            <div className="animate-pulse">Loading car condition data...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 container" dir={direction}>
      {/* Car Information Section */}
      <Card className="max-w-7xl shadow-sm bg-white border-0 overflow-hidden">
        <CardHeader className="bg-gray-100 py-3 sm:py-4">
          <Text className="text-lg sm:text-xl font-bold text-primary text-center">{labels.carInfo}</Text>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <div className="">
            <CarConditionTable
              carSections={options.carSections}
              conditionTypes={options.conditionTypes}
              damages={carCondition.sectionStatus}
              isStatusSelected={isStatusSelected}
              onSectionStatusChange={handleSectionStatusChange}
              labels={{ carSectionName: labels.carSectionName }}
              groupedSections={options.groupedSections}
            />
          </div>
        </CardContent>
      </Card>

      {/* Car Photos Section */}
      <Card className="max-w-7xl shadow-sm bg-white border-0">
        <CardHeader className="bg-gray-100 py-3 sm:py-4">
          <Text className="text-lg sm:text-xl font-bold text-primary text-center">{labels.carPhotos}</Text>
        </CardHeader>
        <CardContent className="p-3 sm:p-4">
          <CarPhotosSection
            labels={{
              coverImage: labels.coverImage,
              oneImage: labels.oneImage,
              tenImages: labels.tenImages,
              tenFiles: labels.tenFiles,
            }}
            coverImageRef={coverImageRef}
            coverImage={carCondition.coverImage}
            onCoverImageChange={handleCoverImageChange}
            setIsFormDisabled={setIsFormDisabled}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(AddProductStepThree)
