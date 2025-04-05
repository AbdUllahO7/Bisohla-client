// src/components/product/hooks/useStepNavigation.ts
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export const useStepNavigation = (steps: string[]) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<string>(steps[0])
  
  const navigateNext = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
    }
  }
  
  const navigateBack = () => {
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
    } else {
      router.back()
    }
  }
  
  return {
    currentStep,
    setCurrentStep,
    navigateNext,
    navigateBack,
    isFirstStep: steps.indexOf(currentStep) === 0,
    isLastStep: steps.indexOf(currentStep) === steps.length - 1
  }
}