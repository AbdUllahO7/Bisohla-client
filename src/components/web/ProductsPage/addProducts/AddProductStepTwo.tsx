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
import { FeatureCategory, getBodyTypeOptions, getColorOptions, getFuelTypeOptions, getTransmissionOptions } from "@/core/entities/enums/cars.enums"
import { CarListingFeature, SelectFeatureDto } from "@/core/entities/models/cars/cars.dto"
import { useCarFeatrues } from "@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions"

// Types
interface AddProductStepTwoProps {
  onValidationChange: (isValid: boolean) => void
}

// Define Feature type
interface Feature {
  id: string;
  label: string;
}

// Define CarInfoState interface
interface CarInfoState {
  price: string;
  currency: string;
  colorExterior: string;
  colorInterior: string;
  fuelType: string;
  bodyType: string;
  transmission: string;
  mileage: string;
  enginePower: string;
  engineSize: string;
  doors: string;
  plateNumber: string;
  vin: string;
  selectedFeatures: CarListingFeature[]; // Changed to array of CarListingFeature objects
  [key: string]: any;
}

// Default state with empty array for selectedFeatures
const defaultState: CarInfoState = {
  price: "",
  currency: "",
  colorExterior: "",
  colorInterior: "",
  fuelType: "",
  bodyType: "",
  transmission: "",
  mileage: "",
  enginePower: "",
  engineSize: "",
  doors: "",
  plateNumber: "",
  vin: "",
  selectedFeatures: [], // Empty array
}

// Storage key for localStorage
const STORAGE_KEY = "addProduct_stepTwo_data"

// Function to group features by category from backend data
const groupFeaturesByCategory = (allFeatures: SelectFeatureDto[]) => {
  const categoriesMap: Record<string, { label: string, features: Feature[] }> = {};
  
  // Group features by their category
  allFeatures.forEach(feature => {
    if (!categoriesMap[feature.category]) {
      categoriesMap[feature.category] = {
        label: feature.category.charAt(0).toUpperCase() + feature.category.slice(1), // Capitalize first letter
        features: []
      };
    }
    
    categoriesMap[feature.category].features.push({
      id: feature.id.toString(),
      label: feature.name
    });
  });
  
  return categoriesMap;
};

const AddProductStepTwo: React.FC<AddProductStepTwoProps> = ({ onValidationChange }) => {
  const t = useTranslations("addProduct.enteredData.stepTow")
  const locale = useLocale()

  // State for features from backend
  const [allFeatures, setAllFeatures] = useState<SelectFeatureDto[]>([])
  const [featureCategories, setFeatureCategories] = useState<Record<string, { label: string, features: Feature[] }>>({})
  
  // UPDATED: Add validation state for error messages
  const [validationErrors, setValidationErrors] = useState({
    doors: "",
    price: "",
    engineSize: ""
  });
  
  // Use the hook to fetch features from backend
  const { data: featuresData, isLoading: isFeaturesLoading } = useCarFeatrues({ 
    page: 1, 
  })
  
  // Update features when data is loaded - matching the exact response structure
  useEffect(() => {
    if (featuresData?.data?.data) {
      const features = featuresData.data.data;
      setAllFeatures(features);
      
      // Group features by category
      const grouped = groupFeaturesByCategory(features);
      setFeatureCategories(grouped);
    }
  }, [featuresData]);

  // State
  const [isClient, setIsClient] = useState(false)
  const [carInfo, setCarInfo] = useState<CarInfoState>(defaultState)
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  // Use ref to track previous validation state to prevent unnecessary updates
  const prevValidState = useRef<boolean | null>(null)

  // Memoized options - now includes feature categories and features from backend
  const options = useMemo(
    () => ({
      currency: getCurrencyOptions(t),
      fuelType: getFuelTypeOptions(t),
      bodyType: getBodyTypeOptions(t),
      transmission: getTransmissionOptions(t),
      colors: getColorOptions(t),
    }),
    [t], 
  )

  // Text labels
  const labels = useMemo(
    () => ({
      carInfo: locale === 'ar' ? "معلومات السيارة" : "Car Information",
      carFeatures: locale === 'ar' ? "ميزات السيارة" : "Car Features",
      price: locale === 'ar' ? "السعر" : "Price",
      currency: locale === 'ar' ? "العملة" : "Currency",
      colorExterior: locale === 'ar' ? "لون الخارجي" : "Exterior Color",
      colorInterior: locale === 'ar' ? "لون الداخلي" : "Interior Color",
      fuelType: locale === 'ar' ? "نوع الوقود" : "Fuel Type",
      bodyType: locale === 'ar' ? "نوع الهيكل" : "Body Type",
      transmission: locale === 'ar' ? "ناقل الحركة" : "Transmission",
      mileage: locale === 'ar' ? "المسافة المقطوعة" : "Mileage",
      enginePower: locale === 'ar' ? "قوة المحرك" : "Engine Power",
      engineSize: locale === 'ar' ? "حجم المحرك" : "Engine Size",
      doors: locale === 'ar' ? "عدد الأبواب" : "Doors",
      plateNumber: locale === 'ar' ? "رقم اللوحة" : "Plate Number",
      vin: locale === 'ar' ? "رقم الهيكل (VIN)" : "VIN",
      selectColorExterior: locale === 'ar' ? "اختر اللون الخارجي" : "Select Exterior Color",
      selectColorInterior: locale === 'ar' ? "اختر اللون الداخلي" : "Select Interior Color",
      selectCurrency: locale === 'ar' ? "اختر العملة" : "Select a currency",
      selectFuelType: locale === 'ar' ? "اختر نوع الوقود" : "Select a Fuel Type",
      selectBodyType: locale === 'ar' ? "اختر نوع الهيكل" : "Select a Body Type",
      selectTransmission: locale === 'ar' ? "اختر ناقل الحركة" : "Select a Transmission",
      enterPrice: locale === 'ar' ? "أدخل السعر" : "Enter price",
      enterMileage: locale === 'ar' ? "أدخل المسافة المقطوعة" : "Enter mileage",
      enterEnginePower: locale === 'ar' ? "أدخل قوة المحرك" : "Enter engine power",
      enterEngineSize: locale === 'ar' ? "أدخل حجم المحرك" : "Enter engine size",
      enterDoors: locale === 'ar' ? "أدخل عدد الأبواب" : "Enter doors count",
      enterPlateNumber: locale === 'ar' ? "أدخل رقم اللوحة" : "Enter plate number",
      enterVin: locale === 'ar' ? "أدخل رقم الهيكل" : "Enter VIN number",
      colors: locale === 'ar' ? "الألوان" : "Colors",
      extColors: locale === 'ar' ? "الألوان الخارجية" : "Exterior Colors",
      intColors: locale === 'ar' ? "الألوان الداخلية" : "Interior Colors",
      currencies: locale === 'ar' ? "العملات" : "Currencies",
      fuelTypes: locale === 'ar' ? "أنواع الوقود" : "Fuel Types",
      bodyTypes: locale === 'ar' ? "أنواع الهيكل" : "Body Types",
      transmissions: locale === 'ar' ? "أنواع ناقل الحركة" : "Transmissions",
      required: locale === 'ar' ? "مطلوب" : "Required",
      loading: locale === 'ar' ? "جاري التحميل..." : "Loading...",
      noFeatures: locale === 'ar' ? "لا توجد ميزات متاحة" : "No features available",
      // Error messages
      invalidDoors: locale === 'ar' ? "يجب ألا يتجاوز عدد الأبواب 10" : "Doors cannot exceed 10",
      invalidDoorsNumber: locale === 'ar' ? "يجب أن يكون عدد الأبواب رقمًا صحيحًا موجبًا" : "Doors must be a positive integer",
      invalidPrice: locale === 'ar' ? "يجب أن يكون السعر قيمة موجبة" : "Price must be a positive value",
      invalidEngineSize: locale === 'ar' ? "يجب أن يكون حجم المحرك قيمة موجبة" : "Engine size must be a positive value"
    }),
    [locale === 'ar'],
  )

  // Load data from localStorage on client-side
  useEffect(() => {
    setIsClient(true)
    try {
      const savedData = localStorage.getItem(STORAGE_KEY)
      if (savedData) {
        const parsed = JSON.parse(savedData)
  
        // Ensure selectedFeatures is an array that matches CarListingFeature structure
        if (parsed.selectedFeatures) {
          // Handle different storage formats
          if (!Array.isArray(parsed.selectedFeatures)) {
            // If stored as an object with categories, convert to array of objects
            const featureArray: CarListingFeature[] = [];
            
            // Loop through each category
            Object.entries(parsed.selectedFeatures).forEach(([category, featureIds]) => {
              // Convert each feature ID to a CarListingFeature object
              (featureIds as string[]).forEach(featureId => {
                featureArray.push({
                  id: 0, // This will be assigned by the backend
                  carListingId: 0, // This will be assigned by the backend
                  featureId: featureId,
                  feature: {
                    id: parseInt(featureId),
                    name: "", // We don't need to populate this as it's just for reference
                    category: category as FeatureCategory,
                    icon: null,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    deletedAt: null
                  }
                });
              });
            });
            
            parsed.selectedFeatures = featureArray;
          }
        } else {
          parsed.selectedFeatures = [];
        }
  
        // Handle migration from old 'color' to new 'colorExterior' and 'colorInterior'
        if (parsed.color && !parsed.colorExterior) {
          parsed.colorExterior = parsed.color;
          delete parsed.color;
        }
  
        setCarInfo(parsed);
        
        // VALIDATE LOADED DATA IMMEDIATELY
        // Check price
        const priceValue = parseFloat(parsed.price);
        if (parsed.price && (isNaN(priceValue) || priceValue <= 0)) {
          setValidationErrors(prev => ({ ...prev, price: labels.invalidPrice }));
        }
        
        // Check doors
        const doorsValue = parseInt(parsed.doors);
        if (parsed.doors) {
          if (!Number.isInteger(doorsValue) || doorsValue <= 0) {
            setValidationErrors(prev => ({ ...prev, doors: labels.invalidDoorsNumber }));
          } else if (doorsValue > 10) {
            setValidationErrors(prev => ({ ...prev, doors: labels.invalidDoors }));
          }
        }
        
        // Check engine size
        const engineSizeValue = parseFloat(parsed.engineSize);
        if (parsed.engineSize && (isNaN(engineSizeValue) || engineSizeValue <= 0)) {
          setValidationErrors(prev => ({ ...prev, engineSize: labels.invalidEngineSize }));
        }
      }
    } catch (e) {
      console.error("Failed to parse saved data:", e);
    }
  }, [labels]);
  
  // Save to localStorage
  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(carInfo))
    }
  }, [carInfo, isClient])

  // Field change handler for all inputs except price
  const handleChange = useCallback((field: string, value: string) => {
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

  // UPDATED: Price blur handler with validation
  const handlePriceBlur = useCallback(() => {
    const priceValue = priceInputRef.current?.value || "";
    const priceNumber = parseFloat(priceValue);
    
    // Validate price (must be positive)
    let priceError = "";
    if (priceValue && (isNaN(priceNumber) || priceNumber <= 0)) {
      priceError = labels.invalidPrice;
    }
    
    setValidationErrors(prev => ({ ...prev, price: priceError }));
    
    setCarInfo((prev) => ({
      ...prev,
      price: priceValue,
    }));
  }, [labels.invalidPrice]);

  // UPDATED: Doors blur handler with validation for max 10 doors
  const handleDoorsBlur = useCallback(() => {
    const doorValue = doorsInputRef.current?.value || "";
    const doorNumber = parseInt(doorValue);
    
    // Validate doors (max 10)
    let doorError = "";
    if (doorValue && (!Number.isInteger(doorNumber) || doorNumber <= 0)) {
      doorError = labels.invalidDoorsNumber;
    } else if (doorNumber > 10) {
      doorError = labels.invalidDoors;
    }
    
    setValidationErrors(prev => ({ ...prev, doors: doorError }));
    
    setCarInfo((prev) => ({
      ...prev,
      doors: doorValue,
    }));
  }, [labels.invalidDoors, labels.invalidDoorsNumber]);

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

  // UPDATED: Engine Size blur handler with validation
  const handleEngineSizeBlur = useCallback(() => {
    const engineSizeValue = engineSizeInputRef.current?.value || "";
    const engineSizeNumber = parseFloat(engineSizeValue);
    
    // Validate engine size (must be positive)
    let engineSizeError = "";
    if (engineSizeValue && (isNaN(engineSizeNumber) || engineSizeNumber <= 0)) {
      engineSizeError = labels.invalidEngineSize;
    }
    
    setValidationErrors(prev => ({ ...prev, engineSize: engineSizeError }));
    
    setCarInfo((prev) => ({
      ...prev,
      engineSize: engineSizeValue,
    }));
  }, [labels.invalidEngineSize]);
  
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

  // Feature toggle handler - updated to store features by category
  const handleFeatureToggle = useCallback((featureId: string, category: string) => {
    setCarInfo((prev) => {
      // Convert string featureId to number if needed
      const featureIdNum = parseInt(featureId);
      
      // Find if the feature is already selected
      const existingIndex = prev.selectedFeatures.findIndex(
        feature => feature.featureId === featureId
      );
      
      let updatedFeatures;
      
      if (existingIndex !== -1) {
        // If feature exists, remove it (toggle off)
        updatedFeatures = [
          ...prev.selectedFeatures.slice(0, existingIndex),
          ...prev.selectedFeatures.slice(existingIndex + 1)
        ];
      } else {
        // If feature doesn't exist, add it (toggle on)
        // Find the actual feature from allFeatures to get its details
        const featureDetails = allFeatures.find(f => f.id.toString() === featureId);
        
        const newFeature: CarListingFeature = {
          id: 0, // Will be assigned by backend
          carListingId: 0, // Will be assigned by backend
          featureId: featureId,
          feature: {
            id: featureIdNum, 
            name: featureDetails?.name || "", 
            category: category as FeatureCategory,
            icon: featureDetails?.icon || null,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null
          }
        };
        
        updatedFeatures = [...prev.selectedFeatures, newFeature];
      }
      
      return { ...prev, selectedFeatures: updatedFeatures };
    });
  }, [allFeatures]); // Added allFeatures to dependencies
  
  // Helper to check if a feature is selected
  const isFeatureSelected = useCallback(
    (featureId: string, category: string) => {
      return carInfo.selectedFeatures.some(feature => 
        feature.featureId === featureId
      );
    },
    [carInfo.selectedFeatures]
  );

  // UPDATED: Validation effect - Check required fields + doors max 10 + positive price + positive engine size
  useEffect(() => {
    const requiredFields = [
      "currency", "colorExterior", "colorInterior", "fuelType", "bodyType", "transmission", 
      "plateNumber", "mileage", "enginePower", "engineSize", "doors", "vin"
    ]
    
    // Price validation
    const priceValue = typeof carInfo.price === 'string' 
      ? parseFloat(carInfo.price) 
      : carInfo.price
    
    const isPriceValid = !isNaN(priceValue) && priceValue > 0
    
    // Doors validation
    const doorsValue = typeof carInfo.doors === 'string'
      ? parseInt(carInfo.doors)
      : carInfo.doors
    
    const isDoorsValid = Number.isInteger(doorsValue) && doorsValue > 0 && doorsValue <= 10
    
    // Engine Size validation
    const engineSizeValue = typeof carInfo.engineSize === 'string' 
      ? parseFloat(carInfo.engineSize) 
      : carInfo.engineSize
    
    const isEngineSizeValid = !isNaN(engineSizeValue) && engineSizeValue > 0
    
    // Other fields validation
    const areOtherFieldsValid = requiredFields
      .filter(field => field !== 'doors' && field !== 'engineSize') // Handling these separately
      .every((field) => Boolean(carInfo[field as keyof CarInfoState]))
    
    // Form is valid if all conditions are met AND there are no validation errors
    const isValid = isPriceValid && isDoorsValid && isEngineSizeValid && areOtherFieldsValid && 
              !validationErrors.doors && !validationErrors.price && !validationErrors.engineSize
  
    // Only call onValidationChange if validation state changed
    if (isValid !== prevValidState.current) {
      prevValidState.current = isValid
      onValidationChange(isValid)
    }
  }, [carInfo, validationErrors, onValidationChange])

  // UPDATED: FormField component for consistent styling and error handling
  const FormField = useCallback(
    ({
      label,
      field,
      children,
      required = false,
      error = "",
    }: {
      label: string
      field: string
      children: React.ReactNode
      required?: boolean
      error?: string
    }) => (
      <div className="flex flex-col gap-2 w-full">
        <Text className="font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Text>
        {children}
        {error && (
          <div className="text-red-500 text-sm mt-1">
            {error}
          </div>
        )}
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
      field: string
      options: any[]
      placeholder: string
      optionsLabel: string
      required?: boolean
    }) => (
      <FormField label={label} field={field} required={required}>
        <Select
          value={String(carInfo[field])}
          onValueChange={(value) => handleChange(field, value)}
          dir={locale === 'ar' ? "rtl" : "ltr"}
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
    [carInfo, handleChange, locale === 'ar', FormField],
  )

  // Car information form
  const CarInfoForm = () => (
    <div className="grid gap-5 p-5 w-full">
      {/* Price and Currency - Grid for these two fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <FormField 
          label={labels.price} 
          field="price" 
          required
          error={validationErrors.price}
        >
          <Input
            type="text"
            ref={priceInputRef}
            defaultValue={carInfo.price || ""}
            onBlur={handlePriceBlur}
            placeholder={labels.enterPrice}
            className={`w-full ${validationErrors.price ? "border-red-500" : ""}`}
          />
        </FormField>

        <FormField label={labels.currency} field="currency" required>
          <Select
            value={carInfo.currency}
            onValueChange={(value) => handleChange("currency", value)}
            dir={locale === 'ar' ? "rtl" : "ltr"}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={labels.selectCurrency} />
            </SelectTrigger>
            <SelectContent dir={locale === 'ar' ? "rtl" : "ltr"}>
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

      {/* Mileage and Engine Power */}
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

      {/* Engine Size and Doors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <FormField 
          label={labels.engineSize} 
          field="engineSize" 
          required
          error={validationErrors.engineSize}
        >
          <Input
            type="text"
            ref={engineSizeInputRef}
            defaultValue={carInfo.engineSize || ""}
            onBlur={handleEngineSizeBlur}
            placeholder={labels.enterEngineSize}
            className={`w-full ${validationErrors.engineSize ? "border-red-500" : ""}`}
          />
        </FormField>

        <FormField 
          label={labels.doors} 
          field="doors" 
          required
          error={validationErrors.doors}
        >
          <Input
            type="text"
            ref={doorsInputRef}
            defaultValue={carInfo.doors || ""}
            onBlur={handleDoorsBlur}
            placeholder={labels.enterDoors}
            className={`w-full ${validationErrors.doors ? "border-red-500" : ""}`}
          />
        </FormField>
      </div>

      {/* Plate Number and VIN */}
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

      {/* Transmission */}
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

  // Features section - completely redesigned to display features from backend
  const FeaturesSection = () => {
    if (isFeaturesLoading) {
      return (
        <div className="p-5 text-center">
          <Text className="text-primary">{labels.loading}</Text>
        </div>
      );
    }
    
    // Check if we have any features
    if (allFeatures.length === 0) {
      return (
        <div className="p-5 text-center">
          <Text>{labels.noFeatures}</Text>
        </div>
      );
    }
    
    // Get unique categories from features
    const categories = Object.entries(featureCategories);
    
    if (categories.length === 0) {
      return (
        <div className="p-5 text-center">
          <Text>{labels.noFeatures}</Text>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-5">
        {categories.map(([categoryKey, categoryData]) => (
          <div key={categoryKey} className="flex flex-col items-start gap-3">
            <Text className="text-primary text-xl font-bold mb-2">{categoryData.label}</Text>
            <div className="space-y-3 w-full">
              {categoryData.features.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2">
                  <Checkbox
                    id={feature.id}
                    checked={isFeatureSelected(feature.id, categoryKey)}
                    onCheckedChange={() => handleFeatureToggle(feature.id, categoryKey)}
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
        ))}
      </div>
    );
  };

  // Main component render
  return (
    <div className="w-full space-y-6" dir={locale === 'ar' ? "rtl" : "ltr"}>
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