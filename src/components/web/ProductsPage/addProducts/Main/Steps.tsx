'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Tabs } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';
import { useSettings } from '@/providers/settings.provider';

// Import components
import { getRequiredFieldsMessage, getErrorDialogTexts } from './utils';
import { StepContent } from './Components/StepContent';
import AddProductStepFour from '../StepFour/AddProductStepFour';
import ErrorDialog from './Components/ErrorDialog';
import { StepTrigger, StepperContainer } from './Components/StepTrigger';
import AddProductTypeSelection from '../TypeSelection/AddProductTypeSelection';
import DynamicFormStep from './Components/DynamicFormStep';
import CarPhotosSection from '../StepThree/CarPhotosSection';
import { getInjection } from '@/di/container';
import { ListingTypeDto, ListingTypeFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { useMemo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useStepManagement } from './hooks/useStepManagement';
import { getStorageKey, STORAGE_KEYS } from './hooks/useLocalStorage';
import { getStepNavigationMessages, showStepNavigationToast } from './utils/stepNavigationUtils';

// Props interface for Steps component
interface StepsProps {
  isEditMode?: boolean;
  carId?: number;
  initialData?: any;
}

const Steps: React.FC<StepsProps> = ({ isEditMode = false, carId, initialData }) => {
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isArabic = direction === 'rtl';

  const { getListingsSettings } = useSettings();
  const listingsSettings = getListingsSettings();
  const minImages = listingsSettings?.images?.min_images_per_listing ?? 5;
  
  // Add state for step four validation
  const [stepFourIsValid, setStepFourIsValid] = useState(false);

  // Dynamic Step States
  const [selectedType, setSelectedType] = useState<ListingTypeDto | null>(null);
  const [schema, setSchema] = useState<ListingTypeFormSchemaDto | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  
  const categoryName = useMemo(() => {
    return selectedType?.name || (isArabic ? 'إعلان' : 'Listing');
  }, [selectedType, isArabic]);
  
  // Photo State
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoValidation, setPhotoValidation] = useState(false);
  const coverImageRef = useRef<any>(null);

  // Fetch schema when type is selected
  useEffect(() => {
    if (selectedType) {
      const fetchSchema = async () => {
        setLoadingSchema(true);
        try {
          const controller = getInjection('IListingTypesRepoController');
          const res = await controller.getFormSchema(selectedType.id);
          if (res.success && res.data) {
            setSchema({ ...res.data, listingTypeId: selectedType.id });
          }
        } catch (error) {
          console.error("Failed to fetch schema", error);
        } finally {
          setLoadingSchema(false);
        }
      };
      fetchSchema();
    }
  }, [selectedType]);

  const dynamicSteps = useMemo(() => {
    const baseSteps = isEditMode ? [] : ["typeSelection"];
    if (schema) {
      const sectionSteps = schema.sections.map(s => `section_${s.id}`);
      return [...baseSteps, ...sectionSteps, "carPhotos", "adsInfo"];
    }
    return baseSteps;
  }, [schema, isEditMode]);
  
  // Use the step management hook with edit mode flag and dynamic steps
  const {
    steps,
    currentStep,
    setCurrentStep,
    isSubmitting,
    showErrorDialog,
    errorMessage,
    stepValidation,
    validationAttempted,
    handleNext,
    handleBack,
    updateStepValidation,
    handleTryAgain,
    setShowErrorDialog,
    isStepAccessible,
    getStepProgress,
  } = useStepManagement(isEditMode, dynamicSteps);

  // Load initial photos from localStorage or initialData
  useEffect(() => {
    if (isEditMode && initialData?.images) {
      const imageUrls = initialData.images.map((img: any) => typeof img === 'string' ? img : img.url);
      setPhotos(imageUrls);
      updateStepValidation('carPhotos', imageUrls.length >= minImages);
    } else {
      const storageKey = getStorageKey('STEP_THREE', isEditMode);
      const savedPhotos = localStorage.getItem(storageKey); // Photos were step 3 in old design
      if (savedPhotos) {
        try {
          const parsed = JSON.parse(savedPhotos);
          if (Array.isArray(parsed.coverImage)) {
            setPhotos(parsed.coverImage);
            updateStepValidation('carPhotos', parsed.coverImage.length >= minImages);
          }
        } catch (e) {
          console.error("Failed to parse saved photos", e);
        }
      }
    }
  }, [isEditMode, initialData, updateStepValidation, minImages]);

  // Save photos to localStorage whenever they change
  useEffect(() => {
    if (photos.length > 0) {
      const storageKey = getStorageKey('STEP_THREE', isEditMode);
      const current = localStorage.getItem(storageKey);
      const parsed = current ? JSON.parse(current) : {};
      localStorage.setItem(storageKey, JSON.stringify({
        ...parsed,
        coverImage: photos
      }));
    }
  }, [photos, isEditMode]);

  // Load initial Listing Type from localStorage or initialData
  useEffect(() => {
    if (isEditMode && initialData) {
      // Find the listing type from initialData
      // If we only have ID, we might need to fetch the full object or just set ID
      // For now, let's assume we can at least set the ID to trigger schema fetch
      const typeId = initialData.listingTypeId || (initialData.data?.[0]?.listingTypeId);
      if (typeId && (!selectedType || selectedType.id !== typeId)) {
        // We set a partial type object, the fetchSchema useEffect will handle the rest
        setSelectedType({ id: typeId } as any);
        updateStepValidation('typeSelection', true);
      }
    } else if (!isEditMode) {
      const savedType = localStorage.getItem(STORAGE_KEYS.STEP_ONE);
      if (savedType) {
        try {
          const parsed = JSON.parse(savedType);
          // Only update if current selectedType is different to prevent loops
          if (!selectedType || parsed.id !== selectedType.id) {
            setSelectedType(parsed);
            updateStepValidation('typeSelection', true);
          }
        } catch (e) {
          console.error("Failed to parse saved type", e);
        }
      }
    }
  }, [isEditMode, initialData, selectedType, updateStepValidation]);

  const handleTypeSelect = (type: ListingTypeDto) => {
    setSelectedType(type);
    updateStepValidation('typeSelection', true);
    
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEYS.STEP_ONE, JSON.stringify(type));
    
    // Clear dynamic step data when type changes to prevent schema mismatch
    localStorage.removeItem(STORAGE_KEYS.STEP_TWO);
  };

  // Set edit mode flag in localStorage on component mount if in edit mode
  useEffect(() => {
    if (isEditMode && carId) {
      localStorage.setItem(STORAGE_KEYS.EDIT_MODE_FLAG, carId.toString());
    }
    
    return () => {
      if (!window.location.pathname.includes('/edit')) {
        localStorage.removeItem(STORAGE_KEYS.EDIT_MODE_FLAG);
      }
    };
  }, [isEditMode, carId]);

  // Show a beautiful "Draft Restored" toast if we successfully recovered previous progress
  useEffect(() => {
    if (!isEditMode) {
      const hasDraft = localStorage.getItem(STORAGE_KEYS.STEP_ONE) || localStorage.getItem(STORAGE_KEYS.STEP_TWO);
      if (hasDraft) {
        const timer = setTimeout(() => {
          showStepNavigationToast(
            isArabic 
              ? "🔄 تم استعادة مسودتك المحفوظة تلقائياً!" 
              : "🔄 Your saved draft has been automatically restored!",
            "info"
          );
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isEditMode, isArabic]);

  // Function to handle direct step navigation
  const handleStepClick = (targetStep: string) => {
    const success = setCurrentStep(targetStep);
    
    if (!success) {
      const messages = getStepNavigationMessages(isArabic);
      showStepNavigationToast(messages.stepLocked, 'warning');
    }
  };

  const stepLabels = useMemo(() => {
    const labels: Record<string, string> = {
      typeSelection: isArabic ? "فئة الإعلان" : "Ad Category",
      carPhotos: isArabic ? "صور الإعلان" : "Photos",
      adsInfo: isArabic ? "معلومات الإعلان" : "Ad Information"
    };
    schema?.sections.forEach(s => {
      labels[`section_${s.id}`] = s.name;
    });
    return labels;
  }, [schema, isArabic]);

  // Stabilize validation updates to prevent infinite loops
  const handleUpdateStepValidation = useCallback((stepId: string, isValid: boolean) => {
    updateStepValidation(stepId, isValid);
  }, [updateStepValidation]);

  // Get error dialog text based on locale
  const errorDialogTexts = getErrorDialogTexts(isArabic);
  
  // Get the required fields message
  const requiredFieldsMessage = getRequiredFieldsMessage(direction);

  // Get progress information
  const progress = getStepProgress();

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          {/* Page title & Progress Ring Header Layout */}
          <div className={cn(
            "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8",
            isArabic && "sm:flex-row-reverse"
          )}>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                {isEditMode 
                  ? (isArabic ? `تعديل ${categoryName}` : `Edit ${categoryName} Listing`) 
                  : (isArabic ? `إضافة ${categoryName} جديد` : `Add New ${categoryName} Listing`)}
              </h1>
            </div>

            {/* Interactive Circular Step Progress Ring */}
            <div className={cn(
              "flex items-center gap-4 bg-white p-3 px-4 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md",
              isArabic && "flex-row-reverse"
            )}>
              <div className="relative flex items-center justify-center h-14 w-14">
                {/* SVG Progress Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="28"
                    cy="28"
                    r="23"
                    className="stroke-slate-100"
                    strokeWidth="4"
                    fill="transparent"
                  />
                  <circle
                    cx="28"
                    cy="28"
                    r="23"
                    className="stroke-emerald-500 transition-all duration-500 ease-out"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 23}`}
                    strokeDashoffset={`${2 * Math.PI * 23 * (1 - progress.progressPercentage / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-black text-slate-800">
                  {progress.progressPercentage}%
                </span>
              </div>
              <div className={isArabic ? "text-right" : "text-left"}>
                <p className="text-[10px] font-extrabold text-emerald-600 tracking-wider uppercase mb-0.5">
                  {isArabic ? "نسبة الإنجاز" : "Completion Status"}
                </p>
                <p className="text-sm font-bold text-slate-800">
                  {isArabic 
                    ? `الخطوة ${progress.currentStepIndex + 1} من ${progress.totalSteps}` 
                    : `Step ${progress.currentStepIndex + 1} of ${progress.totalSteps}`}
                </p>
            </div>
          </div>
        </div>
      </div>

        {/* Steps Navigation */}
        <div className="mb-6 sm:mb-8">
          <StepperContainer>
            {steps.map((step, index) => (
              <StepTrigger 
                key={step}
                totalSteps={steps.length} 
                step={step} 
                index={index} 
                currentStep={currentStep}
                label={stepLabels[step]}
                stepValidation={stepValidation}
                validationAttempted={validationAttempted}
                onStepClick={handleStepClick}
                isStepAccessible={(stepIndex) => isStepAccessible(stepIndex)}
              />
            ))}
          </StepperContainer>
        </div>

        {/* Main Content Area */}
        <Tabs value={currentStep} className="w-full">
          <div className="bg-white rounded-lg shadow-sm border min-h-[600px]">
            {/* Step Content */}
            <div className="p-4 sm:p-6 lg:p-8">
              {currentStep === 'typeSelection' && (
                <StepContent 
                  handleBack={handleBack} 
                  handleNext={handleNext} 
                  direction={direction} 
                  step="typeSelection"
                  isNextDisabled={!selectedType || isSubmitting}
                  requiredFieldsMessage={requiredFieldsMessage}
                >
                  <AddProductTypeSelection 
                    onSelect={handleTypeSelect}
                    selectedTypeId={selectedType?.id}
                  />
                </StepContent>
              )}
              
              {schema?.sections.map((section) => (
                currentStep === `section_${section.id}` && (
                  <StepContent 
                    key={section.id}
                    handleBack={handleBack} 
                    handleNext={handleNext} 
                    direction={direction} 
                    step={`section_${section.id}`}
                    isNextDisabled={validationAttempted[`section_${section.id}`] && !stepValidation[`section_${section.id}`] || isSubmitting}
                    requiredFieldsMessage={requiredFieldsMessage}
                  >
                  <DynamicFormStep 
                    section={section}
                    schema={schema}
                    onValidationChange={(isValid) => handleUpdateStepValidation(`section_${section.id}`, isValid)}
                    isEditMode={isEditMode}
                    initialData={initialData}
                  />
                  </StepContent>
                )
              ))}
              
              {currentStep === 'carPhotos' && (
                <StepContent 
                  handleBack={handleBack} 
                  handleNext={handleNext} 
                  direction={direction} 
                  step="carPhotos"
                  isNextDisabled={photos.length < minImages || isSubmitting}
                  requiredFieldsMessage={requiredFieldsMessage}
                >
                  <CarPhotosSection 
                    labels={{
                      coverImage: isArabic ? "صور الإعلان" : "Photos",
                      oneImage: isArabic ? `يمكنك إدخال ${minImages} صور` : `You can enter ${minImages} images`,
                      tenImages: "",
                      tenFiles: ""
                    }}
                    coverImageRef={coverImageRef}
                    coverImage={photos}
                    onCoverImageChange={(newPhotos) => {
                      setPhotos(newPhotos);
                      const isValid = newPhotos.length >= minImages;
                      setPhotoValidation(isValid);
                      updateStepValidation('carPhotos', isValid);
                    }}
                    setIsFormDisabled={() => {}}
                  />
                </StepContent>
              )}

              {currentStep === 'adsInfo' && (
                <StepContent 
                  handleBack={handleBack} 
                  handleNext={handleNext} 
                  direction={direction} 
                  step="adsInfo"
                  isNextDisabled={!stepFourIsValid || isSubmitting}
                  requiredFieldsMessage={requiredFieldsMessage}
                  isLastStep={true}
                >
                  <AddProductStepFour   
                    onValidationChange={(isValid) => {
                      setStepFourIsValid(isValid);
                      updateStepValidation('adsInfo', isValid);
                    }}
                    isEditMode={isEditMode}
                    initialData={initialData}
                  />    
                </StepContent>
              )}
            </div>

     
          </div>
        </Tabs>

        {/* Error Dialog */}
        <ErrorDialog
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          title={errorDialogTexts.title}
          description={errorDialogTexts.description}
          errorMessage={errorMessage}
          tryAgainText={errorDialogTexts.tryAgainText || "Try Again"}
          onTryAgain={handleTryAgain}
        />
      </div>
    </div>
  );
};

export default Steps;