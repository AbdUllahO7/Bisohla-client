// hooks/useStepManagement.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { StepValidation, ValidationAttempted, FormData } from '../types';
import { useSubmitForm } from './useSubmitForm';

export const useStepManagement = () => {
  const router = useRouter(); 
  const steps = ['productType', 'location', 'productInfo', 'adsInfo'];
  const [currentStep, setCurrentStep] = useState<string>(steps[0]);
  const { isSubmitting, submitForm, ...submitState } = useSubmitForm();

  // Add state to track validation for each step
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    productType: false,
    location: false,
    productInfo: true,
    adsInfo: true
  });

  // State to track if validation is attempted
  const [validationAttempted, setValidationAttempted] = useState<ValidationAttempted>({
    productType: false,
    location: false,
    productInfo: false,
    adsInfo: false
  });

  // Add state to store form data from all steps
  const [formData, setFormData] = useState<FormData>({
    productType: {},
    location: {},
    productInfo: {},
    adsInfo: {}
  });

  const handleNext = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    const currentStepName = steps[currentIndex];
    
    // Mark current step validation as attempted
    setValidationAttempted(prev => ({
      ...prev,
      [currentStepName]: true
    }));
    
    // Only proceed if step is valid
    if (stepValidation[currentStepName as keyof StepValidation]) {
      // Check if it's the last step
      if (currentIndex === steps.length - 1) {
        // This is the last step, handle submission
        submitForm();
      } else {
        // Move to the next step
        setCurrentStep(steps[currentIndex + 1]);
      }
    }
  }, [currentStep, stepValidation, steps, submitForm]);

  const handleBack = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
    if(currentIndex === 0) {
      router.back();
    }
  }, [currentStep, router, steps]);

  // Update validation state
  const updateStepValidation = useCallback((step: string, isValid: boolean) => {
    setStepValidation(prev => {
      // Only update if the value has changed
      if (prev[step as keyof StepValidation] === isValid) {
        return prev;
      }
      return {
        ...prev,
        [step]: isValid
      };
    });
    
    // If validation becomes invalid, also mark step as attempted
    if (!isValid) {
      setValidationAttempted(prev => ({
        ...prev,
        [step]: true
      }));
    }
  }, []);

  // Add function to update form data for each step
  const updateStepData = useCallback((step: string, data: any) => {
    setFormData(prev => ({
      ...prev,
      [step]: data
    }));
  }, []);

  // Get next button text based on step and locale
  const getNextButtonText = useCallback((step: string, direction: string) => {
    if (step === steps[steps.length - 1]) { // if it's the last step
      return direction === 'ltr' ? 'Submit' : 'إرسال';
    }
    return direction === 'ltr' ? 'Next' : 'التالي';
  }, [steps]);

  return {
    steps,
    currentStep,
    isSubmitting,
    stepValidation,
    validationAttempted,
    formData,
    handleNext,
    handleBack,
    updateStepValidation,
    updateStepData,
    getNextButtonText,
    ...submitState
  };
};