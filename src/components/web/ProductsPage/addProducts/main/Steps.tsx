'use client'
import React, { useState, useEffect } from 'react';
import { Tabs } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';

// Import components
import { getRequiredFieldsMessage, getErrorDialogTexts } from './utils';
import { showStepNavigationToast, getStepNavigationMessages } from './utils/stepNavigationUtils';
import { StepContent } from './Components/StepContent';
import AddProductStepFour from '../stepFour/AddProductStepFowr';
import ErrorDialog from './Components/ErrorDialog';
import { StepTrigger, StepperContainer } from './Components/StepTrigger';
import { useStepManagement } from './hooks/useStepManagement';
import { STORAGE_KEYS, getStorageKey } from './hooks/useLocalStorage';
import AddProductTypeSelection from '../TypeSelection/AddProductTypeSelection';
import DynamicFormStep from './Components/DynamicFormStep';
import CarPhotosSection from '../stepThree/CarPhotosSection';
import { getInjection } from '@/di/container';
import { ListingTypeDto, ListingTypeFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { useMemo, useCallback } from 'react';

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
  
  // Add state for step four validation
  const [stepFourIsValid, setStepFourIsValid] = useState(false);

  // Dynamic Step States
  const [selectedType, setSelectedType] = useState<ListingTypeDto | null>(null);
  const [schema, setSchema] = useState<ListingTypeFormSchemaDto | null>(null);
  const [loadingSchema, setLoadingSchema] = useState(false);
  
  // Photo State
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoValidation, setPhotoValidation] = useState(false);

  // Fetch schema when type is selected
  useEffect(() => {
    if (selectedType) {
      const fetchSchema = async () => {
        setLoadingSchema(true);
        try {
          const controller = getInjection('IListingTypesRepoController');
          const res = await controller.getFormSchema(selectedType.id);
          if (res.success) {
            setSchema(res.data);
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
      updateStepValidation('carPhotos', imageUrls.length > 0);
    } else {
      const storageKey = getStorageKey('STEP_THREE', isEditMode);
      const savedPhotos = localStorage.getItem(storageKey); // Photos were step 3 in old design
      if (savedPhotos) {
        try {
          const parsed = JSON.parse(savedPhotos);
          if (Array.isArray(parsed.coverImage)) {
            setPhotos(parsed.coverImage);
            updateStepValidation('carPhotos', parsed.coverImage.length > 0);
          }
        } catch (e) {
          console.error("Failed to parse saved photos", e);
        }
      }
    }
  }, [isEditMode, initialData, updateStepValidation]);

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
      carPhotos: isArabic ? "صور السيارة" : "Car Photos",
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
          {/* Page title */}
          <div className="flex items-center gap-3 mb-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
              {isEditMode 
                ? (isArabic ? 'تعديل السيارة' : 'Edit Car Listing') 
                : (isArabic ? 'إضافة سيارة جديدة' : 'Add New Car Listing')}
            </h1>
          </div>
          
          {/* Progress indicator - Mobile */}
          <div className="block sm:hidden bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">
                {isArabic 
                  ? `الخطوة ${progress.currentStepIndex + 1} من ${progress.totalSteps}` 
                  : `Step ${progress.currentStepIndex + 1} of ${progress.totalSteps}`}
              </span>
              <span className="text-sm font-bold text-emerald-600">
                {progress.progressPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Progress indicator - Desktop */}
          <div className="hidden sm:flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              {isArabic 
                ? `الخطوة ${progress.currentStepIndex + 1} من ${progress.totalSteps}` 
                : `Step ${progress.currentStepIndex + 1} of ${progress.totalSteps}`}
            </span>
            <div className="flex-1 max-w-md bg-gray-200 rounded-full h-2">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.progressPercentage}%` }}
              />
            </div>
            <span className="text-sm font-bold text-emerald-600">
              {progress.progressPercentage}%
            </span>
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
                  isNextDisabled={photos.length === 0 || isSubmitting}
                  requiredFieldsMessage={requiredFieldsMessage}
                >
                  <CarPhotosSection 
                    labels={{
                      coverImage: isArabic ? "صور السيارة" : "Car Photos",
                      oneImage: isArabic ? "يمكنك إدخال 20 صور" : "You can enter 20 images"
                    }}
                    coverImage={photos}
                    onCoverImageChange={(newPhotos) => {
                      setPhotos(newPhotos);
                      const isValid = newPhotos.length > 0;
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