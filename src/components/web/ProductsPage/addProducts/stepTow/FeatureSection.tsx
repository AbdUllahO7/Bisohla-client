'use client'
import React from "react";
import Text from "@/components/text/text";
import { Checkbox } from "@/components/ui/checkbox";
import { GroupedFeatures, CarInfoState } from "./types";
import { SelectFeatureDto } from "@/core/entities/models/cars/cars.dto";

interface FeatureSectionProps {
  isLoading: boolean;
  featureCategories: GroupedFeatures;
  selectedFeatures: CarInfoState['selectedFeatures'];
  allFeatures: SelectFeatureDto[];
  labels: {
    loading: string;
    noFeatures: string;
  };
  onFeatureToggle: (featureId: string, category: string) => void;
}

/**
 * Feature section component to display and select features
 */
const FeatureSection: React.FC<FeatureSectionProps> = ({
  isLoading,
  featureCategories,
  selectedFeatures,
  allFeatures,
  labels,
  onFeatureToggle,
}) => {
  // Helper to check if a feature is selected
  const isFeatureSelected = React.useCallback(
    (featureId: string) => {
      return selectedFeatures.some(feature => 
        feature.featureId === featureId
      );
    },
    [selectedFeatures]
  );

  if (isLoading) {
    return (
      <div className="p-5 text-center">
        <Text className="text-primary">{labels.loading}</Text>
      </div>
    );
  }
  
  // Check if we have any features
  if (allFeatures.length === 0) {
    return (
      <div className="p-5 text-center">
        <Text>{labels.noFeatures}</Text>
      </div>
    );
  }
  
  // Get unique categories from features
  const categories = Object.entries(featureCategories);
  
  if (categories.length === 0) {
    return (
      <div className="p-5 text-center">
        <Text>{labels.noFeatures}</Text>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
      {categories.map(([categoryKey, categoryData]) => (
        <div key={categoryKey} className="flex flex-col items-start gap-3">
          <Text className="text-primary text-xl font-bold mb-2">{categoryData.label}</Text>
          <div className="space-y-3 w-full">
            {categoryData.features.map((feature) => (
              <div key={feature.id} className="flex items-center gap-2">
                <Checkbox
                  id={feature.id}
                  checked={isFeatureSelected(feature.id)}
                  onCheckedChange={() => onFeatureToggle(feature.id, categoryKey)}
                />
                <label
                  htmlFor={feature.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {feature.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(FeatureSection);