'use client'
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Text from "@/components/text/text";
import { AddProductStepTwoProps } from "./types";
import { useAddProductStepTwo } from "./hooks";
import CarInfoForm from "./CarInfoForm";
import FeatureSection from "./FeatureSection";

/**
 * AddProductStepTwo component for car information and features
 */
const AddProductStepTwo: React.FC<AddProductStepTwoProps> = ({ onValidationChange }) => {
  const {
    carInfo,
    validationErrors,
    allFeatures,
    featureCategories,
    getTranslatedCategoryName, // Make sure this is being used
    isFeaturesLoading,
    labels,
    options,
    locale,
    direction,
    handleSelectChange,
    handleTextFieldBlur,
    handleFeatureToggle,
  } = useAddProductStepTwo(onValidationChange);
  
  return (
    <div className="w-full space-y-6" dir={direction}>
      {/* Car Information Section */}
      <Card className="w-full shadow-sm bg-white  border-0">
        <CardHeader className="bg-gray-100 py-4">
          <Text className="text-xl font-bold text-primary text-center">{labels.carInfo}</Text>
        </CardHeader>
        <CardContent className="p-0">
          <CarInfoForm 
            carInfo={carInfo}
            validationErrors={validationErrors}
            labels={labels}
            options={options}
            locale={locale}
            onTextFieldBlur={handleTextFieldBlur}
            onSelectChange={handleSelectChange}
          />
        </CardContent>
      </Card>
      

      {/* Car Features Section */}
      <Card className="w-full shadow-sm bg-white border-0">
        <CardHeader className="bg-gray-100 py-4">
          <Text className="text-xl font-bold text-primary text-center">{labels.carFeatures}</Text>
        </CardHeader>
        <CardContent className="p-0">
          <FeatureSection 
            isLoading={isFeaturesLoading}
            featureCategories={featureCategories}
            selectedFeatures={carInfo.selectedFeatures}
            allFeatures={allFeatures}
            getTranslatedCategoryName={getTranslatedCategoryName} // Pass the translation function
            labels={{
              loading: labels.loading,
              noFeatures: labels.noFeatures
            }}
            onFeatureToggle={handleFeatureToggle}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(AddProductStepTwo);