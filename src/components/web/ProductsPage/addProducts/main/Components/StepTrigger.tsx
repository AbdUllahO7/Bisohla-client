"use client"

import type React from "react"
import { TabsTrigger } from "@/components/ui/tabs"
import { useTranslations, useLocale } from "next-intl"
import { CheckCircle, Circle, Lock, ChevronRight } from "lucide-react"

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
  const isRTL = locale === 'ar'

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
    if (!isAccessible && !isCurrentStep && !isCompleted) {
      return <Lock className="h-4 w-4 text-white" />
    } else if (isCompleted) {
      return <CheckCircle className="h-4 w-4 text-white" />
    } else {
      return (
        <span className="text-sm font-bold text-white">
          {index + 1}
        </span>
      )
    }
  }

  const getCircleClasses = () => {
    let baseClasses = "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex justify-center items-center transition-all duration-300 flex-shrink-0"
    
    if (isCompleted) {
      baseClasses += " bg-emerald-500"
    } else if (isCurrentStep) {
      baseClasses += " bg-emerald-600"
    } else if (hasError) {
      baseClasses += " bg-red-500"
    } else if (!isAccessible) {
      baseClasses += " bg-gray-400"
    } else {
      baseClasses += " bg-gray-400"
    }

    return baseClasses
  }

  const getStepClasses = () => {
    let baseClasses = "flex-1 transition-all duration-300"
    
    if (!isAccessible && !isCurrentStep) {
      baseClasses += " cursor-not-allowed opacity-60"
    } else {
      baseClasses += " cursor-pointer"
    }

    return baseClasses
  }

  const getTextClasses = () => {
    let baseClasses = "text-xs sm:text-sm font-medium transition-all duration-300 leading-tight"
    
    if (isCurrentStep) {
      baseClasses += " text-emerald-700 font-semibold"
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

  const getConnectorClasses = () => {
    let baseClasses = "hidden sm:block flex-1 h-0.5 mx-2 lg:mx-4 transition-colors duration-300"
    
    if (isCompleted || (index < totalSteps - 1 && stepValidation[step])) {
      baseClasses += " bg-emerald-400"
    } else {
      baseClasses += " bg-gray-300"
    }

    return baseClasses
  }

  return (
    <>
      {/* Mobile Layout (Vertical Stack) */}
      <div className="block sm:hidden w-full">
        <div
          className={getStepClasses()}
          onClick={handleClick}
          role="button"
          tabIndex={isAccessible ? 0 : -1}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && isAccessible) {
              e.preventDefault()
              handleClick()
            }
          }}
        >
          <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
            isCurrentStep 
              ? 'bg-emerald-50 border-2 border-emerald-200' 
              : hasError 
                ? 'bg-red-50 border-2 border-red-200'
                : 'bg-white border border-gray-200'
          }`}>
            {/* Circle with number/icon */}
            <div className={getCircleClasses()}>
              {getStepIcon()}
            </div>
            
            {/* Step info */}
            <div className="flex-1 min-w-0">
              <div className={getTextClasses()}>
                {stepName}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {isCurrentStep 
                  ? (locale === 'ar' ? 'الخطوة الحالية' : 'Current Step')
                  : isCompleted 
                    ? (locale === 'ar' ? 'مكتملة' : 'Completed')
                    : hasError
                      ? (locale === 'ar' ? 'يتطلب انتباه' : 'Requires Attention')
                      : !isAccessible
                        ? (locale === 'ar' ? 'مؤمنة' : 'Locked')
                        : (locale === 'ar' ? 'متاحة' : 'Available')
                }
              </div>
            </div>

            {/* Arrow for accessible steps */}
            {isAccessible && !isCurrentStep && (
              <ChevronRight className={`w-4 h-4 text-gray-400 ${isRTL ? 'rotate-180' : ''}`} />
            )}

            {/* Error indicator */}
            {hasError && (
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Progress Line */}
        {index < totalSteps - 1 && (
          <div className={`ml-4 w-0.5 h-4 transition-colors duration-300 ${
            isCompleted ? 'bg-emerald-400' : 'bg-gray-300'
          }`} />
        )}
      </div>

      {/* Desktop Layout (Horizontal with Cards) */}
      <div className="hidden sm:flex items-center flex-1">
        <div
          className={getStepClasses()}
          onClick={handleClick}
          role="button"
          tabIndex={isAccessible ? 0 : -1}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && isAccessible) {
              e.preventDefault()
              handleClick()
            }
          }}
        >
          <div className={`relative bg-white rounded-xl shadow-sm border transition-all duration-300 hover:shadow-md p-4 lg:p-6 flex flex-col items-center gap-3 min-w-[160px] lg:min-w-[200px] ${
            isCurrentStep 
              ? 'border-emerald-400 bg-emerald-50 shadow-lg' 
              : isCompleted
                ? 'border-gray-200 hover:border-emerald-300'
                : hasError 
                  ? 'border-red-300 bg-red-50'
                  : !isAccessible
                    ? 'border-gray-200 opacity-60'
                    : 'border-gray-200 hover:border-gray-300'
          }`}>
            {/* Circle with number/icon */}
            <div className={getCircleClasses()}>
              {getStepIcon()}
            </div>
            
            {/* Step name */}
            <span className={`${getTextClasses()} text-center`}>
              {stepName}
            </span>
            
            {/* Status badge */}
            <div className={`text-xs px-2 py-1 rounded-full ${
              isCurrentStep 
                ? 'bg-emerald-100 text-emerald-700'
                : isCompleted
                  ? 'bg-gray-100 text-gray-600'
                  : hasError
                    ? 'bg-red-100 text-red-600'
                    : !isAccessible
                      ? 'bg-gray-100 text-gray-400'
                      : 'bg-gray-100 text-gray-500'
            }`}>
              {isCurrentStep 
                ? (locale === 'ar' ? 'الحالية' : 'Current')
                : isCompleted 
                  ? (locale === 'ar' ? 'مكتملة' : 'Done')
                  : hasError
                    ? (locale === 'ar' ? 'خطأ' : 'Error')
                    : !isAccessible
                      ? (locale === 'ar' ? 'مقفلة' : 'Locked')
                      : (locale === 'ar' ? 'متاحة' : 'Ready')
              }
            </div>
            
            {/* Error indicator for desktop */}
            {hasError && (
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop connector line */}
        {index < totalSteps - 1 && (
          <div className={getConnectorClasses()} />
        )}
      </div>
    </>
  )
}

// Improved container component for better responsive layout
export const StepperContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <>
      {/* Mobile Layout */}
      <div className="block sm:hidden w-full">
        <div className="space-y-1">
          {children}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden sm:block w-full">
        <div className="flex items-center justify-between w-full">
          {children}
        </div>
      </div>
    </>
  )
}