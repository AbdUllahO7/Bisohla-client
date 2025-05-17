"use client"

import type React from "react"
import { TabsTrigger } from "@/components/ui/tabs"
import { useTranslations, useLocale } from "next-intl"

interface StepTriggerProps {
  step: string
  index: number
  totalSteps: number
  currentStep: string
}

export const StepTrigger: React.FC<StepTriggerProps> = ({ step, index, totalSteps, currentStep }) => {
  const t = useTranslations("addProduct")
  const locale = useLocale()

  // Define steps for each locale
  const carstesp = {
    en: ['Car Type', 'Car Info', 'Additional Info', 'Ads Details'],
    ar: ['نوع السيارة', 'معلومات السيارة', 'معلومات إضافية', 'تفاصيل الإعلان']
  }

  // Get the step name based on locale and index
  const stepName = carstesp[locale as 'en' | 'ar'][index] || t(`steps.step${index + 1}`)

  return (
    <>
      <TabsTrigger
        className="group bg-white font-bold px-3 md:px-4 py-2 md:py-3 min-w-[100px] md:min-w-[120px] lg:min-w-[150px] min-h-[80px] md:min-h-[90px] flex-col gap-1 md:gap-2 items-center transition-colors text-primary data-[state=active]:bg-white"
        value={step}
      >
        <span className="min-h-[40px] min-w-[40px] md:min-h-[50px] md:min-w-[50px] rounded-full flex justify-center items-center transition-colors bg-gray-200 group-data-[state=active]:bg-primary-foreground">
          <span className="text-primary font-bold text-lg md:text-xl">{index + 1}</span>
        </span>
        <span className="transition-colors text-primary text-xs md:text-sm">{stepName}</span>
      </TabsTrigger>

      {index < totalSteps - 1 && <span className="hidden lg:block text-primary font-bold text-xl">---------------</span>}
    </>
  )
}