'use client'
import Box from '@/components/box/box';
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';

// Import components
import { getRequiredFieldsMessage, getErrorDialogTexts } from './utils';
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
  
  // Add state for step four validation
  const [stepFourIsValid, setStepFourIsValid] = useState(false);
  
  // Use the step management hook with edit mode flag
  const {
    steps,
    currentStep,
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

  // Get error dialog text based on locale
  const errorDialogTexts = getErrorDialogTexts(isArabic);
  
  // Get the required fields message
  const requiredFieldsMessage = getRequiredFieldsMessage(direction);

  return (
    <Box variant="column" className="w-full flex flex-col justify-start items-start">
      {/* Page title based on mode */}
      <h1 className="text-2xl font-bold text-primary mb-6">
        {isEditMode 
          ? (isArabic ? 'تعديل السيارة' : 'Edit Car Listing') 
          : (isArabic ? 'إضافة سيارة جديدة' : 'Add New Car Listing')}
      </h1>

      {/* Fix the type error by explicitly setting value as a string */}
      <Tabs value={currentStep} className="w-full flex flex-col justify-start items-start">
        <TabsList className="bg-transparent flex h-auto gap-4 md:gap-6 lg:gap-8 flex-wrap w-full xs:w-full justify-start items-center xs:justify-center" dir={direction}>
          {steps.map((step, index) => (
            <StepTrigger totalSteps={steps.length} key={step} step={step} index={index} currentStep={currentStep} />
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