import { useCallback, useEffect, useState } from 'react';

interface StepFlags {
  [step: string]: boolean;
}

/**
 * Step navigation + per-step validity. Edit mode: every step reachable; create mode:
 * forward jumps need every intermediate step valid. Submission itself lives in
 * `useListingWizardSubmit` — this hook only tells the shell when the last step was reached.
 */
export const useStepManagement = (isEditMode: boolean, steps: string[], onSubmit: () => void) => {
  const [currentStep, setCurrentStepState] = useState(steps[0]);
  const [stepValidation, setStepValidation] = useState<StepFlags>({});
  const [validationAttempted, setValidationAttempted] = useState<StepFlags>({});

  useEffect(() => {
    if (steps.length > 0 && (!currentStep || !steps.includes(currentStep))) {
      setCurrentStepState(steps[0]);
    }
  }, [steps, currentStep]);

  const updateStepValidation = useCallback((step: string, isValid: boolean) => {
    setStepValidation((prev) => (prev[step] === isValid ? prev : { ...prev, [step]: isValid }));
  }, []);

  const markAttempted = useCallback((step: string) => {
    setValidationAttempted((prev) => (prev[step] ? prev : { ...prev, [step]: true }));
  }, []);

  const goToStep = useCallback(
    (targetStep: string): boolean => {
      if (!steps.includes(targetStep)) return false;
      const targetIndex = steps.indexOf(targetStep);
      const currentIndex = steps.indexOf(currentStep);

      if (isEditMode || targetIndex <= currentIndex) {
        setCurrentStepState(targetStep);
        return true;
      }
      for (let i = currentIndex; i < targetIndex; i++) {
        if (!stepValidation[steps[i]]) return false;
      }
      setCurrentStepState(targetStep);
      return true;
    },
    [currentStep, steps, stepValidation, isEditMode],
  );

  const isStepAccessible = useCallback(
    (stepIndex: number): boolean => {
      if (isEditMode) return true;
      const currentIndex = steps.indexOf(currentStep);
      if (stepIndex <= currentIndex) return true;
      for (let i = currentIndex; i < stepIndex; i++) {
        if (!stepValidation[steps[i]]) return false;
      }
      return true;
    },
    [currentStep, steps, stepValidation, isEditMode],
  );

  const handleNext = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    markAttempted(currentStep);
    if (!stepValidation[currentStep]) return;

    if (currentIndex === steps.length - 1) {
      onSubmit();
      return;
    }
    const nextStep = steps[currentIndex + 1];
    if (nextStep) setCurrentStepState(nextStep);
  }, [currentStep, steps, stepValidation, onSubmit, markAttempted]);

  const handleBack = useCallback(() => {
    const prevStep = steps[steps.indexOf(currentStep) - 1];
    if (prevStep) setCurrentStepState(prevStep);
  }, [currentStep, steps]);

  const getStepProgress = useCallback(() => {
    const currentIndex = steps.indexOf(currentStep);
    const completedSteps = steps.slice(0, currentIndex).filter((step) => stepValidation[step]).length;
    return {
      currentStepIndex: currentIndex,
      totalSteps: steps.length,
      completedSteps,
      progressPercentage: steps.length ? Math.round((completedSteps / steps.length) * 100) : 0,
    };
  }, [currentStep, steps, stepValidation]);

  return {
    steps,
    currentStep,
    setCurrentStep: goToStep,
    stepValidation,
    validationAttempted,
    markAttempted,
    handleNext,
    handleBack,
    updateStepValidation,
    isStepAccessible,
    getStepProgress,
  };
};
