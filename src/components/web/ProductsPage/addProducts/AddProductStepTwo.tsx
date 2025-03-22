"use client"

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react"
import Text from "@/components/text/text"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useLocale, useTranslations } from "next-intl"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { getCurrencyOptions } from "@/core/entities/enums/currency.enum"
import { getBodyTypeOptions, getColorOptions, getFeatureCategoryOptions, getFeaturesByCategory, getFuelTypeOptions, getTransmissionOptions } from "@/core/entities/enums/cars.enums"

// Types
interface AddProductStepTwoProps {
  onValidationChange: (isValid: boolean) => void
}

interface Feature {
  id: string
  label: string
}

interface FeatureCategory {
  value: string
  label: string
}

interface FeaturesData {
  [category: string]: Feature[]
}

// Modified to separate exterior and interior colors
interface CarInfoState {
  price: string | number
  currency: string
  colorExterior: string  // Changed from color to colorExterior
  colorInterior: string  // Added new field for interior color
  fuelType: string
  bodyType: string
  transmission: string
  additionalInfo: string
  mileage: string | number
  enginePower: string | number
  engineSize: string | number
  doors: string | number
  plateNumber: string | number
  vin: string | number
  selectedFeatures: {
    [category: string]: string[]
  }
}

// Storage key for localStorage
const STORAGE_KEY = "addProduct_stepTwo_data"

// Default state with updated selectedFeatures structure and new fields
const defaultState: CarInfoState = {
  price: "",
  currency: "",
  colorExterior: "",  // Updated field name
  colorInterior: "",  // Added new field
  fuelType: "",
  bodyType: "",
  transmission: "",
  additionalInfo: "",
  mileage: "",
  enginePower: "",
  engineSize: "",
  doors: "",
  plateNumber: "",
  vin: "",
  selectedFeatures: {},
}

const AddProductStepTwo: React.FC<AddProductStepTwoProps> = ({ onValidationChange }) => {
  const t = useTranslations("addProduct.enteredData.stepTow")
  const locale = useLocale()
  const isRTL = locale !== "ltr"

  // State
  const [isClient, setIsClient] = useState(false)
  const [carInfo, setCarInfo] = useState<CarInfoState>(defaultState)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // Use ref to track previous validation state to prevent unnecessary updates
  const prevValidState = useRef<boolean | null>(null)

  // Memoized options
  const options = useMemo(
    () => ({
      currency: getCurrencyOptions(t),
      fuelType: getFuelTypeOptions(t),
      bodyType: getBodyTypeOptions(t),
      transmission: getTransmissionOptions(t),
      featureCategories: getFeatureCategoryOptions(t) as FeatureCategory[],
      features: getFeaturesByCategory(t) as FeaturesData,
      colors: getColorOptions(t),
    }),
    [t],
  )

  // Text labels
  const labels = useMemo(
    () => ({
      carInfo: isRTL ? "معلومات السيارة" : "Car Information",
      carFeatures: isRTL ? "ميزات السيارة" : "Car Features",
      price: isRTL ? "السعر" : "Price",
      currency: isRTL ? "العملة" : "Currency",
      colorExterior: isRTL ? "لون الخارجي" : "Exterior Color",  // Updated label
      colorInterior: isRTL ? "لون الداخلي" : "Interior Color",  // Added new label
      fuelType: isRTL ? "نوع الوقود" : "Fuel Type",
      bodyType: isRTL ? "نوع الهيكل" : "Body Type",
      transmission: isRTL ? "ناقل الحركة" : "Transmission",
      mileage: isRTL ? "المسافة المقطوعة" : "Mileage",
      enginePower: isRTL ? "قوة المحرك" : "Engine Power",
      engineSize: isRTL ? "حجم المحرك" : "Engine Size",
      doors: isRTL ? "عدد الأبواب" : "Doors",
      plateNumber: isRTL ? "رقم اللوحة" : "Plate Number",
      vin: isRTL ? "رقم الهيكل (VIN)" : "VIN",
      selectColorExterior: isRTL ? "اختر اللون الخارجي" : "Select Exterior Color",  // Updated placeholder
      selectColorInterior: isRTL ? "اختر اللون الداخلي" : "Select Interior Color",  // Added new placeholder
      selectCurrency: isRTL ? "اختر العملة" : "Select a currency",
      selectFuelType: isRTL ? "اختر نوع الوقود" : "Select a Fuel Type",
      selectBodyType: isRTL ? "اختر نوع الهيكل" : "Select a Body Type",
      selectTransmission: isRTL ? "اختر ناقل الحركة" : "Select a Transmission",
      enterPrice: isRTL ? "أدخل السعر" : "Enter price",
      enterMileage: isRTL ? "أدخل المسافة المقطوعة" : "Enter mileage",
      enterEnginePower: isRTL ? "أدخل قوة المحرك" : "Enter engine power",
      enterEngineSize: isRTL ? "أدخل حجم المحرك" : "Enter engine size",
      enterDoors: isRTL ? "أدخل عدد الأبواب" : "Enter doors count",
      enterPlateNumber: isRTL ? "أدخل رقم اللوحة" : "Enter plate number",
      enterVin: isRTL ? "أدخل رقم الهيكل" : "Enter VIN number",
      colors: isRTL ? "الألوان" : "Colors",
      extColors: isRTL ? "الألوان الخارجية" : "Exterior Colors", // Added for exterior colors label
      intColors: isRTL ? "الألوان الداخلية" : "Interior Colors", // Added for interior colors label
      currencies: isRTL ? "العملات" : "Currencies",
      fuelTypes: isRTL ? "أنواع الوقود" : "Fuel Types",
      bodyTypes: isRTL ? "أنواع الهيكل" : "Body Types",
      transmissions: isRTL ? "أنواع ناقل الحركة" : "Transmissions",
      required: isRTL ? "مطلوب" : "Required",
    }),
    [isRTL],
  )

  // Load data from localStorage on client-side
  useEffect(() => {
    setIsClient(true)
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsed = JSON.parse(savedData)

        // Handle migration from old format (array) to new format (object by category)
        if (Array.isArray(parsed.selectedFeatures)) {
          // Create a map to find which category each feature belongs to
          const featureToCategory: Record<string, string> = {}

          // Build the map from options
          Object.entries(options.features).forEach(([category, features]) => {
            features.forEach((feature: Feature) => {
              featureToCategory[feature.id] = category
            })
          })

          // Convert array to categorized object
          const categorizedFeatures: Record<string, string[]> = {}
          parsed.selectedFeatures.forEach((featureId: string) => {
            const category = featureToCategory[featureId]
            if (category) {
              if (!categorizedFeatures[category]) {
                categorizedFeatures[category] = []
              }
              categorizedFeatures[category].push(featureId)
            }
          })

          // Update parsed data with new structure
          parsed.selectedFeatures = categorizedFeatures
        }

        // Handle migration from old 'color' to new 'colorExterior' and 'colorInterior'
        if (parsed.color && !parsed.colorExterior) {
          parsed.colorExterior = parsed.color
          delete parsed.color
        }

        setCarInfo(parsed)
      }
    } catch (e) {
      console.error("Failed to parse saved data:", e)
    }
  }, [options.features])

  // Save to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carInfo))
    }
  }, [carInfo, isClient])

  // Field change handler for all inputs except price
  const handleChange = useCallback((field: keyof CarInfoState, value: string) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }))
    setCarInfo((prev) => ({ ...prev, [field]: value }))
  }, [])

  // Input refs for numerical fields
  const priceInputRef = useRef<HTMLInputElement>(null)
  const mileageInputRef = useRef<HTMLInputElement>(null)
  const enginePowerInputRef = useRef<HTMLInputElement>(null)
  const engineSizeInputRef = useRef<HTMLInputElement>(null)
  const doorsInputRef = useRef<HTMLInputElement>(null)
  const vinInputRef = useRef<HTMLInputElement>(null)
  const plateInputRef = useRef<HTMLInputElement>(null)

  // Handle blur events for numerical inputs
  const handlePriceBlur = useCallback(() => {
    setCarInfo((prev) => ({
      ...prev,
      price: priceInputRef.current?.value || "",
    }))
  }, [])

  const handleMileageBlur = useCallback(() => {
    setCarInfo((prev) => ({
      ...prev,
      mileage: mileageInputRef.current?.value || "",
    }))
  }, [])

  const handleEnginePowerBlur = useCallback(() => {
    setCarInfo((prev) => ({
      ...prev,
      enginePower: enginePowerInputRef.current?.value || "",
    }))
  }, [])

  const handleEngineSizeBlur = useCallback(() => {
    setCarInfo((prev) => ({
      ...prev,
      engineSize: engineSizeInputRef.current?.value || "",
    }))
  }, [])

  const handleDoorsBlur = useCallback(() => {
    setCarInfo((prev) => ({
      ...prev,
      doors: doorsInputRef.current?.value || "",
    }))
  }, [])
  
  const handleVinBlur = useCallback(() => {
    setCarInfo((prev) => ({
      ...prev,
      vin: vinInputRef.current?.value || "", 
    }))
  }, [])
  
  const handlePlateBlur = useCallback(() => {
    setCarInfo((prev) => ({
      ...prev,
      plateNumber: plateInputRef.current?.value || "", 
    }))
  }, [])


  // Feature toggle handler - updated to handle categorized features
  const handleFeatureToggle = useCallback((featureId: string, category: string) => {
    setCarInfo((prev) => {
      // Create a copy of the current selectedFeatures
      const selectedFeatures = { ...prev.selectedFeatures };
  
      // Ensure category array exists
      if (!selectedFeatures[category]) {
        selectedFeatures[category] = [];
      }
  
      // Check if feature is already selected in this category
      const categoryFeatures = selectedFeatures[category];
      const isSelected = categoryFeatures.includes(featureId);
  
      // Update the category's feature list
      if (isSelected) {
        // Remove the feature
        selectedFeatures[category] = categoryFeatures.filter((id) => id !== featureId);
        // Clean up empty categories
        if (selectedFeatures[category].length === 0) {
          delete selectedFeatures[category];
        }
      } else {
        // Add the feature
        selectedFeatures[category] = [...categoryFeatures, featureId];
      }
  
      return { ...prev, selectedFeatures };
    });
  }, []);

  // Helper to check if a feature is selected
  const isFeatureSelected = useCallback(
    (featureId: string, category: string) => {
      return carInfo.selectedFeatures[category]?.includes(featureId) || false;
    },
    [carInfo.selectedFeatures]
  );

  // Validation effect - Check required fields
  useEffect(() => {
    const requiredFields = [
      "currency", "colorExterior", "colorInterior", "fuelType", "bodyType", "transmission", 
      "plateNumber", "mileage", "enginePower", "engineSize", "doors", "vin"
    ]
    
    // Check price separately - Convert to number for validation
    const priceValue = typeof carInfo.price === 'string' 
      ? parseFloat(carInfo.price) 
      : carInfo.price
    
    const isPriceValid = !isNaN(priceValue) && priceValue > 0
    const areOtherFieldsValid = requiredFields.every((field) => Boolean(carInfo[field as keyof CarInfoState]))
    const isValid = isPriceValid && areOtherFieldsValid
  
    // Only call onValidationChange if validation state changed
    if (isValid !== prevValidState.current) {
      prevValidState.current = isValid
      onValidationChange(isValid)
    }
  }, [carInfo, onValidationChange])

  // FormField component for consistent styling and error handling
  const FormField = useCallback(
    ({
      label,
      field,
      children,
      required = false,
    }: {
      label: string
      field: string
      children: React.ReactNode
      required?: boolean
    }) => (
      <div className="flex flex-col gap-2 w-full">
        <Text className="font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Text>
        {children}
      </div>
    ),
    [],
  )

  // SelectField component to reduce repetition
  const SelectField = useCallback(
    ({
      label,
      field,
      options,
      placeholder,
      optionsLabel,
      required = false,
    }: {
      label: string
      field: keyof CarInfoState
      options: any[]
      placeholder: string
      optionsLabel: string
      required?: boolean
    }) => (
      <FormField label={label} field={field} required={required}>
        <Select
          value={String(carInfo[field])}
          onValueChange={(value) => handleChange(field, value)}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent className="w-full bg-white">
            <SelectGroup>
              <SelectLabel className="text-black font-bold">{optionsLabel}</SelectLabel>
              {options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  className="flex hover:bg-primary-foreground items-center justify-start gap-2"
                >
                  {/* Display color circle if the option has a hex color value */}
                  {option.hex && (
                    <span
                      className="w-3 h-3 rounded-full inline-block mr-1 ml-1"
                      style={{ backgroundColor: option.hex }}
                    />
                  )}
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </FormField>
    ),
    [carInfo, handleChange, isRTL, FormField],
  )

  // Car information form
  const CarInfoForm = () => (
    <div className="grid gap-5 p-5 w-full">
      {/* Price and Currency - Grid for these two fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <FormField label={labels.price} field="price" required>
          <Input
            type="text"
            ref={priceInputRef}
            defaultValue={carInfo.price || ""}
            onBlur={handlePriceBlur}
            placeholder={labels.enterPrice}
            className="w-full"
          />
        </FormField>

        <FormField label={labels.currency} field="currency" required>
          <Select
            value={carInfo.currency}
            onValueChange={(value) => handleChange("currency", value)}
            dir={isRTL ? "rtl" : "ltr"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={labels.selectCurrency} />
            </SelectTrigger>
            <SelectContent dir={isRTL ? "rtl" : "ltr"}>
              <SelectGroup>
                <SelectLabel>{labels.currencies}</SelectLabel>
                {options.currency.map((option) => (
                  <SelectItem className="hover:bg-primary-foreground" key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>
      </div>

      {/* Mileage and Engine Power - Added new row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full" >
        <FormField label={labels.mileage} field="mileage" required>
          <Input
            type="text"
            ref={mileageInputRef}
            defaultValue={carInfo.mileage || ""}
            onBlur={handleMileageBlur}
            placeholder={labels.enterMileage}
            className="w-full"
          />
        </FormField>

        <FormField label={labels.enginePower} field="enginePower" required>
          <Input
            type="text"
            ref={enginePowerInputRef}
            defaultValue={carInfo.enginePower || ""}
            onBlur={handleEnginePowerBlur}
            placeholder={labels.enterEnginePower}
            className="w-full"
          />
        </FormField>
      </div>

      {/* Engine Size and Doors - Added new row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <FormField label={labels.engineSize} field="engineSize" required>
          <Input
            type="text"
            ref={engineSizeInputRef}
            defaultValue={carInfo.engineSize || ""}
            onBlur={handleEngineSizeBlur}
            placeholder={labels.enterEngineSize}
            className="w-full"
          />
        </FormField>

        <FormField label={labels.doors} field="doors" required>
          <Input
            type="text"
            ref={doorsInputRef}
            defaultValue={carInfo.doors || ""}
            onBlur={handleDoorsBlur}
            placeholder={labels.enterDoors}
            className="w-full"
          />
        </FormField>
      </div>

      {/* Plate Number and VIN - Added new row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full" >
        <FormField label={labels.plateNumber} field="plateNumber" required>
          <Input
            type="text"
            ref={plateInputRef}
            defaultValue={carInfo.plateNumber || ""}
            placeholder={labels.enterPlateNumber}
            onBlur={handlePlateBlur}
            className="w-full"
          />
        </FormField>

        <FormField label={labels.vin} field="vin" required>
          <Input
            type="text"
            ref={vinInputRef}
            defaultValue={carInfo.vin || ""}
            placeholder={labels.enterVin}
            onBlur={handleVinBlur}
            className="w-full"
          />
        </FormField>
      </div>

      {/* Exterior and Interior Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" >
        <SelectField
          label={labels.colorExterior}
          field="colorExterior"
          options={options.colors}
          placeholder={labels.selectColorExterior}
          optionsLabel={labels.extColors}
          required
        />
        
        <SelectField
          label={labels.colorInterior}
          field="colorInterior"
          options={options.colors}
          placeholder={labels.selectColorInterior}
          optionsLabel={labels.intColors}
          required
        />
      </div>

      {/* Fuel Type and Body Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label={labels.fuelType}
          field="fuelType"
          options={options.fuelType}
          placeholder={labels.selectFuelType}
          optionsLabel={labels.fuelTypes}
          required
        />
        
        <SelectField
          label={labels.bodyType}
          field="bodyType"
          options={options.bodyType}
          placeholder={labels.selectBodyType}
          optionsLabel={labels.bodyTypes}
          required
        />
      </div>

      {/* Transmission (last row) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField
          label={labels.transmission}
          field="transmission"
          options={options.transmission}
          placeholder={labels.selectTransmission}
          optionsLabel={labels.transmissions}
          required
        />
      </div>
    </div>
  )

  // Features section - updated to use categorized features
  const FeaturesSection = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
      {options.featureCategories.map((category) => {
        const categoryFeatures = options.features[category.value] || [];
  
        if (categoryFeatures.length === 0) return null;
  
        return (
          <div key={category.value} className="flex flex-col items-start gap-3">
            <Text className="text-primary text-xl font-bold mb-2">{category.label}</Text>
            <div className="space-y-3 w-full">
              {categoryFeatures.map((feature: Feature) => (
                <div key={feature.id} className="flex items-center gap-2">
                  <Checkbox
                    id={feature.id}
                    checked={isFeatureSelected(feature.id, category.value)}
                    onCheckedChange={() => handleFeatureToggle(feature.id, category.value)}
                  />
                  <label
                    htmlFor={feature.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {feature.label}
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Main component render
  return (
    <div className="w-full space-y-6" dir={isRTL ? "rtl" : "ltr"}>
      {/* Car Information Section */}
      <Card className="w-full shadow-sm">
        <CardHeader className="bg-gray-100 py-4">
          <Text className="text-xl font-bold text-primary text-center">{labels.carInfo}</Text>
        </CardHeader>
        <CardContent className="p-0">
          <CarInfoForm />
        </CardContent>
      </Card>

      {/* Car Features Section */}
      <Card className="w-full shadow-sm">
        <CardHeader className="bg-gray-100 py-4">
          <Text className="text-xl font-bold text-primary text-center">{labels.carFeatures}</Text>
        </CardHeader>
        <CardContent className="p-0">
          <FeaturesSection />
        </CardContent>
      </Card>
    </div>
  )
}

export default React.memo(AddProductStepTwo)