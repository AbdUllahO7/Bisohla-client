'use client'
import Box from '@/components/box/box';
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Import components
import { getRequiredFieldsMessage, getErrorDialogTexts } from './utils';
import { showStepNavigationToast, getStepNavigationMessages } from './utils/stepNavigationUtils';
import { StepContent } from './Components/StepContent';
import AddProductStepOne from '../StepOne/AddProductStepOne';
import AddProductStepTwo from '../stepTow/AddProductStepTwo';
import AddProductStepThree from '../stepThree/AddProductStepThree';
import AddProductStepFour from '../stepFour/AddProductStepFowr';
import ErrorDialog from './Components/ErrorDialog';
import { StepTrigger, StepperContainer } from './Components/StepTrigger';
import { useStepManagement } from './hooks/useStepManagement';
import { STORAGE_KEYS } from './hooks/useLocalStorage';

// Props interface for Steps component
interface StepsProps {
  isEditMode?: boolean;
  carId?: number;
  initialData?: any;
}

const Steps: React.FC<StepsProps> = ({ isEditMode = false, carId, initialData }) => {
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isArabic = direction === 'rtl';
  
  // Add state for step four validation
  const [stepFourIsValid, setStepFourIsValid] = useState(false);
  
  // Use the step management hook with edit mode flag
  const {
    steps,
    currentStep,
    setCurrentStep,
    isSubmitting,
    showErrorDialog,
    errorMessage,
    stepValidation,
    validationAttempted,
    handleNext,
    handleBack,
    updateStepValidation,
    handleTryAgain,
    setShowErrorDialog,
    isStepAccessible,
    getStepProgress,
  } = useStepManagement(isEditMode);

  // Set edit mode flag in localStorage on component mount if in edit mode
  useEffect(() => {
    if (isEditMode && carId) {
      localStorage.setItem(STORAGE_KEYS.EDIT_MODE_FLAG, carId.toString());
    }
    
    return () => {
      if (!window.location.pathname.includes('/edit')) {
        localStorage.removeItem(STORAGE_KEYS.EDIT_MODE_FLAG);
      }
    };
  }, [isEditMode, carId]);

  // Function to handle direct step navigation
  const handleStepClick = (targetStep: string) => {
    const success = setCurrentStep(targetStep);
    
    if (!success) {
      const messages = getStepNavigationMessages(isArabic);
      showStepNavigationToast(messages.stepLocked, 'warning');
    }
  };

  // Get error dialog text based on locale
  const errorDialogTexts = getErrorDialogTexts(isArabic);
  
  // Get the required fields message
  const requiredFieldsMessage = getRequiredFieldsMessage(direction);

  // Get progress information
  const progress = getStepProgress();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          {/* Page title */}
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {isEditMode 
                ? (isArabic ? 'تعديل السيارة' : 'Edit Car Listing') 
                : (isArabic ? 'إضافة سيارة جديدة' : 'Add New Car Listing')}
            </h1>
          </div>
          
          {/* Progress indicator - Mobile */}
          <div className="block sm:hidden bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                {isArabic 
                  ? `الخطوة ${progress.currentStepIndex + 1} من ${progress.totalSteps}` 
                  : `Step ${progress.currentStepIndex + 1} of ${progress.totalSteps}`}
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {progress.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Progress indicator - Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              {isArabic 
                ? `الخطوة ${progress.currentStepIndex + 1} من ${progress.totalSteps}` 
                : `Step ${progress.currentStepIndex + 1} of ${progress.totalSteps}`}
            </span>
            <div className="flex-1 max-w-md bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-bold text-emerald-600">
              {progress.progressPercentage}%
            </span>
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="mb-6 sm:mb-8">
          <StepperContainer>
            {steps.map((step, index) => (
              <StepTrigger 
                key={step}
                totalSteps={steps.length} 
                step={step} 
                index={index} 
                currentStep={currentStep}
                stepValidation={stepValidation}
                validationAttempted={validationAttempted}
                onStepClick={handleStepClick}
                isStepAccessible={(stepIndex) => isStepAccessible(stepIndex)}
              />
            ))}
          </StepperContainer>
        </div>

        {/* Main Content Area */}
        <Tabs value={currentStep} className="w-full">
          <div className="bg-white rounded-lg shadow-sm border min-h-[600px]">
            {/* Step Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              <StepContent 
                handleBack={handleBack} 
                handleNext={handleNext} 
                direction={direction} 
                step="productType"
                isNextDisabled={validationAttempted.productType && !stepValidation.productType || isSubmitting}
                requiredFieldsMessage={requiredFieldsMessage}
              >
                <AddProductStepOne 
                  onValidationChange={(isValid) => updateStepValidation('productType', isValid)}
                  isEditMode={isEditMode}
                  initialData={initialData}
                />
              </StepContent>
              
              <StepContent 
                handleBack={handleBack} 
                handleNext={handleNext} 
                direction={direction} 
                step="location"
                isNextDisabled={validationAttempted.location && !stepValidation.location || isSubmitting}
                requiredFieldsMessage={requiredFieldsMessage}
              >
                <AddProductStepTwo 
                  onValidationChange={(isValid) => updateStepValidation('location', isValid)}
                  isEditMode={isEditMode}
                  initialData={initialData}
                />
              </StepContent>
              
              <StepContent 
                handleBack={handleBack} 
                handleNext={handleNext} 
                direction={direction} 
                step="productInfo"
                isNextDisabled={validationAttempted.productInfo && !stepValidation.productInfo || isSubmitting}
                requiredFieldsMessage={requiredFieldsMessage}
              >
                <AddProductStepThree   
                  onValidationChange={(isValid) => updateStepValidation('productInfo', isValid)}
                  isEditMode={isEditMode}
                  initialData={initialData}
                />
              </StepContent>
              
              <StepContent 
                handleBack={handleBack} 
                handleNext={handleNext} 
                direction={direction} 
                step="adsInfo"
                isNextDisabled={!stepFourIsValid || isSubmitting}
                requiredFieldsMessage={requiredFieldsMessage}
                isLastStep={true}
              >
                <AddProductStepFour   
                  onValidationChange={(isValid) => {
                    setStepFourIsValid(isValid);
                    updateStepValidation('adsInfo', isValid);
                  }}
                  isEditMode={isEditMode}
                  initialData={initialData}
                />    
              </StepContent>
            </div>

     
          </div>
        </Tabs>

        {/* Error Dialog */}
        <ErrorDialog
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          title={errorDialogTexts.title}
          description={errorDialogTexts.description}
          errorMessage={errorMessage}
          tryAgainText={errorDialogTexts.tryAgainText || "Try Again"}
          onTryAgain={handleTryAgain}
        />
      </div>
    </div>
  );
};

export default Steps;