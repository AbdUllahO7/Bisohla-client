'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { getInjection } from '@/di/container';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { STORAGE_KEYS } from './useLocalStorage';

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
    const initial: Record<string, any> = {};
    
    // Load from localStorage if not in edit mode
    let savedData: Record<string, any> = {};
    if (!isEditMode) {
      const raw = localStorage.getItem(STORAGE_KEYS.STEP_TWO);
      if (raw) {
        try {
          savedData = JSON.parse(raw);
        } catch (e) {
          console.error("Failed to parse STEP_TWO data", e);
        }
      }
    }

    attributes.forEach(attr => {
      // Priority: initialData (edit mode) > localStorage > defaults
      const editValue = initialData?.details?.[attr.slug] || initialData?.[attr.slug];
      const savedValue = savedData[attr.slug];
      
      if (editValue !== undefined && editValue !== null) {
        initial[attr.slug] = editValue;
      } else if (!isEditMode && savedValue !== undefined && savedValue !== null) {
        initial[attr.slug] = savedValue;
      } else {
        initial[attr.slug] = attr.type === 'repeating_group' ? [] : '';
      }
    });

    setFormData(initial);
    isInitialized.current = true;
  }, [attributes, initialData]);

  // Save to localStorage on change
  useEffect(() => {
    if (!isInitialized.current) return;
    const isEditMode = !!localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
    if (isEditMode) return;
    
    if (Object.keys(formData).length > 0) {
      const existingRaw = localStorage.getItem(STORAGE_KEYS.STEP_TWO);
      let existingData: Record<string, any> = {};
      try {
        existingData = existingRaw ? JSON.parse(existingRaw) : {};
      } catch (e) {}

      // Build the attribute metadata map: slug → { id, type }
      // This is used by useSubmitForm to resolve attributeId for the new API
      const attributeMap: Record<string, { id: number; type: string }> = {
        ...(existingData.__attributeMap__ || {}),
      };
      attributes.forEach(attr => {
        if (attr.id && attr.id > 0) { // Skip injected virtual attrs (negative IDs)
          attributeMap[attr.slug] = { id: attr.id, type: attr.type || 'text' };
        }
      });

      const newData = { ...existingData, ...formData, __attributeMap__: attributeMap };
      localStorage.setItem(STORAGE_KEYS.STEP_TWO, JSON.stringify(newData));
    }
  }, [formData, attributes]);

  // Function to fetch reference options
  const fetchOptions = useCallback(async (attr: FormAttributeDto, parentItemId?: number) => {
    if (!attr.referenceGroupId) return;

    setLoadingOptions(prev => ({ ...prev, [attr.id]: true }));
    try {
      const controller = getInjection('IListingTypeRefsRepoController');
      const response = await controller.getItemsByGroupId(attr.referenceGroupId, parentItemId, 1000);
      if (response.success) {
        setReferenceOptions(prev => ({ ...prev, [attr.id]: response.data.data }));
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
      
      return newData;
    });
  }, [attributes]);

  // Use refs to avoid infinite loops with unstable parent callbacks
  const onValidationChangeRef = useRef(onValidationChange);
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  const lastValidRef = useRef<boolean | null>(null);

  useEffect(() => {
    const isValid = attributes.every(attr => {
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
  }, [formData, attributes]); // Removed onValidationChange from dependencies

  return {
    formData,
    referenceOptions,
    loadingOptions,
    handleFieldChange,
  };
};
