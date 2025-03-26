
// src/components/product/hooks/useStepValidation.ts
import { useState, useCallback } from 'react'

export const useStepValidation = (stepNames: string[]) => {
  // Initialize with default values
  const initialValidation = stepNames.reduce((acc, step) => {
    acc[step] = false
    return acc
  }, {} as Record<string, boolean>)
  
  const initialAttempts = stepNames.reduce((acc, step) => {
    acc[step] = false
    return acc
  }, {} as Record<string, boolean>)
  
  const [stepValidation, setStepValidation] = useState(initialValidation)
  const [validationAttempted, setValidationAttempted] = useState(initialAttempts)
  
  const updateStepValidation = useCallback((step: string, isValid: boolean) => {
    setStepValidation(prev => {
      if (prev[step] === isValid) return prev
      return { ...prev, [step]: isValid }
    })
    
    // If validation fails, mark step as attempted
    if (!isValid) {
      setValidationAttempted(prev => ({
        ...prev,
        [step]: true
      }))
    }
  }, [])
  
  const markStepAttempted = useCallback((step: string) => {
    setValidationAttempted(prev => ({
      ...prev,
      [step]: true
    }))
  }, [])
  
  return {
    stepValidation,
    validationAttempted,
    updateStepValidation,
    markStepAttempted
  }
}