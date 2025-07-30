// hooks.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  getCarMakes,
  getCarModels,
  getCarTrims,
} from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';
import { Filter, QueryParams } from '@/core/entities/api/api';
import { SelectedOptions } from './types';
import {
  getGovernorateOptions,
  getCityOptions,
  getYearOptions,
  validateForm,
} from './utils';
import { loadSelections, saveSelections } from './StorageUtils';

/**
 * Custom hook for managing the product step one form with infinite scroll support
 */
export const useProductStepOne = (
  onValidationChange: (isValid: boolean) => void,
) => {
  const t = useTranslations('addProduct');
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isArabic = direction === 'rtl';

  // Start with default empty state for server rendering
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(
    loadSelections(),
  );
  const [isClient, setIsClient] = useState(false);
  const [prevValidationState, setPrevValidationState] = useState(false);

  // Create refs to track user interactions vs. initial load
  const isInitialLoad = useRef(true);
  const userChangedMarka = useRef(false);
  const userChangedModel = useRef(false);
  const userChangedGovernorate = useRef(false);
  const editModeDataApplied = useRef(false);

  // Set isClient to true once the component has mounted
  useEffect(() => {
    setIsClient(true);
    window.scrollTo(0, 0);

    // Mark when the initial load is complete
    const timer = setTimeout(() => {
      isInitialLoad.current = false;
    }, 1000); // Give enough time for API calls to complete

    return () => clearTimeout(timer);
  }, []);

  // Save to localStorage whenever selections change, but only after client-side rendering is confirmed
  useEffect(() => {
    if (isClient) {
      saveSelections(selectedOptions);
    }
  }, [selectedOptions, isClient]);

  // Function to set initial data for edit mode
  const setInitialEditData = useCallback(
    (editData: SelectedOptions) => {
      // Only apply edit data once
      if (!editModeDataApplied.current) {
        setSelectedOptions(editData);
        editModeDataApplied.current = true;

        // Set validation based on provided data
        if (onValidationChange && validateForm(editData)) {
          onValidationChange(true);
          setPrevValidationState(true);
        }
      }
    },
    [onValidationChange],
  );

  // Extract IDs only when needed for infinite scroll dropdowns
  const makeId = selectedOptions.marka
    ? Number.parseInt(selectedOptions.marka)
    : undefined;
  const modelId = selectedOptions.model
    ? Number.parseInt(selectedOptions.model)
    : undefined;

  // Build filters for dependent dropdowns
  const makeFilter: Filter[] | undefined = makeId
    ? [{ field: 'makeId', operator: 'eq', value: makeId }]
    : undefined;
  const modelFilter: Filter[] | undefined = modelId
    ? [{ field: 'modelId', operator: 'eq', value: modelId }]
    : undefined;

  // Create fetch functions for infinite scroll dropdowns
  const fetchCarMakes = useCallback(
    async (params: QueryParams & { selectedCarMakes?: number[] }) => {
      return await getCarMakes(params);
    },
    [],
  );

  const fetchCarModels = useCallback(
    async (params: any) => {
      return await getCarModels({
        ...params,
        where: makeFilter,
      });
    },
    [makeFilter],
  );

  const fetchCarTrims = useCallback(
    async (params: any) => {
      return await getCarTrims({
        ...params,
        where: modelFilter,
      });
    },
    [modelFilter],
  );

  // Location options (these are static, so keep them as regular arrays)
  const governorateOptions = useMemo(
    () => getGovernorateOptions(isArabic),
    [isArabic],
  );
  const cityOptions = useMemo(
    () => getCityOptions(selectedOptions.governorate, isArabic),
    [selectedOptions.governorate, isArabic],
  );
  const madeYear = useMemo(() => getYearOptions(t), [t]);

  // Only reset dependent fields on user-initiated changes, not on initial load
  const handleSelectChange = useCallback((type: string, value: string) => {
    if (type === 'marka') {
      userChangedMarka.current = true;

      // Only reset dependent fields if this is a user change, not initial load
      if (!isInitialLoad.current) {
        setSelectedOptions((prev) => ({
          ...prev,
          [type]: value,
          model: '',
          trim: '',
        }));
      } else {
        setSelectedOptions((prev) => ({
          ...prev,
          [type]: value,
        }));
      }
    } else if (type === 'model') {
      userChangedModel.current = true;

      // Only reset trim if this is a user change, not initial load
      if (!isInitialLoad.current) {
        setSelectedOptions((prev) => ({
          ...prev,
          [type]: value,
          trim: '',
        }));
      } else {
        setSelectedOptions((prev) => ({
          ...prev,
          [type]: value,
        }));
      }
    } else if (type === 'governorate') {
      userChangedGovernorate.current = true;

      // Only reset city if this is a user change, not initial load
      if (!isInitialLoad.current) {
        setSelectedOptions((prev) => ({
          ...prev,
          [type]: value,
          city: '',
        }));
      } else {
        setSelectedOptions((prev) => ({
          ...prev,
          [type]: value,
        }));
      }
    } else {
      // For other fields, just update normally
      setSelectedOptions((prev) => ({
        ...prev,
        [type]: value,
      }));
    }
  }, []);

  // Handle address input change
  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSelectedOptions((prev) => ({ ...prev, address: e.target.value }));
    },
    [],
  );

  // Handle story text changes
  const handleStoryChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSelectedOptions((prev) => ({ ...prev, story: e.target.value }));
    },
    [],
  );

  // Validate and notify parent component
  useEffect(() => {
    const isValid = validateForm(selectedOptions);

    if (isValid !== prevValidationState && onValidationChange) {
      onValidationChange(isValid);
      setPrevValidationState(isValid);
    }
  }, [selectedOptions, onValidationChange, prevValidationState]);

  // Translated titles
  const titles = useMemo(
    () => ({
      trim: t('enteredData.stepOne.trims.title') || 'Trim',
      model: t('enteredData.stepOne.model.title'),
      brand: t('enteredData.stepOne.branda.title'),
      year: t('enteredData.stepOne.madeYear.title'),
      governorate: isArabic ? 'المحافظة' : 'Governorate',
      city: isArabic ? 'المدينة' : 'City',
      address: isArabic ? 'العنوان التفصيلي' : 'Detailed Address',
      addressPlaceholder: isArabic
        ? 'أدخل العنوان التفصيلي هنا'
        : 'Enter detailed address here',
      story: isArabic ? 'قصة السيارة' : 'Story of car',
      placeholder: isArabic ? 'اكتب رسالتك هنا' : 'Write your message here',
      error: isArabic
        ? 'حدث خطأ أثناء تحميل بعض البيانات. الرجاء المحاولة مرة أخرى لاحقًا.'
        : 'There was an error loading some data. Please try again later.',
    }),
    [t, isArabic],
  );

  // Return both infinite scroll configurations and traditional arrays for different use cases
  return {
    selectedOptions,
    direction,

    // Infinite scroll configurations for checkbox lists (brands)
    carMakesConfig: {
      queryKey: ['car-makes'],
      fetchFn: fetchCarMakes,
      labelField: 'name' as const,
      valueField: 'id' as const,
      logoField: 'logoUrl' as const,
    },

    // Infinite scroll configurations for dropdown selects (models/trims)
    carModelsConfig: {
      queryKey: ['car-models', selectedOptions.marka],
      fetchFn: fetchCarModels,
      labelField: 'name' as const,
      valueField: 'id' as const,
      additionalFilters: makeFilter || [],
    },
    carTrimsConfig: {
      queryKey: ['car-trims', selectedOptions.marka, selectedOptions.model],
      fetchFn: fetchCarTrims,
      labelField: 'name' as const,
      valueField: 'id' as const,
      additionalFilters: modelFilter || [],
    },

    // Static options (unchanged)
    governorateOptions,
    cityOptions,
    madeYear,

    // State and handlers
    titles,
    handleSelectChange,
    handleAddressChange,
    handleStoryChange,
    setInitialEditData,
  };
};
