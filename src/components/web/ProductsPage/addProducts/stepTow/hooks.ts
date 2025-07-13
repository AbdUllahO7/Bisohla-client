// hooks.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useCarFeatrues } from "@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions";
import { 
  getBodyTypeOptions, 
  getColorOptions, 
  getFuelTypeOptions, 
  getTransmissionOptions, 
  getFeatureCategoryOptions,
  FeatureCategory 
} from "@/core/entities/enums/cars.enums";
import { CarInfoState, ValidationErrors, GroupedFeatures } from "./types";
import { groupFeaturesByCategory, loadFromStorage, saveToStorage, validateForm } from "./utils";
import { SelectFeatureDto, CarListingFeature } from "@/core/entities/models/cars/cars.dto";

/**
 * Custom hook for the AddProductStepTwo component
 */
export const useAddProductStepTwo = (onValidationChange: (isValid: boolean) => void) => {
  const t = useTranslations("addProduct.enteredData.stepTow");
  const locale = useLocale();
  const direction = locale === "ar" ? "rtl" : "ltr";
  
  // State for features from backend - properly typed
  const [allFeatures, setAllFeatures] = useState<SelectFeatureDto[]>([]);
  const [featureCategories, setFeatureCategories] = useState<GroupedFeatures>({});
  
  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    doors: "",
    engineSize: "",
    bodyType : '',
  });
  
  // Main form state
  const [isClient, setIsClient] = useState(false);
  const [carInfo, setCarInfo] = useState<CarInfoState>({
    colorExterior: "",
    fuelType: "",
    bodyType: "",
    transmission: "",
    mileage: "",
    enginePower: "",
    engineSize: "",
    doors: "",
    plateNumber: "",
    vin: "",
    body : '',
    selectedFeatures: []
  });
  
  // Use ref to track previous validation state
  const prevValidState = useRef<boolean | null>(null);
  
  // Use the hook to fetch features from backend
  const { data: featuresData, isLoading: isFeaturesLoading } = useCarFeatrues({ 
    pageSize: 100,
  });

  // Helper function to get translated category name
  const getTranslatedCategoryName = useCallback((categoryKey: string) => {
    try {
      return t(`featureCategory.${categoryKey.toLowerCase()}`) || categoryKey;
    } catch (error) {
      return categoryKey;
    }
  }, [t]);
  
  // Update features when data is loaded
  useEffect(() => {
    if (featuresData?.data?.data) {
      const features = featuresData.data.data as SelectFeatureDto[];
      setAllFeatures(features);
      window.scrollTo(0, 0);

      // Group features by category
      const grouped = groupFeaturesByCategory(features);
      setFeatureCategories(grouped);
    }
  }, [featuresData]);
  
  // Load data from localStorage on client-side
  useEffect(() => {
    setIsClient(true);
    
    const loadedData = loadFromStorage();
    setCarInfo(loadedData);
    
    // Validate loaded data immediately
    validateLoadedData(loadedData);
  }, []);
  
  // Save to localStorage when carInfo changes
  useEffect(() => {
    if (isClient) {
      saveToStorage(carInfo);
    }
  }, [carInfo, isClient]);
  
  // Validate loaded data
  const validateLoadedData = useCallback((data: CarInfoState) => {
    const newValidationErrors = { ...validationErrors };
    
    // Check doors
    const doorsValue = parseInt(data.doors);
    if (data.doors) {
      if (!Number.isInteger(doorsValue) || doorsValue <= 0) {
        newValidationErrors.doors = locale === 'ar' 
          ? "يجب أن يكون عدد الأبواب رقمًا صحيحًا موجبًا" 
          : "Doors must be a positive integer";
      } else if (doorsValue > 10) {
        newValidationErrors.doors = locale === 'ar' 
          ? "يجب ألا يتجاوز عدد الأبواب 10" 
          : "Doors cannot exceed 10";
      } else {
        newValidationErrors.doors = "";
      }
    }
    
    // Check engine size with new range validation (1.0 to 4.0)
    const engineSizeValue = parseFloat(data.engineSize);
    if (data.engineSize) {
      if (isNaN(engineSizeValue) || engineSizeValue <= 0) {
        newValidationErrors.engineSize = locale === 'ar' 
          ? "يجب أن يكون حجم المحرك قيمة موجبة" 
          : "Engine size must be a positive value";
      } 
      else {
        newValidationErrors.engineSize = "";
      }
    }
    
    setValidationErrors(newValidationErrors);
  }, [locale, validationErrors]);
  
  // Handle select change events
  const handleSelectChange = useCallback((field: string, value: string) => {
    setCarInfo(prev => ({ ...prev, [field]: value }));
  }, []);
  
  // Handle text field blur events with validation
  const handleTextFieldBlur = useCallback((field: string, value: string) => {
    setCarInfo(prev => ({ ...prev, [field]: value }));
    
    if (field === 'doors') {
      const doorsValue = parseInt(value);
      if (value) {
        if (!Number.isInteger(doorsValue) || doorsValue <= 0) {
          setValidationErrors(prev => ({ 
            ...prev, 
            doors: locale === 'ar' 
              ? "يجب أن يكون عدد الأبواب رقمًا صحيحًا موجبًا" 
              : "Doors must be a positive integer" 
          }));
        } else if (doorsValue > 10) {
          setValidationErrors(prev => ({ 
            ...prev, 
            doors: locale === 'ar' 
              ? "يجب ألا يتجاوز عدد الأبواب 10" 
              : "Doors cannot exceed 10" 
          }));
        } else {
          setValidationErrors(prev => ({ ...prev, doors: "" }));
        }
      }
    }
    else if (field === 'engineSize') {
      const engineSizeValue = parseFloat(value);
      if (value) {
        if (isNaN(engineSizeValue) || engineSizeValue <= 0) {
          setValidationErrors(prev => ({ 
            ...prev, 
            engineSize: locale === 'ar' 
              ? "يجب أن يكون حجم المحرك قيمة موجبة" 
              : "Engine size must be a positive value" 
          }));
        }  else {
          setValidationErrors(prev => ({ ...prev, engineSize: "" }));
        }
      } else {
        setValidationErrors(prev => ({ ...prev, engineSize: "" }));
      }
    }
  }, [locale]);
  
  // Feature toggle handler
  const handleFeatureToggle = useCallback((featureId: string, category: string) => {
    setCarInfo((prev) => {
      // Convert string featureId to number if needed
      const featureIdNum = parseInt(featureId);
      
      // Find if the feature is already selected
      const existingIndex = prev.selectedFeatures.findIndex(
        feature => feature.featureId === featureId
      );
      
      let updatedFeatures: CarListingFeature[];
      
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
      
      return { 
        ...prev, 
        selectedFeatures: updatedFeatures 
      };
    });
  }, [allFeatures]);
  
  // Form validation effect
  useEffect(() => {
    const isValid = validateForm(carInfo, validationErrors);
    
    if (isValid !== prevValidState.current) {
      prevValidState.current = isValid;
      onValidationChange(isValid);
    }
  }, [carInfo, validationErrors, onValidationChange]);
  
  // Memoized options for selects
  const options = useMemo(
    () => ({
      fuelType: getFuelTypeOptions(t),
      bodyType: getBodyTypeOptions(t),
      transmission: getTransmissionOptions(t),
      colors: getColorOptions(t),
    }),
    [t], 
  );
  
  // Text labels with translations
  const labels = useMemo(
    () => ({
      carInfo: locale === 'ar' ? "معلومات السيارة" : "Car Information",
      carFeatures: locale === 'ar' ? "ميزات السيارة" : "Car Features",
      colorExterior: locale === 'ar' ? "لون الخارجي" : "Exterior Color",
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
      selectFuelType: locale === 'ar' ? "اختر نوع الوقود" : "Select a Fuel Type",
      selectBodyType: locale === 'ar' ? "اختر نوع الهيكل" : "Select a Body Type",
      selectTransmission: locale === 'ar' ? "اختر ناقل الحركة" : "Select a Transmission",
      enterMileage: locale === 'ar' ? "أدخل المسافة المقطوعة" : "Enter mileage",
      enterEnginePower: locale === 'ar' ? "أدخل قوة المحرك" : "Enter engine power",
      enterEngineSize: locale === 'ar' ? "أدخل حجم المحرك (1.0 - 4.0)" : "Enter engine size (1.0 - 4.0)",
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
      invalidDoors: locale === 'ar' ? "يجب ألا يتجاوز عدد الأبواب 10" : "Doors cannot exceed 10",
      invalidDoorsNumber: locale === 'ar' ? "يجب أن يكون عدد الأبواب رقمًا صحيحًا موجبًا" : "Doors must be a positive integer",
      invalidEngineSize: locale === 'ar' ? "يجب أن يكون حجم المحرك قيمة موجبة" : "Engine size must be a positive value",
      invalidEngineSizeRange: locale === 'ar' ? "يجب أن يكون حجم المحرك بين 1.0 و 4.0" : "Engine size must be between 1.0 and 4.0"
    }),
    [locale]
  );
  
  return {
    carInfo,
    validationErrors,
    setValidationErrors,
    allFeatures,
    featureCategories,
    getTranslatedCategoryName, // Return helper function
    isFeaturesLoading,
    labels,
    options,
    locale,
    direction,
    handleSelectChange,
    handleTextFieldBlur,
    handleFeatureToggle
  };
};