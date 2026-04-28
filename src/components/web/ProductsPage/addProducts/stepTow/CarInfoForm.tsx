"use client"
import React, { useRef, useCallback, useEffect } from "react"
import { Input } from "@/components/ui/input"
import FormField from "./FormField"
import type { CarInfoState, ValidationErrors } from "./types"
import { useTranslations } from "next-intl"
import SelectFieldWithSearch from "@/components/web/design/SelectFieldWithSearch"
import { Info } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useLocale } from "next-intl"

interface CarInfoFormProps {
  carInfo: CarInfoState
  validationErrors: ValidationErrors
  labels: Record<string, string>
  options: any
  locale: string
  onTextFieldBlur: (field: string, value: string) => void
  onSelectChange: (field: string, value: string) => void
}

// Generate engine size options from 0.8 to 8.0 outside the component to keep references stable
const engineSizeOptions = Array.from({ length: 73 }, (_, i) => {
  const value = (0.8 + i * 0.1).toFixed(1)
  return { value, label: `${value} L` }
})

/**
 * Car information form component with helpful tooltips
 */
const CarInfoForm: React.FC<CarInfoFormProps> = ({
  carInfo,
  validationErrors,
  labels,
  options,
  onTextFieldBlur,
  onSelectChange,
}) => {
  // Get translations for next-intl
  const t = useTranslations("homePage")
  const locale = useLocale()
  const isRTL = locale === "ar"

  // Input refs for text fields
  const mileageInputRef = useRef<HTMLInputElement>(null)
  const enginePowerInputRef = useRef<HTMLInputElement>(null)
  const vinInputRef = useRef<HTMLInputElement>(null)
  const plateInputRef = useRef<HTMLInputElement>(null)

  // Field information tooltips
  const fieldInfo = {
    en: {
      mileage: {
        tooltip: "Total distance traveled. This is a key factor in determining value and condition.",
        placeholder: "e.g., 50000 KM",
      },
      enginePower: {
        tooltip: "Engine power measured in horsepower (HP) or kilowatts (kW). You can find this in your manual or registration documents.",
        placeholder: "e.g., 150 HP",
      },
      plateNumber: {
        tooltip: "The license plate number as it appears on registration documents.",
        placeholder: "e.g., ABC 1234",
      },
      vin: {
        tooltip: "Identification Number - a unique code that identifies the item.",
        placeholder: "e.g., 1HGBH41JXMN109186",
      },
      colorExterior: {
        tooltip: "The primary exterior color. Choose the closest match if your exact color isn't listed.",
        placeholder: "Select exterior color",
      },
      engineSize: {
        tooltip: "Engine displacement in liters (L). This represents the total volume of all cylinders in the engine.",
        placeholder: "e.g., 2.0 L",
      },
      fuelType: {
        tooltip: "The type of fuel used.",
        placeholder: "Select fuel type",
      },
      transmission: {
        tooltip: "Type of transmission system. Automatic shifts gears automatically, while manual requires the driver to shift gears.",
        placeholder: "Select transmission",
      },
      bodyType: {
        tooltip: "The general shape and design category.",
        placeholder: "Select body type",
      },
      condition: {
        tooltip: "The current status. Choose the option that best describes its maintenance and usage history.",
        placeholder: "Select condition",
      },
    },
    ar: {
      mileage: {
        tooltip: "المسافة الإجمالية المقطوعة. هذا عامل رئيسي في تحديد القيمة والحالة.",
        placeholder: "مثال: 50000 KM",
      },
      enginePower: {
        tooltip: "قوة المحرك مقاسة بالحصان (HP) أو الكيلوواط (kW). يمكنك العثور على هذا في الدليل أو مستندات التسجيل.",
        placeholder: "مثال: 150 حصان",
      },
      plateNumber: {
        tooltip: "رقم اللوحة كما يظهر في مستندات التسجيل الخاصة بك.",
        placeholder: "مثال: أ ب ج 1234",
      },
      vin: {
        tooltip: "رقم التعريف - رمز فريد يحدد المنتج.",
        placeholder: "مثال: 1HGBH41JXMN109186",
      },
      colorExterior: {
        tooltip: "اللون الخارجي الأساسي. اختر أقرب تطابق إذا لم يكن لونك الدقيق مدرجاً.",
        placeholder: "اختر اللون الخارجي",
      },
      engineSize: {
        tooltip: "سعة المحرك باللتر (L). يمثل هذا الحجم الإجمالي لجميع الأسطوانات في المحرك.",
        placeholder: "مثال: 2.0 لتر",
      },
      fuelType: {
        tooltip: "نوع الوقود المستخدم.",
        placeholder: "اختر نوع الوقود",
      },
      transmission: {
        tooltip: "نوع نظام ناقل الحركة. الأوتوماتيكي ينقل التروس تلقائياً، بينما اليدوي يتطلب من السائق تبديل التروس.",
        placeholder: "اختر ناقل الحركة",
      },
      bodyType: {
        tooltip: "الشكل العام وفئة التصميم.",
        placeholder: "اختر نوع الهيكل",
      },
      condition: {
        tooltip: "الحالة الحالية. اختر الخيار الذي يصف تاريخ الصيانة والاستخدام بشكل أفضل.",
        placeholder: "اختر الحالة",
      },
    },
  }

  const info = fieldInfo[locale as keyof typeof fieldInfo] || fieldInfo.en

  // Seed refs ONCE on mount with the initial values coming from the parent.
  // Inputs are uncontrolled (defaultValue), so we only need to seed them once;
  // re-running on every carInfo change would reset values the user has typed.
  const carInfoRef = useRef(carInfo);
  useEffect(() => {
    const initial = carInfoRef.current;
    if (mileageInputRef.current) mileageInputRef.current.value = initial.mileage || ""
    if (enginePowerInputRef.current) enginePowerInputRef.current.value = initial.enginePower || ""
    if (vinInputRef.current) vinInputRef.current.value = initial.vin || ""
    if (plateInputRef.current) plateInputRef.current.value = initial.plateNumber || ""
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleMileageBlur = useCallback(() => {
    onTextFieldBlur("mileage", mileageInputRef.current?.value || "")
  }, [onTextFieldBlur])

  const handleEnginePowerBlur = useCallback(() => {
    onTextFieldBlur("enginePower", enginePowerInputRef.current?.value || "")
  }, [onTextFieldBlur])

  const handleVinBlur = useCallback(() => {
    onTextFieldBlur("vin", vinInputRef.current?.value || "")
  }, [onTextFieldBlur])

  const handlePlateBlur = useCallback(() => {
    onTextFieldBlur("plateNumber", plateInputRef.current?.value || "")
  }, [onTextFieldBlur])

  // Info Icon helper with proper RTL support
  const renderInfoIcon = (tooltip: string) => (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full p-0.5 hover:bg-gray-100 transition-colors"
            aria-label="More information"
          >
            <Info className="h-4 w-4 text-gray-400 hover:text-emerald-600 transition-colors" />
          </button>
        </TooltipTrigger>
        <TooltipContent
          className={cn(
            "max-w-xs bg-gray-900 text-white p-3 text-sm shadow-lg z-50",
            isRTL && "text-right"
          )}
          side="top"
          align={isRTL ? "end" : "start"}
        >
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )

  // Modified SelectField helper with proper RTL support
  const renderSelectField = ({
    label,
    field,
    options,
    placeholder,
    required = false,
    tooltip,
  }: {
    label: string
    field: string
    options: Array<{ value: string; label: string }>
    placeholder: string
    optionsLabel?: string
    required?: boolean
    tooltip: string
  }) => {
    const hasError =
      Object.prototype.hasOwnProperty.call(validationErrors, field) &&
      validationErrors[field as keyof ValidationErrors]
    const errorMessage = hasError ? validationErrors[field as keyof ValidationErrors] : ""

    // Access the current value from carInfo state
    const fieldValue = (carInfo[field as keyof CarInfoState] as string) || ""

    return (
      <div className="relative z-10" dir={isRTL ? "rtl" : "ltr"} key={field}>
        <div className={cn(
          "flex items-center gap-1 mb-2",
          isRTL ? "flex-row-reverse justify-end" : "justify-start"
        )}>
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {required && <span className="text-red-500">*</span>}
          {renderInfoIcon(tooltip)}
        </div>
        <div className="relative">
          <SelectFieldWithSearch
            options={options}
            placeholder={placeholder}
            name={field}
            value={fieldValue}
            onChange={onSelectChange}
            onBlur={onTextFieldBlur}
            SelectTriggerStyle={`${hasError ? "border-red-500" : ""} relative z-20`}
            className="w-full text-primary relative z-20"
            required={required}
            error={errorMessage}
          />
        </div>
        {errorMessage && (
          <p className={cn(
            "text-red-500 text-xs mt-1",
            isRTL && "text-right"
          )}>{errorMessage}</p>
        )}
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-5 w-full relative" dir={isRTL ? "rtl" : "ltr"}>
      {/* Responsive grid: 1 column on mobile, 2 on tablet, 3-4 on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">

        {/* Mileage */}
        <div dir={isRTL ? "rtl" : "ltr"}>
          <div className={cn(
            "flex items-center gap-1 mb-2",
            isRTL ? "flex-row-reverse justify-end" : "justify-start"
          )}>
            <span className="text-sm font-medium text-gray-700">{labels.mileage}</span>
            <span className="text-red-500">*</span>
            {renderInfoIcon(info.mileage.tooltip)}
          </div>
          <Input
            type="text"
            ref={mileageInputRef}
            defaultValue={carInfo.mileage || ""}
            onBlur={handleMileageBlur}
            placeholder={info.mileage.placeholder}
            className={cn(
              "w-full text-primary",
              isRTL && "text-right"
            )}
            dir={isRTL ? "rtl" : "ltr"}
            required
          />
        </div>

        {/* Mileage */}
        <div dir={isRTL ? "rtl" : "ltr"}>
          <div className={cn(
            "flex items-center gap-1 mb-2",
            isRTL ? "flex-row-reverse justify-end" : "justify-start"
          )}>
            <span className="text-sm font-medium text-gray-700">{labels.enginePower}</span>
            {renderInfoIcon(info.enginePower.tooltip)}
          </div>
          <Input
            type="text"
            ref={enginePowerInputRef}
            defaultValue={carInfo.enginePower || ""}
            onBlur={handleEnginePowerBlur}
            placeholder={info.enginePower.placeholder}
            className={cn(
              "w-full text-primary",
              isRTL && "text-right"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        {/* Plate Number */}
        <div dir={isRTL ? "rtl" : "ltr"}>
          <div className={cn(
            "flex items-center gap-1 mb-2",
            isRTL ? "flex-row-reverse justify-end" : "justify-start"
          )}>
            <span className="text-sm font-medium text-gray-700">{labels.plateNumber}</span>
            {renderInfoIcon(info.plateNumber.tooltip)}
          </div>
          <Input
            type="text"
            ref={plateInputRef}
            defaultValue={carInfo.plateNumber || ""}
            placeholder={info.plateNumber.placeholder}
            onBlur={handlePlateBlur}
            className={cn(
              "w-full text-primary",
              isRTL && "text-right"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        {/* VIN - Full width on mobile for easier input */}
        <div className="sm:col-span-2 lg:col-span-1" dir={isRTL ? "rtl" : "ltr"}>
          <div className={cn(
            "flex items-center gap-1 mb-2",
            isRTL ? "flex-row-reverse justify-end" : "justify-start"
          )}>
            <span className="text-sm font-medium text-gray-700">{labels.vin}</span>
            {renderInfoIcon(info.vin.tooltip)}
          </div>
          <Input
            type="text"
            ref={vinInputRef}
            defaultValue={carInfo.vin || ""}
            placeholder={info.vin.placeholder}
            onBlur={handleVinBlur}
            className={cn(
              "w-full text-primary",
              isRTL && "text-right"
            )}
            dir={isRTL ? "rtl" : "ltr"}
          />
        </div>

        {/* Exterior Color */}
        {renderSelectField({
          label: labels.colorExterior,
          field: "colorExterior",
          options: options.colors,
          placeholder: info.colorExterior.placeholder,
          tooltip: info.colorExterior.tooltip,
          required: true
        })}

        {/* Engine Size */}
        {renderSelectField({
          label: labels.engineSize,
          field: "engineSize",
          options: engineSizeOptions,
          placeholder: info.engineSize.placeholder,
          tooltip: info.engineSize.tooltip,
          required: true
        })}

        {/* Vehicle Condition */}
        {renderSelectField({
          label: labels.vehicleCondition,
          field: "condition",
          options: options.vehicleCondition,
          placeholder: info.condition.placeholder,
          tooltip: info.condition.tooltip,
          required: true
        })}

        {/* Fuel Type */}
        {renderSelectField({
          label: labels.fuelType,
          field: "fuelType",
          options: options.fuelType,
          placeholder: info.fuelType.placeholder,
          tooltip: info.fuelType.tooltip,
          required: true
        })}

        {/* Transmission */}
        {renderSelectField({
          label: labels.transmission,
          field: "transmission",
          options: options.transmission,
          placeholder: info.transmission.placeholder,
          tooltip: info.transmission.tooltip,
          required: true
        })}

        {/* Body Type */}
        {renderSelectField({
          label: labels.bodyType,
          field: "bodyType",
          options: options.bodyType,
          placeholder: info.bodyType.placeholder,
          tooltip: info.bodyType.tooltip,
          required: true
        })}
      </div>
    </div>
  )
}

export default React.memo(CarInfoForm)