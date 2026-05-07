'use client'
import React from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Text from "@/components/text/text";
import { AddProductStepTwoProps } from "./types";
import { useAddProductStepTwo } from "./hooks";
import CarInfoForm from "./CarInfoForm";
import FeatureSection from "./FeatureSection";
import { Car, Sparkles, Award, CheckCircle2 } from "lucide-react";

/**
 * AddProductStepTwo component for car information and features
 */
const AddProductStepTwo: React.FC<AddProductStepTwoProps> = ({ onValidationChange }) => {
  const {
    carInfo,
    validationErrors,
    allFeatures,
    featureCategories,
    getTranslatedCategoryName,  
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
    <div className="w-full space-y-8" dir={direction}>
      {/* Top Stepper Header Card */}
      <Card className="w-full bg-white border border-slate-100 shadow-xl overflow-hidden rounded-2xl transition-all duration-300">
        <CardHeader className="relative overflow-hidden bg-gradient-to-r from-slate-50 via-white to-slate-50 py-6 sm:py-8 px-6 sm:px-8">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-light/5 rounded-full blur-2xl -mr-10 -mt-10" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -ml-10 -mb-10" />
          
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left space-y-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100/60 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {direction === "rtl" ? "تفاصيل السيارة" : "Car Details"}
              </span>
              <Text className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-800">
                {labels.carInfo}
              </Text>
              <p className="text-sm text-slate-500 max-w-md">
                {direction === "rtl" 
                  ? "أدخل مواصفات سيارتك والخيارات الإضافية المتوفرة بها." 
                  : "Please provide your car specifications and available extra features."}
              </p>
            </div>
            
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 shadow-sm">
              <Award className="w-5 h-5 text-emerald-500 animate-pulse" />
              <div className="text-right sm:text-left">
                <div className="text-xs text-slate-400 font-medium">
                  {direction === "rtl" ? "التقدم الحالي" : "Current Progress"}
                </div>
                <div className="text-sm font-bold text-slate-700">
                  {direction === "rtl" ? "خطوة 2 من 4" : "Step 2 of 4"}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Car Information Section */}
      <Card className="w-full bg-white border border-slate-100 shadow-xl overflow-hidden rounded-2xl transition-all duration-300">
        <CardHeader className="bg-slate-50/50 py-5 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {direction === "rtl" ? "مواصفات السيارة" : "Specifications"}
              </h3>
              <p className="text-xs text-slate-400">
                {direction === "rtl" ? "أدخل طراز السيارة ومواصفاتها الميكانيكية" : "Specify mechanical and model details of your vehicle"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
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
      <Card className="w-full bg-white border border-slate-100 shadow-xl overflow-hidden rounded-2xl transition-all duration-300">
        <CardHeader className="bg-slate-50/50 py-5 px-6 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">
                {direction === "rtl" ? "ميزات السيارة الإضافية" : "Additional Features"}
              </h3>
              <p className="text-xs text-slate-400">
                {direction === "rtl" ? "اختر التجهيزات والكماليات المتوفرة بالسيارة" : "Select options, safety gear and accessories included"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8">
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