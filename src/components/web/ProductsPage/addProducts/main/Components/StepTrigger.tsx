"use client"

import type React from "react"
import { TabsTrigger } from "@/components/ui/tabs"
import { useTranslations, useLocale } from "next-intl"
import { CheckCircle, Circle, Lock } from "lucide-react"

interface StepTriggerProps {
  step: string
  index: number
  totalSteps: number
  currentStep: string
  stepValidation: Record<string, boolean>
  validationAttempted: Record<string, boolean>
  onStepClick: (step: string) => void
  isStepAccessible: (stepIndex: number) => boolean
}

export const StepTrigger: React.FC<StepTriggerProps> = ({ 
  step, 
  index, 
  totalSteps, 
  currentStep, 
  stepValidation,
  validationAttempted,
  onStepClick,
  isStepAccessible
}) => {
  const t = useTranslations("addProduct")
  const locale = useLocale()

  // Define steps for each locale
  const carstesp = {
    en: ['Car Type', 'Car Info', 'Additional Info', 'Ads Details'],
    ar: ['نوع السيارة', 'معلومات السيارة', 'معلومات إضافية', 'تفاصيل الإعلان']
  }

  // Get the step name based on locale and index
  const stepName = carstesp[locale as 'en' | 'ar'][index] || t(`steps.step${index + 1}`)

  // Determine step status
  const isCurrentStep = currentStep === step
  const isCompleted = stepValidation[step] && validationAttempted[step]
  const isAccessible = isStepAccessible(index)
  const hasError = validationAttempted[step] && !stepValidation[step]

  // Handle click
  const handleClick = () => {
    if (isAccessible) {
      onStepClick(step)
    }
  }

  // Get step icon based on status
  const getStepIcon = () => {
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-white" />
    } else {
      return (
        <span className="text-sm font-semibold text-white">
          {index + 1}
        </span>
      )
    }
  }

  // Get card styling classes based on status
  const getCardClasses = () => {
    let baseClasses = "relative bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md p-6 min-w-[200px] flex flex-col items-center gap-3"
    
    if (!isAccessible) {
      baseClasses += " cursor-not-allowed opacity-60 border-gray-200"
    } else if (isCurrentStep) {
      baseClasses += " cursor-pointer border-green-400 bg-green-50"
    } else if (isCompleted) {
      baseClasses += " cursor-pointer border-gray-200 hover:border-green-300"
    } else if (hasError) {
      baseClasses += " cursor-pointer border-red-300 bg-red-50"
    } else {
      baseClasses += " cursor-pointer border-gray-200 hover:border-gray-300"
    }

    return baseClasses
  }

  const getCircleClasses = () => {
    let baseClasses = "w-12 h-12 rounded-full flex justify-center items-center transition-all duration-300"
    
    if (isCompleted) {
      baseClasses += " bg-green-500"
    } else if (isCurrentStep) {
      baseClasses += " bg-green-500"
    } else if (hasError) {
      baseClasses += " bg-red-500"
    } else if (!isAccessible) {
      baseClasses += " bg-gray-400"
    } else {
      baseClasses += " bg-gray-400"
    }

    return baseClasses
  }

  const getTextClasses = () => {
    let baseClasses = "text-center font-medium transition-all duration-300"
    
    if (isCurrentStep) {
      baseClasses += " text-green-700"
    } else if (isCompleted) {
      baseClasses += " text-gray-700"
    } else if (hasError) {
      baseClasses += " text-red-600"
    } else if (!isAccessible) {
      baseClasses += " text-gray-400"
    } else {
      baseClasses += " text-gray-600"
    }

    return baseClasses
  }

  return (
    <div className="flex items-center">
      {/* Step Card */}
      <div
        className={getCardClasses()}
        onClick={handleClick}
        role="button"
        tabIndex={isAccessible ? 0 : -1}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && isAccessible) {
            e.preventDefault()
            handleClick()
          }
        }}
        aria-label={`${stepName} - ${isCompleted ? 'Completed' : isCurrentStep ? 'Current step' : !isAccessible ? 'Locked' : 'Available'}`}
      >
        {/* Circle with number/icon */}
        <div className={getCircleClasses()}>
          {getStepIcon()}
        </div>
        
        {/* Step name */}
        <span className={getTextClasses()}>
          {stepName}
        </span>
        
        {/* Status indicator for errors */}
        {hasError && (
          <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">!</span>
          </div>
        )}
      </div>

      {/* Dashed connector line */}
      {index < totalSteps - 1 && (
        <div className="flex-1 mx-4 min-w-[80px]">
          <div 
            className={`h-0.5 w-full border-t-2 border-dashed transition-colors duration-300 ${
              isCompleted ? 'border-green-400' : 'border-gray-300'
            }`}
          />
        </div>
      )}
    </div>
  )
}

// Main container component that would wrap all the steps
export const StepperContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="w-full bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-800 mb-8">Add New Car Listing</h1>
        <div className="flex items-center justify-between w-full">
          {children}
        </div>
      </div>
    </div>
  )
}