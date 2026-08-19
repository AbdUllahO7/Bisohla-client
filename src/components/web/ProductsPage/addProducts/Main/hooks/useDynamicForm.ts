'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { getInjection } from '@/di/container';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { STORAGE_KEYS, getStorageKey } from './useLocalStorage';

export const useDynamicForm = (
  attributes: FormAttributeDto[],
  onValidationChange: (isValid: boolean) => void,
  initialData?: any
) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [referenceOptions, setReferenceOptions] = useState<Record<number, ListingTypeRefItemDto[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Record<number, boolean>>({});

  // Flag to know if it's the first render to avoid over-writing localStorage with defaults
  const isInitialized = useRef(false);

  // Initialize form data from initialData, localStorage, or defaults
  useEffect(() => {
    const isEditMode = !!localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
    const storageKey = getStorageKey('STEP_TWO', isEditMode);
    
    // Load from localStorage
    let savedData: Record<string, any> = {};
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        savedData = JSON.parse(raw);
      } catch (e) {
        console.error("Failed to parse STEP_TWO data", e);
      }
    }

    // Parse attributeValues from initialData if available (Generic Listing API)
    const apiAttributeMap: Record<string, any> = {};
    if (initialData?.attributeValues && Array.isArray(initialData.attributeValues)) {
      initialData.attributeValues.forEach((av: any) => {
        const slug = av.attribute?.slug;
        if (slug) {
          // Normalize value from different possible value fields
          let val = null;
          if (av.valueNumber !== null && av.valueNumber !== undefined) val = Number(av.valueNumber);
          else if (av.valueJson !== null && av.valueJson !== undefined) val = av.valueJson;
          else if (av.valueBoolean !== null && av.valueBoolean !== undefined) val = av.valueBoolean;
          else if (av.valueText !== null && av.valueText !== undefined) val = av.valueText;
          else if (av.valueDate !== null && av.valueDate !== undefined) val = av.valueDate;
          
          apiAttributeMap[slug] = val;
        }
      });
    }

    const initial: Record<string, any> = {};
    attributes.forEach(attr => {
      // Priority: localStorage (current session) > apiAttributeMap > details > top-level > defaults
      const savedValue = savedData[attr.slug];
      
      let editValue = savedValue;
      
      if (editValue === undefined || editValue === null || editValue === '') {
        // Fallback to API attribute map (flattened list)
        editValue = apiAttributeMap[attr.slug];
        
        if (editValue === undefined || editValue === null || editValue === '') {
          const slugLower = (attr.slug || '').toLowerCase();
          
          if (slugLower === 'make' || slugLower === 'marka' || slugLower === 'brand' || slugLower === 'car_make' || slugLower === 'carmake') {
            editValue =
              initialData?.makeId ||
              initialData?.carMakeId ||
              initialData?.make_id ||
              initialData?.make?.id ||
              initialData?.details?.makeId ||
              initialData?.details?.carMakeId ||
              initialData?.details?.make?.id ||
              apiAttributeMap['make'] ||
              apiAttributeMap['marka'] ||
              apiAttributeMap['brand'] ||
              apiAttributeMap['car_make'];
          } else if (slugLower === 'model' || slugLower === 'car_model' || slugLower === 'carmodel') {
            editValue =
              initialData?.modelId ||
              initialData?.carModelId ||
              initialData?.model_id ||
              initialData?.model?.id ||
              initialData?.details?.modelId ||
              initialData?.details?.carModelId ||
              initialData?.details?.model?.id ||
              apiAttributeMap['model'] ||
              apiAttributeMap['car_model'];
          } else if (slugLower === 'trim' || slugLower === 'car_trim' || slugLower === 'cartrim') {
            editValue =
              initialData?.trimId ||
              initialData?.carTrimId ||
              initialData?.trim_id ||
              initialData?.trim?.id ||
              initialData?.details?.trimId ||
              initialData?.details?.trim?.id ||
              apiAttributeMap['trim'] ||
              apiAttributeMap['car_trim'];
          } else if (slugLower === 'governorate' || slugLower === 'محافظة') {
            editValue = initialData?.governorate || apiAttributeMap['governorate'];
          } else if (slugLower === 'city' || slugLower === 'مدينة') {
            editValue = initialData?.city || apiAttributeMap['city'];
          } else {
            editValue = initialData?.details?.[attr.slug] ?? initialData?.[attr.slug];
            if (editValue === undefined || editValue === null) {
              editValue = initialData?.[`${attr.slug}Id`] ?? initialData?.details?.[`${attr.slug}Id`];
            }
          }
        }
      }

      // Extract ID from object if necessary
      if (editValue && typeof editValue === 'object' && !Array.isArray(editValue) && editValue.id !== undefined) {
        editValue = editValue.id;
      }
      
      if (editValue !== undefined && editValue !== null && editValue !== '') {
        initial[attr.slug] = (attr.type === 'reference' || attr.type === 'select')
          ? String(editValue)
          : editValue;
      } else {
        initial[attr.slug] = (attr.type === 'repeating_group' || attr.type === 'color_multi_selection') ? [] : '';
      }
    });

    setFormData(initial);
    isInitialized.current = true;
  }, [attributes, initialData]);

  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized.current) return;
    const isEditMode = !!localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
    const storageKey = getStorageKey('STEP_TWO', isEditMode);

    // Get current data from localStorage to merge
    let currentStoredData: Record<string, any> = {};
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) currentStoredData = JSON.parse(raw);
    } catch (e) {
      console.error("Failed to read STEP_TWO for merging", e);
    }

    // Capture the current attributes' meta for useSubmitForm
    const currentAttrMap = { ...(currentStoredData.__attributeMap__ || {}) };
    attributes.forEach(attr => {
      if (attr.id > 0) { // Only map real attributes, not virtual ones like injected location
        currentAttrMap[attr.slug] = {
          id: attr.id,
          type: attr.type,
          isRequired: attr.isRequired || (attr as any).required
        };
      }
    });

    // Merge only the fields owned by this section into the global STEP_TWO
    const updatedData = {
      ...currentStoredData,
      ...formData,
      __attributeMap__: currentAttrMap
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedData));
  }, [formData, attributes]);

  // Function to fetch reference options
  const fetchOptions = useCallback(async (attr: FormAttributeDto, parentItemId?: number) => {
    if (!attr.referenceGroupId) return;

    setLoadingOptions(prev => ({ ...prev, [attr.id]: true }));
    try {
      const controller = getInjection('IListingTypeRefsRepoController');
      const response = await controller.getItemsByGroupId(attr.referenceGroupId, parentItemId, 1000);
      if (response.success && response.data) {
        const options = response.data.data;
        setReferenceOptions(prev => ({ ...prev, [attr.id]: options }));
      }
    } catch (error) {
      console.error(`Failed to fetch options for attribute ${attr.id}`, error);
    } finally {
      setLoadingOptions(prev => ({ ...prev, [attr.id]: false }));
    }
  }, []);

  // Effect to fetch initial independent reference options
  useEffect(() => {
    attributes.forEach(attr => {
      if (attr.referenceGroupId && !attr.dependsOnAttributeId) {
        fetchOptions(attr);
      }
    });
  }, [attributes, fetchOptions]);

  // Effect to handle dependent reference options
  useEffect(() => {
    attributes.forEach(attr => {
      if (attr.referenceGroupId && attr.dependsOnAttributeId) {
        // Find parent attribute by ID to get its slug
        const parentAttr = attributes.find(a => a.id === attr.dependsOnAttributeId);
        const parentValue = parentAttr ? formData[parentAttr.slug] : undefined;
        if (parentValue) {
          fetchOptions(attr, Number(parentValue));
        } else {
          setReferenceOptions(prev => ({ ...prev, [attr.id]: [] }));
        }
      }
    });
  }, [formData, attributes, fetchOptions]);

  // Helper to evaluate valueDependency for an attribute
  const evaluateValueDependency = useCallback((attr: FormAttributeDto, currentData: Record<string, any>): boolean => {
    const valDep = (attr as any).valueDependency;
    if (!valDep) return true;
    const { op, value, refAttributeSlug } = valDep;
    if (!refAttributeSlug) return true;

    const parentValue = currentData[refAttributeSlug];
    if (parentValue === undefined || parentValue === null || parentValue === '') return true;

    let conditionMet = false;
    const pValStr = String(parentValue).toLowerCase();
    const valStr = String(value).toLowerCase();

    if (op === 'eq' || op === '=') {
      conditionMet = pValStr === valStr;
    } else if (op === 'neq' || op === '!=') {
      conditionMet = pValStr !== valStr;
    } else if (op === 'gt') {
      conditionMet = Number(parentValue) > Number(value);
    } else if (op === 'lt') {
      conditionMet = Number(parentValue) < Number(value);
    } else if (op === 'in') {
      const list = Array.isArray(value) ? value : [value];
      conditionMet = list.map(v => String(v).toLowerCase()).includes(pValStr);
    } else if (op === 'nin') {
      const list = Array.isArray(value) ? value : [value];
      conditionMet = !list.map(v => String(v).toLowerCase()).includes(pValStr);
    } else {
      conditionMet = pValStr === valStr;
    }

    return !conditionMet;
  }, []);

  const handleFieldChange = useCallback((slug: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev, [slug]: value };
      
      // Reset dependent fields by finding their id via the attribute list
      attributes.forEach(attr => {
        if (attr.dependsOnAttributeId) {
          const parentAttr = attributes.find(a => a.id === attr.dependsOnAttributeId);
          if (parentAttr && parentAttr.slug === slug) {
            newData[attr.slug] = '';
          }
        }
      });

      // Clear values of fields whose valueDependency is met (they become hidden)
      attributes.forEach(attr => {
        const isShown = evaluateValueDependency(attr, newData);
        if (!isShown) {
          newData[attr.slug] = attr.type === 'repeating_group' ? [] : '';
        }
      });
      
      return newData;
    });
  }, [attributes, evaluateValueDependency]);

  // Use refs to avoid infinite loops with unstable parent callbacks
  const onValidationChangeRef = useRef(onValidationChange);
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  const lastValidRef = useRef<boolean | null>(null);

  useEffect(() => {
    const isValid = attributes.every(attr => {
      // If the field is hidden by valueDependency, it should NOT be required for validation!
      const isShown = evaluateValueDependency(attr, formData);
      if (!isShown) return true;

      if (attr.isRequired || (attr as any).required) {
        const val = formData[attr.slug];
        if (Array.isArray(val)) {
          return val.length > 0;
        }
        return val !== undefined && val !== null && val !== '';
      }
      return true;
    });

    if (isValid !== lastValidRef.current) {
      lastValidRef.current = isValid;
      onValidationChangeRef.current(isValid);
    }
  }, [formData, attributes, evaluateValueDependency]); // Removed onValidationChange from dependencies

  return {
    formData,
    referenceOptions,
    loadingOptions,
    handleFieldChange,
  };
};
