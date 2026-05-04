// hooksv2.ts
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getInjection } from '@/di/container';
import { SchemaAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { Filter, QueryParams } from '@/core/entities/api/api';
import { SelectedOptions } from './types';
import {
  getGovernorateOptions,
  getCityOptions,
  getYearOptions,
  validateForm,
} from './utils';
import { loadSelections, saveSelections } from './StorageUtils';
import { STORAGE_KEYS } from '../main/hooks/useLocalStorage';

// Translation helper for ref items
const translateName = (item: ListingTypeRefItemDto, locale: string) => {
  if (!item.name) return "";
  if (typeof item.name === 'string') return item.name;
  return item.name[locale] || item.name['en'] || item.name['ar'] || "";
};

/**
 * Custom hook for managing the product step one form with infinite scroll support
 */
export const useProductStepOne = (
  onValidationChange: (isValid: boolean) => void,
  externalListingTypeId?: number | string
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

  // Dynamic schema state
  const [groupIds, setGroupIds] = useState({ make: 0, model: 0, trim: 0 });
  const [isTrimInSchema, setIsTrimInSchema] = useState(false);

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

  // 1. Get Listing Type ID from external prop, else localStorage, else default to 1 (Cars)
  const listingTypeId = useMemo(() => {
    if (externalListingTypeId) return Number(externalListingTypeId);
    if (typeof window === 'undefined') return 1;
    const stored = localStorage.getItem(STORAGE_KEYS.STEP_ONE);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return parsed.id || 1;
      } catch (e) {
        return 1;
      }
    }
    return 1;
  }, [externalListingTypeId]);

  // 2. Fetch Schema to get Reference Group IDs
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const controller = getInjection('IListingTypesRepoController');
        const res = await controller.getActiveSchema(listingTypeId);
        if (res.success && res.data) {
          const attrs: Record<string, SchemaAttributeDto> = res.data.attributes;
          const newGroupIds = { make: 0, model: 0, trim: 0 };
          let trimFound = false;

          for (const [slug, attr] of Object.entries(attrs)) {
            const lowSlug = slug.toLowerCase();
            if (lowSlug === 'make' || lowSlug === 'branda') {
              newGroupIds.make = attr.referenceGroupId || 0;
            } else if (lowSlug === 'model') {
              newGroupIds.model = attr.referenceGroupId || 0;
            } else if (lowSlug === 'trim') {
              newGroupIds.trim = attr.referenceGroupId || 0;
              trimFound = true;
            }
          }
          setGroupIds(newGroupIds);
          setIsTrimInSchema(trimFound);
        }
      } catch (err) {
        console.error("Failed to fetch schema in hooksv2", err);
      }
    };
    fetchSchema();
  }, [listingTypeId]);

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
    async (params: QueryParams) => {
      if (!groupIds.make) return { success: true, data: { data: [], total: 0, page: 1, pageSize: params.pageSize || 10 } };
      const controller = getInjection('IListingTypeRefsRepoController');
      const res = await controller.getItemsByGroupId(
        groupIds.make,
        undefined,
        params.pageSize,
        params.searchTerm as string,
        params.page,
        locale,
        params.searchKey,
      );
      if (res.success && res.data) {
        // Map names for the UI
        res.data.data = res.data.data.map(item => ({
          ...item,
          name: translateName(item, locale)
        } as any));
      }
      return res;
    },
    [groupIds.make, locale],
  );

  const fetchCarModels = useCallback(
    async (params: any) => {
      // NestedCarFilter passes brandId via params.where[0].value
      // Fall back to hook's internal makeId if where is not provided
      const resolvedMakeId =
        params?.where?.find((f: any) => f.field === 'makeId')?.value ??
        makeId;

      if (!groupIds.model || !resolvedMakeId)
        return { success: true, data: { data: [], total: 0, page: 1, pageSize: params.pageSize || 10 } };

      const controller = getInjection('IListingTypeRefsRepoController');
      const res = await controller.getItemsByGroupId(
        groupIds.model,
        Number(resolvedMakeId),
        params.pageSize,
        params.searchTerm as string,
        params.page,
        locale,
        params.searchKey,
      );
      if (res.success && res.data) {
        res.data.data = res.data.data.map((item) => ({
          ...item,
          name: translateName(item, locale),
          // NestedCarFilter reads 'makeId' off each item — attach it
          makeId: resolvedMakeId,
        } as any));
      }
      return res;
    },
    [groupIds.model, makeId, locale],
  );

  const fetchCarTrims = useCallback(
    async (params: any) => {
      // NestedCarFilter passes modelId via params.where[0].value
      const resolvedModelId =
        params?.where?.find((f: any) => f.field === 'modelId')?.value ??
        modelId;

      if (!groupIds.trim || !resolvedModelId)
        return { success: true, data: { data: [], total: 0, page: 1, pageSize: params.pageSize || 10 } };

      const controller = getInjection('IListingTypeRefsRepoController');
      const res = await controller.getItemsByGroupId(
        groupIds.trim,
        Number(resolvedModelId),
        params.pageSize,
        params.searchTerm as string,
        params.page,
        locale,
        params.searchKey,
      );
      if (res.success && res.data) {
        res.data.data = res.data.data.map((item) => ({
          ...item,
          name: translateName(item, locale),
          modelId: resolvedModelId,
        } as any));
      }
      return res;
    },
    [groupIds.trim, modelId, locale],
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
    const isValid = validateForm(selectedOptions, isTrimInSchema);

    if (isValid !== prevValidationState && onValidationChange) {
      onValidationChange(isValid);
      setPrevValidationState(isValid);
    }
  }, [selectedOptions, onValidationChange, prevValidationState, isTrimInSchema]);

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
      story: isArabic ? 'وصف المنتج' : 'Product description',
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
      queryKey: ['ref-group-makes', groupIds.make],
      fetchFn: fetchCarMakes,
      labelField: 'name' as const,
      valueField: 'id' as const,
      logoField: 'logoUrl' as const,
    },

    // Infinite scroll configurations for dropdown selects (models/trims)
    carModelsConfig: {
      queryKey: ['ref-group-models', groupIds.model, selectedOptions.marka],
      fetchFn: fetchCarModels,
      labelField: 'name' as const,
      valueField: 'id' as const,
      additionalFilters: makeFilter || [],
    },
    carTrimsConfig: {
      queryKey: ['ref-group-trims', groupIds.trim, selectedOptions.model],
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
    isTrimRequired: isTrimInSchema,
  };
};

