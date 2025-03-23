'use client'
import React from 'react'
import { useLocale } from 'next-intl'
import { Tabs, TabsList } from "@/components/ui/tabs"
import Box from '@/components/box/box'

// Components
import { StepContent } from './StepContent'
import { StepTrigger } from './StepTrigger'

// Custom hooks
import { useStepNavigation } from './hooks/useStepNavigation'
import { useStepValidation } from './hooks/useStepValidation'
import { useFormSubmission } from './hooks/useFormSubmission'

// Utils
import { getLocalizedText } from './utils/getLocalizedText'
import AddProductStepOne from './AddProductStepOne'
import AddProductStepTwo from './AddProductStepTwo'
import AddProductStepThree from './AddProductStepThree'
import AddProductStepFour from './AddProductStepFowr'
import SuccessDialog from './Dialogs/SuccessDialogProps'
import ErrorDialog from './Dialogs/ErrorDialog'

const Steps: React.FC = () => {
  // Locale and direction setup
  const locale = useLocale()
  const direction = locale === 'ar' ? 'rtl' : 'ltr'
  
  // Step configuration
  const STEPS = ['productType', 'location', 'productInfo', 'adsInfo']
  
  // Custom hooks for managing the multi-step form
  const { currentStep, navigateNext, navigateBack, isLastStep } = useStepNavigation(STEPS)
  
  const { 
    stepValidation, 
    validationAttempted, 
    updateStepValidation, 
    markStepAttempted 
  } = useStepValidation(STEPS)
  
  const {
    isSubmitting,
    showSuccessDialog,
    setShowSuccessDialog,
    showErrorDialog,
    setShowErrorDialog,
    errorMessage,
    handleSubmission
  } = useFormSubmission()
  
  // Get localized text based on direction
  const text = getLocalizedText(direction)
  
  // Handle next button click
  const handleNext = () => {
    const currentStepName = currentStep
    
    // Mark current step validation as attempted
    markStepAttempted(currentStepName)
    
    // Only proceed if step is valid
    if (stepValidation[currentStepName]) {
      if (isLastStep) {
        // Submit form if it's the last step
        handleSubmission()
      } else {
        // Otherwise navigate to next step
        navigateNext()
      }
    }
  }
  
  // Handle try again action for error dialog
  const handleTryAgain = () => {
    setShowErrorDialog(false)
  }
  
  return (
    <Box variant="column" className="w-full flex flex-col justify-start items-start">
      <Tabs value={currentStep} className="w-full flex flex-col justify-start items-start">
        <TabsList 
          className="bg-transparent flex h-auto gap-4 md:gap-6 lg:gap-8 flex-wrap w-full xs:w-full justify-start items-center xs:justify-center" 
          dir={direction}
        >
          {STEPS.map((step, index) => (
            <StepTrigger 
              totalSteps={STEPS.length}
              key={step} 
              step={step} 
              index={index} 
            />
          ))}
        </TabsList>

        <div className="w-full mt-6 h-full">
          {/* Step 1: Product Type */}
          <StepContent 
            handleBack={navigateBack} 
            handleNext={handleNext} 
            direction={direction} 
            step="productType"
            isNextDisabled={validationAttempted.productType && !stepValidation.productType || isSubmitting}
            requiredFieldsMessage={text.requiredFieldsMessage}
          >
            <AddProductStepOne 
              onValidationChange={(isValid) => updateStepValidation('productType', isValid)}
            />
          </StepContent>
          
          {/* Step 2: Location */}
          <StepContent 
            handleBack={navigateBack} 
            handleNext={handleNext} 
            direction={direction} 
            step="location"
            isNextDisabled={validationAttempted.location && !stepValidation.location || isSubmitting}
            requiredFieldsMessage={text.requiredFieldsMessage}
          >
            <AddProductStepTwo 
              onValidationChange={(isValid) => updateStepValidation('location', isValid)}
            />
          </StepContent>
          
          {/* Step 3: Product Info */}
          <StepContent 
            handleBack={navigateBack} 
            handleNext={handleNext} 
            direction={direction} 
            step="productInfo"
            isNextDisabled={validationAttempted.productInfo && !stepValidation.productInfo || isSubmitting}
            requiredFieldsMessage={text.requiredFieldsMessage}
          >
            <AddProductStepThree   
              onValidationChange={(isValid) => updateStepValidation('productInfo', isValid)}
            />
          </StepContent>
          
          {/* Step 4: Ad Info */}
          <StepContent 
            handleBack={navigateBack} 
            handleNext={handleNext} 
            direction={direction} 
            step="adsInfo"
            isNextDisabled={validationAttempted.adsInfo && !stepValidation.adsInfo || isSubmitting}
            requiredFieldsMessage={text.requiredFieldsMessage}
          >
            <AddProductStepFour   
              onValidationChange={(isValid) => updateStepValidation('adsInfo', isValid)}
            />    
          </StepContent>
        </div>
      </Tabs>

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onOpenChange={setShowSuccessDialog}
        title={text.successDialog.title}
        description={text.successDialog.description}
        homeButtonText={text.successDialog.homeButtonText}
        profileButtonText={text.successDialog.profileButtonText}
      />

      {/* Error Dialog */}
      <ErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        title={text.errorDialog.title}
        description={text.errorDialog.description}
        errorMessage={errorMessage}
        tryAgainText={text.errorDialog.tryAgainText}
        onTryAgain={handleTryAgain}
      />
    </Box>
  )
}

export default Steps