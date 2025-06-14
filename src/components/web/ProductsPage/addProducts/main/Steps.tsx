'use client'
import Box from '@/components/box/box';
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';

// Import components
import { getRequiredFieldsMessage, getErrorDialogTexts } from './utils';
import { showStepNavigationToast, getStepNavigationMessages } from './utils/stepNavigationUtils';
import { StepContent } from './Components/StepContent';
import AddProductStepOne from '../StepOne/AddProductStepOne';
import AddProductStepTwo from '../stepTow/AddProductStepTwo';
import AddProductStepThree from '../stepThree/AddProductStepThree';
import AddProductStepFour from '../stepFour/AddProductStepFowr';
import ErrorDialog from './Components/ErrorDialog';
import { StepTrigger } from './Components/StepTrigger';
import { useStepManagement } from './hooks/useStepManagement';
import { STORAGE_KEYS } from './hooks/useLocalStorage';

// Props interface for Steps component
interface StepsProps {
  isEditMode?: boolean;
  carId?: number;
  initialData?: any; // You can define a proper type for this
}

const Steps: React.FC<StepsProps> = ({ isEditMode = false, carId, initialData }) => {
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isArabic = direction === 'rtl';
  console.log("initialData",initialData)
  
  // Add state for step four validation
  const [stepFourIsValid, setStepFourIsValid] = useState(false);
  
  // Use the step management hook with edit mode flag
  const {
    steps,
    currentStep,
    setCurrentStep, // Direct step navigation function
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
    isStepAccessible, // Step accessibility checker
    getStepProgress, // Progress information
  } = useStepManagement(isEditMode);

  // Set edit mode flag in localStorage on component mount if in edit mode
  useEffect(() => {
    if (isEditMode && carId) {
      localStorage.setItem(STORAGE_KEYS.EDIT_MODE_FLAG, carId.toString());
    }
    
    return () => {
      // Only clean up edit mode flag if we're not on the edit page
      if (!window.location.pathname.includes('/edit')) {
        localStorage.removeItem(STORAGE_KEYS.EDIT_MODE_FLAG);
      }
    };
  }, [isEditMode, carId]);

  // Function to handle direct step navigation
  const handleStepClick = (targetStep: string) => {
    // Use the setCurrentStep function from the hook
    const success = setCurrentStep(targetStep);
    
    if (!success) {
      // Show user-friendly feedback
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
    <Box variant="column" className="w-full flex flex-col mt-0 justify-start items-start">
      {/* Page title based on mode */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-primary mb-2">
          {isEditMode 
            ? (isArabic ? 'تعديل السيارة' : 'Edit Car Listing') 
            : (isArabic ? 'إضافة سيارة جديدة' : 'Add New Car Listing')}
        </h1>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            {isArabic 
              ? `الخطوة ${progress.currentStepIndex + 1} من ${progress.totalSteps}` 
              : `Step ${progress.currentStepIndex + 1} of ${progress.totalSteps}`}
          </span>
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progressPercentage}%` }}
            ></div>
          </div>
          <span className="text-xs">{progress.progressPercentage}%</span>
        </div>
      </div>

      {/* Fix the type error by explicitly setting value as a string */}
      <Tabs value={currentStep} className="w-full flex flex-col justify-start items-start">
        <TabsList
          className="bg-transparent flex h-auto gap-0 w-full items-stretch mb-6 p-0"
          dir={direction}
        >
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
        </TabsList>

        <div className="w-full mt-6 h-full">
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
    </Box>
  );
};

export default Steps;