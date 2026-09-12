'use client';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Tabs } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { useSettings } from '@/providers/settings.provider';
import { cn } from '@/lib/utils';
import type { ListingTypeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { ImageUploaderRef } from '@/components/image-uploader/image-uploader';
import { StepContent } from './Components/StepContent';
import AddProductStepFour from '../StepFour/AddProductStepFour';
import ErrorDialog from './Components/ErrorDialog';
import { StepTrigger, StepperContainer } from './Components/StepTrigger';
import AddProductTypeSelection from '../TypeSelection/AddProductTypeSelection';
import DynamicFormStep from './Components/DynamicFormStep';
import CarPhotosSection from '../StepThree/CarPhotosSection';
import { useStepManagement } from './hooks/useStepManagement';
import { useListingWizardSubmit } from './hooks/useListingWizardSubmit';
import { showStepNavigationToast } from './utils/stepNavigationUtils';
import { ListingWizardProvider, useListingWizard } from './context/listing-wizard.context';
import { pickListingTypePolicy, type HydratePayload } from './context/listing-wizard.types';

const STEP_TYPE = 'typeSelection';
const STEP_PHOTOS = 'photos';
const STEP_ADS_INFO = 'adsInfo';
const sectionStepId = (sectionId: number) => `section_${sectionId}`;

interface StepsProps {
  isEditMode?: boolean;
  listingId?: number | null;
  /** Edit mode: the fully resolved wizard state (attributes, snapshots, common fields, images). */
  initialHydration?: HydratePayload | null;
}

const Steps: React.FC<StepsProps> = ({ isEditMode = false, listingId = null, initialHydration = null }) => (
  <ListingWizardProvider mode={isEditMode ? 'edit' : 'create'} listingId={listingId} initialHydration={initialHydration}>
    <StepsInner isEditMode={isEditMode} />
  </ListingWizardProvider>
);

const StepsInner: React.FC<{ isEditMode: boolean }> = ({ isEditMode }) => {
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isArabic = direction === 'rtl';
  const t = useTranslations('addProduct');
  const tWizard = useTranslations('addProduct.wizard');

  const { getListingsSettings } = useSettings();
  const minImages = getListingsSettings()?.images?.min_images_per_listing ?? 5;

  const { state, dispatch, schema, isSchemaLoading, isSchemaError, refetchSchema, draftRestored, draftStep, setCurrentStepForDraft } =
    useListingWizard();
  const coverImageRef = useRef<ImageUploaderRef | null>(null);

  const dynamicSteps = useMemo(() => {
    const baseSteps = isEditMode ? [] : [STEP_TYPE];
    if (schema) return [...baseSteps, ...schema.sections.filter((s) => s.isActive !== false).map((s) => sectionStepId(s.id)), STEP_PHOTOS, STEP_ADS_INFO];
    return baseSteps;
  }, [schema, isEditMode]);

  const onStepValidityFailed = useCallback((message: string) => showStepNavigationToast(message, 'warning'), []);
  const { submit, isSubmitting, phase, showErrorDialog, setShowErrorDialog, errorMessage, handleTryAgain } = useListingWizardSubmit({
    onStepValidityFailed,
  });

  const {
    steps,
    currentStep,
    setCurrentStep,
    stepValidation,
    validationAttempted,
    handleNext,
    handleBack,
    updateStepValidation,
    isStepAccessible,
    getStepProgress,
  } = useStepManagement(isEditMode, dynamicSteps, submit);

  useEffect(() => setCurrentStepForDraft(currentStep), [currentStep, setCurrentStepForDraft]);

  // Step validity that the shell owns (type / photos); sections and ads-info report their own.
  useEffect(() => {
    updateStepValidation(STEP_TYPE, state.listingType != null);
  }, [state.listingType, updateStepValidation]);
  useEffect(() => {
    updateStepValidation(STEP_PHOTOS, state.images.length >= minImages && !state.isUploadingImages);
  }, [state.images.length, state.isUploadingImages, minImages, updateStepValidation]);

  // Draft restored: say so once and reopen the step it was on.
  const draftJumpDone = useRef(false);
  useEffect(() => {
    if (!draftRestored || isEditMode || draftJumpDone.current) return;
    if (draftStep && !steps.includes(draftStep)) return;
    draftJumpDone.current = true;
    const timer = setTimeout(() => showStepNavigationToast(tWizard('draft_restored'), 'info'), 1200);
    if (draftStep) setCurrentStep(draftStep);
    return () => clearTimeout(timer);
  }, [draftRestored, draftStep, isEditMode, steps, setCurrentStep, tWizard]);

  // Leaving with unsaved edits: the browser's own confirm (reload / close / external link).
  useEffect(() => {
    if (!state.isDirty) return;
    const guard = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', guard);
    return () => window.removeEventListener('beforeunload', guard);
  }, [state.isDirty]);

  const handleTypeSelect = (type: ListingTypeDto) => dispatch({ type: 'setListingType', listingType: pickListingTypePolicy(type) });

  const handleStepClick = (targetStep: string) => {
    if (!setCurrentStep(targetStep)) showStepNavigationToast(tWizard('step_locked'), 'warning');
  };

  const stepLabels = useMemo(() => {
    const labels: Record<string, string> = {
      [STEP_TYPE]: t('steps.carType'),
      [STEP_PHOTOS]: t('steps.carImages'),
      [STEP_ADS_INFO]: t('steps.adsDetails'),
    };
    schema?.sections.forEach((s) => {
      labels[sectionStepId(s.id)] = s.name;
    });
    return labels;
  }, [schema, t]);

  const categoryName = state.listingType?.name || tWizard('listing_fallback');
  const requiredFieldsMessage = tWizard('required_fields');
  const progress = getStepProgress();

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 sm:mb-8">
          <div className={cn('flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8', isArabic && 'sm:flex-row-reverse')}>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {isEditMode ? tWizard('title_edit', { category: categoryName }) : tWizard('title_create', { category: categoryName })}
              </h1>
            </div>

            <div
              className={cn(
                'flex items-center gap-4 bg-white dark:bg-zinc-900 p-3 px-4 rounded-2xl border border-slate-100 dark:border-zinc-800 shadow-sm transition-all duration-300 hover:shadow-md',
                isArabic && 'sm:flex-row-reverse',
              )}
            >
              <div className="relative flex items-center justify-center h-14 w-14">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="28" cy="28" r="23" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="4" fill="transparent" />
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
                <span className="absolute text-xs font-black text-slate-800 dark:text-zinc-200">{progress.progressPercentage}%</span>
              </div>
              <div className={isArabic ? 'text-right' : 'text-left'}>
                <p className="text-[10px] font-extrabold text-emerald-600 tracking-wider uppercase mb-0.5">{tWizard('completion_status')}</p>
                <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">
                  {tWizard('step_of', { current: progress.currentStepIndex + 1, total: progress.totalSteps })}
                </p>
              </div>
            </div>
          </div>
        </div>

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

        <Tabs value={currentStep} className="w-full">
          <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-sm border dark:border-zinc-800 min-h-[600px]">
            <div className="p-4 sm:p-6 lg:p-8">
              {currentStep === STEP_TYPE && (
                <StepContent
                  handleBack={handleBack}
                  handleNext={handleNext}
                  direction={direction}
                  step={STEP_TYPE}
                  isNextDisabled={!state.listingType || isSubmitting || isSchemaLoading || dynamicSteps.length <= 1}
                  requiredFieldsMessage={requiredFieldsMessage}
                >
                  <AddProductTypeSelection onSelect={handleTypeSelect} selectedTypeId={state.listingType?.id} />
                  {isSchemaError && (
                    <Alert variant="destructive" className="mt-6">
                      <AlertDescription className="flex items-center justify-between gap-3">
                        <span>{tWizard('schema_error')}</span>
                        <button type="button" className="underline font-semibold" onClick={refetchSchema}>
                          {tWizard('retry')}
                        </button>
                      </AlertDescription>
                    </Alert>
                  )}
                </StepContent>
              )}

              {schema?.sections.map(
                (section) =>
                  currentStep === sectionStepId(section.id) && (
                    <StepContent
                      key={section.id}
                      handleBack={handleBack}
                      handleNext={handleNext}
                      direction={direction}
                      step={sectionStepId(section.id)}
                      isNextDisabled={(validationAttempted[sectionStepId(section.id)] && !stepValidation[sectionStepId(section.id)]) || isSubmitting}
                      requiredFieldsMessage={requiredFieldsMessage}
                    >
                      <DynamicFormStep
                        section={section}
                        onValidationChange={(isValid) => updateStepValidation(sectionStepId(section.id), isValid)}
                        showErrors={Boolean(validationAttempted[sectionStepId(section.id)])}
                      />
                    </StepContent>
                  ),
              )}

              {currentStep === STEP_PHOTOS && (
                <StepContent
                  handleBack={handleBack}
                  handleNext={handleNext}
                  direction={direction}
                  step={STEP_PHOTOS}
                  isNextDisabled={state.images.length < minImages || state.isUploadingImages || isSubmitting}
                  requiredFieldsMessage={requiredFieldsMessage}
                >
                  <CarPhotosSection
                    labels={{
                      coverImage: t('steps.carImages'),
                      oneImage: tWizard('images_hint', { count: minImages }),
                      tenImages: '',
                      tenFiles: '',
                    }}
                    coverImageRef={coverImageRef}
                    coverImage={state.images}
                    onCoverImageChange={(images) => dispatch({ type: 'setImages', images })}
                    setIsFormDisabled={(disabled) => dispatch({ type: 'setUploadingImages', uploading: disabled })}
                  />
                </StepContent>
              )}

              {currentStep === STEP_ADS_INFO && (
                <StepContent
                  handleBack={handleBack}
                  handleNext={handleNext}
                  direction={direction}
                  step={STEP_ADS_INFO}
                  isNextDisabled={!stepValidation[STEP_ADS_INFO] || isSubmitting}
                  requiredFieldsMessage={requiredFieldsMessage}
                  isLastStep={true}
                  nextButtonText={phase === 'confirming' ? tWizard('confirming') : undefined}
                >
                  <AddProductStepFour onValidationChange={(isValid) => updateStepValidation(STEP_ADS_INFO, isValid)} isEditMode={isEditMode} />
                  <Alert className="mt-6 border-emerald-200 dark:border-emerald-900 bg-emerald-50/60 dark:bg-emerald-950/20">
                    <Info className="h-4 w-4 text-emerald-600" />
                    <AlertDescription className="text-emerald-800 dark:text-emerald-300">{tWizard('moderation_notice')}</AlertDescription>
                  </Alert>
                </StepContent>
              )}
            </div>
          </div>
        </Tabs>

        <ErrorDialog
          open={showErrorDialog}
          onOpenChange={setShowErrorDialog}
          title={tWizard('error_title')}
          description={tWizard('error_description')}
          errorMessage={errorMessage}
          tryAgainText={tWizard('try_again')}
          onTryAgain={handleTryAgain}
        />
      </div>
    </div>
  );
};

export default Steps;
