'use client'
import React from "react";
import Text from "@/components/text/text";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { GroupedFeatures, CarInfoState } from "./types";
import { SelectFeatureDto } from "@/core/entities/models/cars/cars.dto";

interface FeatureSectionProps {
  isLoading: boolean;
  featureCategories: GroupedFeatures;
  selectedFeatures: CarInfoState['selectedFeatures'];
  allFeatures: SelectFeatureDto[];
  getTranslatedCategoryName: (categoryKey: string) => string; // Add this prop
  labels: {
    loading: string;
    noFeatures: string;
  };
  onFeatureToggle: (featureId: string, category: string) => void;
}

/**
 * Feature section component to display and select features in a grid layout
 */
const FeatureSection: React.FC<FeatureSectionProps> = ({
  isLoading,
  featureCategories,
  selectedFeatures,
  allFeatures,
  getTranslatedCategoryName, // Accept the translation function
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



  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="bg-gray-100 pb-3">
                <div className="h-6 bg-gray-300 rounded w-3/4"></div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded flex-1"></div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Text className="text-primary mt-4">{labels.loading}</Text>
      </div>
    );
  }
  
  // Check if we have any features
  if (allFeatures.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Text className="text-gray-500 text-lg">{labels.noFeatures}</Text>
        </div>
      </div>
    );
  }
  
  // Get unique categories from features
  const categories = React.useMemo(() => Object.entries(featureCategories), [featureCategories]);
  
  if (categories.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Text className="text-gray-500 text-lg">{labels.noFeatures}</Text>
        </div>
      </div>
    );
  }

  // State for search query
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter categories and features based on search query
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const query = searchQuery.toLowerCase().trim();
    
    return categories
      .map(([categoryKey, categoryData]) => {
        const matchingFeatures = categoryData.features.filter(feature => 
          feature.label.toLowerCase().includes(query) ||
          getTranslatedCategoryName(categoryKey).toLowerCase().includes(query)
        );
        return [categoryKey, { ...categoryData, features: matchingFeatures }] as const;
      })
      .filter(([_, categoryData]) => categoryData.features.length > 0);
  }, [categories, searchQuery, getTranslatedCategoryName]);

  // Count selected features per category
  const getSelectedCount = (categoryFeatures: any[]) => {
    return categoryFeatures.filter(feature => isFeatureSelected(feature.id)).length;
  };
  
  return (
    <div className="p-6">
      {/* Premium Search Filter Bar */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder={typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? "البحث عن ميزة (مثلاً: فتحة سقف، جلد...)" : "Search feature (e.g. sunroof, leather...)"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10 h-11 bg-white rounded-xl border border-slate-200 focus:ring-primary focus:border-primary shadow-sm text-sm"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {filteredCategories.length === 0 ? (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[250px]">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-slate-300" />
          </div>
          <Text className="text-slate-400 text-lg font-medium">
            {typeof document !== 'undefined' && document.documentElement.dir === 'rtl' ? "لم يتم العثور على ميزات مطابقة" : "No matching features found"}
          </Text>
        </div>
      ) : (
        /* Grid container for feature categories */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(([categoryKey, categoryData]) => {
            const selectedCount = getSelectedCount(categoryData.features);
            const totalCount = categoryData.features.length;
            
            return (
              <Card 
                key={categoryKey} 
                className="group hover:shadow-lg bg-white transition-all duration-300 border border-slate-100 shadow-sm overflow-hidden rounded-xl"
              >
                {/* Category Header */}
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-50/50 border-b border-slate-100 pb-3">
                  <div className="flex items-center justify-between">
                    <Text className="text-primary text-lg font-bold group-hover:text-primary-light transition-colors">
                      {getTranslatedCategoryName(categoryKey)} {/* Use the translation function */}
                    </Text>
                    {selectedCount > 0 && (
                      <div className="bg-primary text-white text-xs px-2 py-1 rounded-full font-medium">
                        {selectedCount}/{totalCount}
                      </div>
                    )}
                  </div>
                  {selectedCount > 0 && (
                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                      <div 
                        className="bg-primary h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${(selectedCount / totalCount) * 100}%` }}
                      ></div>
                    </div>
                  )}
                </CardHeader>
                
                {/* Category Features */}
                <CardContent className="pt-4 pb-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                    {categoryData.features.map((feature) => {
                      const isSelected = isFeatureSelected(feature.id);
                      
                      return (
                        <div 
                          key={feature.id} 
                          className={`flex items-center gap-3 p-2 rounded-lg transition-all duration-200 hover:bg-slate-50 ${
                            isSelected ? 'bg-primary/5 border border-primary/20' : ''
                          }`}
                        >
                          <Checkbox
                            id={feature.id}
                            checked={isSelected}
                            onCheckedChange={() => onFeatureToggle(feature.id, categoryKey)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <label
                            htmlFor={feature.id}
                            className={`text-sm font-medium leading-relaxed cursor-pointer flex-1 transition-colors ${
                              isSelected 
                                ? 'text-primary font-semibold' 
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            {feature.label}
                          </label>
                          {isSelected && (
                            <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default React.memo(FeatureSection);