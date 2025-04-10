'use client'
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Text from "@/components/text/text";
import { useAddProductStepThree } from "./hooks";
import CarConditionTable from "./CarConditionTable";
import CarPhotosSection from "./CarPhotosSection";

interface AddProductStepThreeProps {
  onValidationChange: (isValid: boolean) => void;
}

/**
 * Step Three of Add Product form - Car Condition and Photos
 */
const AddProductStepThree: React.FC<AddProductStepThreeProps> = ({ onValidationChange }) => {
  const {
    isClient,
    direction,
    labels,
    options,
    carCondition,
    isFormDisabled,
    setIsFormDisabled,
    coverImageRef,
    carImagesRef,
    documentsRef,
    additionalImagesRef,
    handleSectionStatusChange,
    isStatusSelected,
    handleCoverImageChange,
    handleCarImagesChange,
    handleDocumentsChange,
    handleAdditionalImagesChange
  } = useAddProductStepThree(onValidationChange);

  // Don't render full content during SSR to avoid hydration issues
  if (!isClient) {
    return (
      <div className="w-full space-y-6">
        <Card className="w-full shadow-sm">
          <CardHeader className="bg-gray-100 py-4">
            <Text className="text-xl font-bold text-primary text-center">Loading...</Text>
          </CardHeader>
          <CardContent className="p-0 h-60 flex items-center justify-center">
            <div className="animate-pulse">Loading car condition data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6" dir={direction}>
      {/* Car Information Section */}
      <Card className="w-full shadow-sm bg-white border-0 ">
        <CardHeader className="bg-gray-100 py-4">
          <Text className="text-xl font-bold text-primary text-center">{labels.carInfo}</Text>
        </CardHeader>
        <CardContent className="p-0">
          <CarConditionTable 
            carSections={options.carSections}
            conditionTypes={options.conditionTypes}
            damages={carCondition.sectionStatus}
            isStatusSelected={isStatusSelected}
            onSectionStatusChange={handleSectionStatusChange}
            labels={{ carSectionName: labels.carSectionName }}
            groupedSections={options.groupedSections}
          />
        </CardContent>
      </Card>

      {/* Car Photos Section */}
      <Card className="w-full shadow-sm bg-white border-0 ">
        <CardHeader className="bg-gray-100 py-4">
          <Text className="text-xl font-bold text-primary text-center px-4">{labels.carPhotos}</Text>
        </CardHeader>
        <CardContent>
          <CarPhotosSection 
            labels={{
              coverImage: labels.coverImage,
              carImages: labels.carImages,
              documents: labels.documents,
              additionalImages: labels.additionalImages,
              oneImage: labels.oneImage,
              tenImages: labels.tenImages,
              tenFiles: labels.tenFiles
            }}
            coverImageRef={coverImageRef}
            carImagesRef={carImagesRef}
            documentsRef={documentsRef}
            additionalImagesRef={additionalImagesRef}
            coverImage={carCondition.coverImage}
            carImages={carCondition.carImages}
            documents={carCondition.documents}
            additionalImages={carCondition.additionalImages}
            onCoverImageChange={handleCoverImageChange}
            onCarImagesChange={handleCarImagesChange}
            onDocumentsChange={handleDocumentsChange}
            onAdditionalImagesChange={handleAdditionalImagesChange}
            isFormDisabled={isFormDisabled}
            setIsFormDisabled={setIsFormDisabled}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(AddProductStepThree);