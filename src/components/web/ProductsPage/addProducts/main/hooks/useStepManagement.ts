// hooks/useStepManagement.ts
import { useState, useCallback, useEffect } from 'react';
import { useSubmitForm } from '../hooks/useSubmitForm';
import { getStorageKey, STORAGE_KEYS } from './useLocalStorage';

interface StepValidation {
  productType: boolean;
  location: boolean;
  productInfo: boolean;
  adsInfo: boolean;
  [key: string]: boolean;
}

interface ValidationAttempted {
  productType: boolean;
  location: boolean;
  productInfo: boolean;
  adsInfo: boolean;
  [key: string]: boolean;
}

export const useStepManagement = (isEditMode = false) => {
  // Define all steps
  const steps = ["productType", "location", "productInfo", "adsInfo"];
  
  // Get the form submission hook
  const { 
    isSubmitting, 
    showErrorDialog, 
    errorMessage, 
    handleTryAgain, 
    setShowErrorDialog, 
    submitForm 
  } = useSubmitForm();
  
  // State for current step
  const [currentStep, setCurrentStep] = useState(steps[0]);
  
  // State for validation
  const [stepValidation, setStepValidation] = useState<StepValidation>({
    productType: isEditMode, // Assume valid in edit mode initially
    location: isEditMode,    // Assume valid in edit mode initially
    productInfo: isEditMode, // Assume valid in edit mode initially
    adsInfo: false,          // This always needs validation
  });
  
  // State to track which steps have had validation attempted
  const [validationAttempted, setValidationAttempted] = useState<ValidationAttempted>({
    productType: false,
    location: false,
    productInfo: false,
    adsInfo: false,
  });

  // Check localStorage on initial load to see if form data exists for each step
  useEffect(() => {
    if (isEditMode) {
      // In edit mode, we'll check if each step's data is already present using the appropriate keys
      const stepOneKey = getStorageKey('STEP_ONE', isEditMode);
      const stepTwoKey = getStorageKey('STEP_TWO', isEditMode);
      const stepThreeKey = getStorageKey('STEP_THREE', isEditMode);
      const stepFourKey = getStorageKey('STEP_FOUR', isEditMode);
      
      const stepOneData = localStorage.getItem(stepOneKey);
      const stepTwoData = localStorage.getItem(stepTwoKey);
      const stepThreeData = localStorage.getItem(stepThreeKey);
      const stepFourData = localStorage.getItem(stepFourKey);
      
      // Update validation state based on presence of data
      setStepValidation(prev => ({
        ...prev,
        productType: !!stepOneData,
        location: !!stepTwoData,
        productInfo: !!stepThreeData,
        adsInfo: !!stepFourData,
      }));
      
      // Mark steps as having been validated if data exists
      setValidationAttempted(prev => ({
        ...prev,
        productType: !!stepOneData,
        location: !!stepTwoData,
        productInfo: !!stepThreeData,
        adsInfo: !!stepFourData,
      }));
    }
  }, [isEditMode]);
  
  // Update validation state for a specific step
  const updateStepValidation = useCallback((step: string, isValid: boolean) => {
    setStepValidation(prev => ({
      ...prev,
      [step]: isValid
    }));
    
    // Mark this step as having had validation attempted
    setValidationAttempted(prev => ({
      ...prev,
      [step]: true
    }));
  }, []);
  
  // Handle direct step navigation (for clickable step triggers)
  const goToStep = useCallback((targetStep: string) => {
    // Validate that the target step exists
    if (!steps.includes(targetStep)) {
      console.warn(`Invalid step: ${targetStep}`);
      return false;
    }
    
    const targetIndex = steps.indexOf(targetStep);
    const currentIndex = steps.indexOf(currentStep);
    
    // In edit mode, allow navigation to any step
    if (isEditMode) {
      setCurrentStep(targetStep);
      return true;
    }
    
    // Allow navigation to current step or previous steps
    if (targetIndex <= currentIndex) {
      setCurrentStep(targetStep);
      return true;
    }
    
    // For forward navigation, check if all intermediate steps are valid
    for (let i = currentIndex; i < targetIndex; i++) {
      const intermediateStep = steps[i];
      if (!stepValidation[intermediateStep]) {
        console.warn(`Cannot navigate to ${targetStep}: ${intermediateStep} is not valid`);
        return false;
      }
    }
    
    // If all checks pass, navigate to the target step
    setCurrentStep(targetStep);
    return true;
  }, [currentStep, steps, stepValidation, isEditMode]);
  
  // Check if a step is accessible for navigation
  const isStepAccessible = useCallback((stepIndex: number): boolean => {
    const currentIndex = steps.indexOf(currentStep);
    
    // In edit mode, all steps are accessible
    if (isEditMode) {
      return true;
    }
    
    // Current step is always accessible
    if (stepIndex === currentIndex) {
      return true;
    }
    
    // Previous steps are always accessible
    if (stepIndex < currentIndex) {
      return true;
    }
    
    // For future steps, check if all intermediate steps are valid
    for (let i = currentIndex; i < stepIndex; i++) {
      const stepKey = steps[i];
      if (!stepValidation[stepKey]) {
        return false;
      }
    }
    
    return true;
  }, [currentStep, steps, stepValidation, isEditMode]);
  
  // Handle next button click
  const handleNext = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    
    // Mark current step as having had validation attempted
    setValidationAttempted(prev => ({
      ...prev,
      [currentStep]: true
    }));
    
    // If current step is not valid, don't proceed
    if (!stepValidation[currentStep]) {
      return;
    }
    
    // If we're on the last step, submit the form
    if (currentIndex === steps.length - 1) {
      submitForm();
      return;
    }
    
    // Otherwise, move to the next step
    const nextStep = steps[currentIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep);
    }
  }, [currentStep, steps, stepValidation, submitForm]);
  
  // Handle back button click
  const handleBack = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    const prevStep = steps[currentIndex - 1];
    
    if (prevStep) {
      setCurrentStep(prevStep);
    }
  }, [currentStep, steps]);
  
  // Get step progress information
  const getStepProgress = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    const completedSteps = steps.slice(0, currentIndex).filter(step => stepValidation[step]);
    
    return {
      currentStepIndex: currentIndex,
      totalSteps: steps.length,
      completedSteps: completedSteps.length,
      progressPercentage: Math.round((completedSteps.length / steps.length) * 100)
    };
  }, [currentStep, steps, stepValidation]);
  
  return {
    steps,
    currentStep,
    setCurrentStep: goToStep, // Export direct navigation function
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
    isStepAccessible, // Export accessibility checker
    getStepProgress, // Export progress information
  };
};