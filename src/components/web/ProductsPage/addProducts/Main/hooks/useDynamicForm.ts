'use client'
import { useState, useEffect, useCallback, useRef } from 'react';
import { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { getInjection } from '@/di/container';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { STORAGE_KEYS, getStorageKey } from './useLocalStorage';
import { ProposeReferenceResult } from '@/core/entities/models/listings/reference-proposal.dto';
import { searchFuzzyReferenceItems } from '@/core/infrastructure-adapters/actions/visitors/reference-proposal.actions';
import { normalizeGovernorate, normalizeCity, normalizeAddress } from '@/core/entities/enums/syria.enums';
import { resolveCityValue } from '@/utils/geocodeToSyria';
import { extractIsTrimRequired, isTrimAttribute, isMakeAttribute, isModelAttribute } from '@/utils/trim-helpers';

export const useDynamicForm = (
  attributes: FormAttributeDto[],
  onValidationChange: (isValid: boolean) => void,
  initialData?: any
) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [proposals, setProposals] = useState<Record<number, { name: string }>>({});
  const [referenceOptions, setReferenceOptions] = useState<Record<number, ListingTypeRefItemDto[]>>({});
  const [loadingOptions, setLoadingOptions] = useState<Record<number, boolean>>({});
  const [refItemsMap, setRefItemsMap] = useState<Record<string, ListingTypeRefItemDto>>({});

  const registerRefItems = useCallback((items: ListingTypeRefItemDto[]) => {
    if (!items || !items.length) return;
    setRefItemsMap(prev => {
      let changed = false;
      const next = { ...prev };
      items.forEach(item => {
        if (item && item.id) {
          const idStr = String(item.id);
          if (!next[idStr] || JSON.stringify(next[idStr].metadata) !== JSON.stringify(item.metadata)) {
            next[idStr] = item;
            changed = true;
          }
        }
      });
      return changed ? next : prev;
    });
  }, []);

  // Flag to know if it's the first render to avoid over-writing localStorage with defaults
  const isInitialized = useRef(false);

  // Initialize form data & proposals from initialData, localStorage, or defaults
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

    const savedProposals: Record<number, { name: string }> = savedData.__proposals__ || {};
    const savedRefItems: Record<string, ListingTypeRefItemDto> = savedData.__refItems__ || {};
    if (savedRefItems && Object.keys(savedRefItems).length > 0) {
      registerRefItems(Object.values(savedRefItems));
    }

    // Parse attributeValues from initialData if available (Generic Listing API)
    const apiAttributeMap: Record<string, any> = {};
    const apiAttributeMapById: Record<number, any> = {};
    const initialProposals: Record<number, { name: string }> = { ...savedProposals };
    const initialRefOptions: Record<number, ListingTypeRefItemDto[]> = {};

    if (initialData?.attributeValues && Array.isArray(initialData.attributeValues)) {
      const initialItems: ListingTypeRefItemDto[] = [];
      initialData.attributeValues.forEach((av: any) => {
        const slug = av.attribute?.slug || av.slug;
        const attrId = av.attributeId || av.attribute?.id || av.id;

        if (av.referenceItem && attrId) {
          initialRefOptions[attrId] = [av.referenceItem];
          initialItems.push(av.referenceItem);
        }

        // Checked FIRST per §7.9: pending proposal is the attribute's real answer
        if (av.refItemProposal != null && av.refItemProposal.status === 'pending') {
          if (attrId) {
            initialProposals[attrId] = { name: av.refItemProposal.submittedName };
          }
          if (slug) {
            apiAttributeMap[slug] = ''; // Mutually exclusive with referenceItemId
          }
        } else {
          // Normalize value from different possible value fields
          let val = null;
          if (av.referenceItemId !== null && av.referenceItemId !== undefined) val = String(av.referenceItemId);
          else if (av.valueNumber !== null && av.valueNumber !== undefined) val = Number(av.valueNumber);
          else if (av.valueJson !== null && av.valueJson !== undefined) val = av.valueJson;
          else if (av.valueBoolean !== null && av.valueBoolean !== undefined) val = av.valueBoolean;
          else if (av.valueText !== null && av.valueText !== undefined) val = av.valueText;
          else if (av.valueDate !== null && av.valueDate !== undefined) val = av.valueDate;
          
          if (slug) apiAttributeMap[slug] = val;
          if (attrId) apiAttributeMapById[attrId] = val;
        }
      });

      if (initialItems.length > 0) {
        registerRefItems(initialItems);
      }
    }

    if (Object.keys(initialRefOptions).length > 0) {
      setReferenceOptions(prev => ({ ...initialRefOptions, ...prev }));
    }

    const initial: Record<string, any> = {};
    attributes.forEach(attr => {
      // Priority: localStorage (current session) > apiAttributeMap > details > top-level > defaults
      const savedValue = savedData[attr.slug];
      let editValue = savedValue;
      
      if (editValue === undefined || editValue === null || editValue === '') {
        // Fallback to API attribute map (flattened list by slug or by id)
        editValue = apiAttributeMap[attr.slug] ?? apiAttributeMapById[attr.id];
        
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
              apiAttributeMap['car_make'] ||
              apiAttributeMapById[attr.id];
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
              apiAttributeMap['car_model'] ||
              apiAttributeMapById[attr.id];
          } else if (slugLower === 'trim' || slugLower === 'car_trim' || slugLower === 'cartrim') {
            editValue =
              initialData?.trimId ||
              initialData?.carTrimId ||
              initialData?.trim_id ||
              initialData?.trim?.id ||
              initialData?.details?.trimId ||
              initialData?.details?.trim?.id ||
              apiAttributeMap['trim'] ||
              apiAttributeMap['car_trim'] ||
              apiAttributeMapById[attr.id];
          } else if (slugLower === 'governorate' || slugLower === 'محافظة') {
            editValue = normalizeGovernorate(initialData?.governorate || (initialData as any)?.location?.governorate || apiAttributeMap['governorate'] || apiAttributeMapById[attr.id]);
          } else if (slugLower === 'city' || slugLower === 'مدينة') {
            editValue = resolveCityValue(initialData?.city || (initialData as any)?.location?.city || apiAttributeMap['city'] || apiAttributeMapById[attr.id], initial['governorate']);
          } else if (slugLower === 'address' || slugLower === 'العنوان' || slugLower === 'detailed_address') {
            editValue = normalizeAddress(initialData?.address || (initialData as any)?.location?.address || apiAttributeMap['address'] || apiAttributeMapById[attr.id]);
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
      
      // If a proposal is held for this attribute, value must remain empty
      if (initialProposals[attr.id]?.name) {
        initial[attr.slug] = '';
      } else if (editValue !== undefined && editValue !== null && editValue !== '') {
        const slugLower = (attr.slug || '').toLowerCase();
        if (slugLower === 'governorate' || slugLower === 'محافظة') {
          initial[attr.slug] = normalizeGovernorate(editValue);
        } else if (slugLower === 'city' || slugLower === 'مدينة') {
          initial[attr.slug] = resolveCityValue(editValue, initial['governorate']);
        } else {
          initial[attr.slug] = (attr.type === 'reference' || attr.type === 'select')
            ? String(editValue)
            : editValue;
        }
      } else {
        initial[attr.slug] = (attr.type === 'repeating_group' || attr.type === 'color_multi_selection') ? [] : '';
      }
    });

    setFormData(initial);
    setProposals(initialProposals);
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

    // Merge proposals: retain other sections' proposals, update/clear for attributes in this section
    const mergedProposals = { ...(currentStoredData.__proposals__ || {}) };
    attributes.forEach(attr => {
      if (proposals[attr.id]?.name) {
        mergedProposals[attr.id] = proposals[attr.id];
      } else {
        delete mergedProposals[attr.id];
      }
    });

    // Merge only the fields owned by this section into the global STEP_TWO
    const updatedData = {
      ...currentStoredData,
      ...formData,
      __attributeMap__: currentAttrMap,
      __proposals__: mergedProposals,
      __refItems__: { ...(currentStoredData.__refItems__ || {}), ...refItemsMap }
    };

    localStorage.setItem(storageKey, JSON.stringify(updatedData));
  }, [formData, proposals, attributes, refItemsMap]);

  // Function to fetch reference options
  const fetchOptions = useCallback(async (attr: FormAttributeDto, parentItemId?: number) => {
    if (!attr.referenceGroupId) return;

    setLoadingOptions(prev => ({ ...prev, [attr.id]: true }));
    try {
      const controller = getInjection('IListingTypeRefsRepoController');
      const response = await controller.getItemsByGroupId(attr.referenceGroupId, parentItemId, 100);
      if (response.success && response.data) {
        const options = response.data.data;
        setReferenceOptions(prev => ({ ...prev, [attr.id]: options }));
        registerRefItems(options);
      }
    } catch (error) {
      console.error(`Failed to fetch options for attribute ${attr.id}`, error);
    } finally {
      setLoadingOptions(prev => ({ ...prev, [attr.id]: false }));
    }
  }, [registerRefItems]);

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
        const parentAttr = attributes.find(a => a.id === attr.dependsOnAttributeId);
        const parentValue = parentAttr ? formData[parentAttr.slug] : undefined;
        const parentHasProposal = parentAttr ? !!proposals[parentAttr.id]?.name : false;

        // Skip browse query entirely if parent has a proposal (per §7.4) or is unset
        if (parentValue && !parentHasProposal) {
          fetchOptions(attr, Number(parentValue));
        } else {
          setReferenceOptions(prev => ({ ...prev, [attr.id]: [] }));
        }
      }
    });
  }, [formData, proposals, attributes, fetchOptions]);

  // Effect to fetch metadata for any selected reference ID not yet in refItemsMap
  useEffect(() => {
    attributes.forEach(async (attr) => {
      if (attr.referenceGroupId) {
        const selectedId = formData[attr.slug];
        if (selectedId && !refItemsMap[String(selectedId)]) {
          try {
            const controller = getInjection('IListingTypeRefsRepoController');
            const parentAttr = attr.dependsOnAttributeId ? attributes.find(a => a.id === attr.dependsOnAttributeId) : null;
            const parentVal = parentAttr ? formData[parentAttr.slug] : undefined;
            
            // 1. Try querying by ID
            const res = await controller.getItemsByGroupId(
              attr.referenceGroupId,
              parentVal ? Number(parentVal) : undefined,
              10,
              String(selectedId),
              1,
              undefined,
              'id'
            );
            if (res.success && res.data?.data && res.data.data.length > 0) {
              registerRefItems(res.data.data);
            } else {
              // 2. Try fuzzy search
              const fuzzyRes = await searchFuzzyReferenceItems(attr.referenceGroupId, {
                searchTerm: String(selectedId),
                parentItemId: parentVal ? Number(parentVal) : undefined,
              });
              if (fuzzyRes.success && Array.isArray(fuzzyRes.data) && fuzzyRes.data.length > 0) {
                registerRefItems(fuzzyRes.data.map((fItem: any) => ({
                  id: fItem.id,
                  name: fItem.label,
                  translations: fItem.translations || { ar: { name: fItem.label }, en: { name: fItem.label } },
                  metadata: fItem.metadata,
                  logoUrl: fItem.logoUrl || fItem.iconUrl,
                })) as any);
              }
            }
          } catch (e) {
            console.error('Failed to fetch ref item for selected id', selectedId, e);
          }
        }
      }
    });
  }, [formData, attributes, refItemsMap, registerRefItems]);

  // Helper to evaluate valueDependency for an attribute
  const evaluateValueDependency = useCallback((attr: FormAttributeDto, currentData: Record<string, any>): boolean => {
    const isTrim = isTrimAttribute(attr);

    if (isTrim) {
      // 1. If explicitly required globally on schema attribute
      if (attr.isRequired || (attr as any).required) return true;

      // 2. Check if selected make or model has isCarTrimRequired in metadata or property
      const makeAttr = attributes.find(a => isMakeAttribute(a));
      const selectedMakeId = makeAttr ? currentData[makeAttr.slug] : null;
      const selectedMakeItem = selectedMakeId
        ? (refItemsMap[String(selectedMakeId)] || referenceOptions[makeAttr?.id || 0]?.find((m: any) => String(m.id) === String(selectedMakeId)))
        : null;

      const modelAttr = attributes.find(a => isModelAttribute(a));
      const selectedModelId = modelAttr ? currentData[modelAttr.slug] : null;
      const selectedModelItem = selectedModelId
        ? (refItemsMap[String(selectedModelId)] || referenceOptions[modelAttr?.id || 0]?.find((m: any) => String(m.id) === String(selectedModelId)))
        : null;

      const trimReqOnModel = extractIsTrimRequired(selectedModelItem);
      if (trimReqOnModel !== undefined) return trimReqOnModel;

      const trimReqOnMake = extractIsTrimRequired(selectedMakeItem);
      if (trimReqOnMake !== undefined) return trimReqOnMake;

      if (referenceOptions[attr.id] && referenceOptions[attr.id].length > 0) {
        return true;
      }

      return false;
    }

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
  }, [attributes, referenceOptions, refItemsMap]);

  // Standard field change handler
  const handleFieldChange = useCallback((slug: string, value: any) => {
    const targetAttr = attributes.find(a => a.slug === slug);

    setFormData(prev => {
      const newData = { ...prev, [slug]: value };
      
      // Cascade clearing: Reset dependent fields
      if (targetAttr) {
        attributes.forEach(attr => {
          if (attr.dependsOnAttributeId === targetAttr.id) {
            newData[attr.slug] = '';
          }
        });
      }

      // Clear values of fields whose valueDependency is met (they become hidden)
      attributes.forEach(attr => {
        const isShown = evaluateValueDependency(attr, newData);
        if (!isShown) {
          newData[attr.slug] = attr.type === 'repeating_group' ? [] : '';
        }
      });
      
      return newData;
    });

    // If target attribute had a proposal, clear it (real pick wins)
    if (targetAttr) {
      setProposals(prev => {
        const updated = { ...prev };
        delete updated[targetAttr.id];
        // Cascade clear proposals for dependent children
        attributes.forEach(attr => {
          if (attr.dependsOnAttributeId === targetAttr.id) {
            delete updated[attr.id];
          }
        });
        return updated;
      });
    }
  }, [attributes, evaluateValueDependency]);

  // Re-evaluate field visibility whenever refItemsMap changes (e.g. make metadata loaded after selection)
  // This ensures trim shows/hides correctly as soon as isCarTrimRequired is known
  useEffect(() => {
    if (!isInitialized.current) return;
    setFormData(prev => {
      const newData = { ...prev };
      let changed = false;
      attributes.forEach(attr => {
        if (!isTrimAttribute(attr)) return; // Only re-evaluate trim fields on refItemsMap change
        const isShown = evaluateValueDependency(attr, newData);
        if (!isShown && newData[attr.slug] !== '' && newData[attr.slug] !== undefined) {
          newData[attr.slug] = attr.type === 'repeating_group' ? [] : '';
          changed = true;
        }
      });
      return changed ? newData : prev;
    });
  }, [refItemsMap, attributes, evaluateValueDependency]);

  // Set proposal for a reference attribute
  const handleSetProposal = useCallback((attrId: number, name: string) => {
    const targetAttr = attributes.find(a => a.id === attrId);
    if (!targetAttr) return;

    // Mutually exclusive: set proposal and clear formData value
    setProposals(prev => {
      const updated = { ...prev, [attrId]: { name } };
      // Cascade clear child proposals
      attributes.forEach(attr => {
        if (attr.dependsOnAttributeId === attrId) {
          delete updated[attr.id];
        }
      });
      return updated;
    });

    setFormData(prev => {
      const newData = { ...prev, [targetAttr.slug]: '' };
      // Cascade clear child values
      attributes.forEach(attr => {
        if (attr.dependsOnAttributeId === attrId) {
          newData[attr.slug] = '';
        }
      });
      return newData;
    });
  }, [attributes]);

  // Clear proposal for a reference attribute
  const handleClearProposal = useCallback((attrId: number) => {
    const targetAttr = attributes.find(a => a.id === attrId);
    if (!targetAttr) return;

    setProposals(prev => {
      const updated = { ...prev };
      delete updated[attrId];
      attributes.forEach(attr => {
        if (attr.dependsOnAttributeId === attrId) {
          delete updated[attr.id];
        }
      });
      return updated;
    });

    setFormData(prev => {
      const newData = { ...prev, [targetAttr.slug]: '' };
      attributes.forEach(attr => {
        if (attr.dependsOnAttributeId === attrId) {
          newData[attr.slug] = '';
        }
      });
      return newData;
    });
  }, [attributes]);

  // Resolve fuzzy existing item (Re-binds the whole chain per §7.5)
  const handleResolveFuzzyExisting = useCallback((
    attrId: number,
    existingItem: ProposeReferenceResult & { kind: 'existing' }
  ) => {
    const targetAttr = attributes.find(a => a.id === attrId);
    if (!targetAttr) return;

    // Find parent attribute (via dependsOnAttributeId or semantic fallback)
    let parentAttr: FormAttributeDto | undefined;
    if (targetAttr.dependsOnAttributeId) {
      parentAttr = attributes.find(a => a.id === targetAttr.dependsOnAttributeId);
    }
    if (!parentAttr && existingItem.parentItemId) {
      if (isModelAttribute(targetAttr)) {
        parentAttr = attributes.find(a => isMakeAttribute(a));
      } else if (isTrimAttribute(targetAttr)) {
        parentAttr = attributes.find(a => isModelAttribute(a));
      }
    }

    // Register ref items so they are immediately available in refItemsMap
    const itemsToRegister: ListingTypeRefItemDto[] = [
      {
        id: existingItem.id,
        name: existingItem.label,
        translations: {
          ar: { name: existingItem.label },
          en: { name: existingItem.label },
        },
        metadata: existingItem.metadata as any,
      } as any,
    ];

    if (existingItem.parentItemId && existingItem.parentLabel) {
      itemsToRegister.push({
        id: existingItem.parentItemId,
        name: existingItem.parentLabel,
        translations: {
          ar: { name: existingItem.parentLabel },
          en: { name: existingItem.parentLabel },
        },
        metadata: existingItem.parentMetadata as any,
      } as any);
    }

    registerRefItems(itemsToRegister);

    // Remove any active proposal for this attribute and cascade
    setProposals(prev => {
      const updated = { ...prev };
      delete updated[attrId];

      // If existing item has parentItemId and targetAttr has a parent, also clear parent's proposal
      if (existingItem.parentItemId && parentAttr) {
        delete updated[parentAttr.id];
      }

      // Cascade clear child proposals
      attributes.forEach(attr => {
        if (attr.dependsOnAttributeId === targetAttr.id) {
          delete updated[attr.id];
        }
      });

      return updated;
    });

    setFormData(prev => {
      const newData = { ...prev, [targetAttr.slug]: String(existingItem.id) };

      // Re-bind parent if parentItemId is present (§7.5)
      if (existingItem.parentItemId && parentAttr) {
        newData[parentAttr.slug] = String(existingItem.parentItemId);
      }

      // Cascade clear child values
      attributes.forEach(attr => {
        if (attr.dependsOnAttributeId === targetAttr.id) {
          newData[attr.slug] = attr.type === 'repeating_group' ? [] : '';
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
  }, [attributes, registerRefItems, evaluateValueDependency]);

  // Use refs to avoid infinite loops with unstable parent callbacks
  const onValidationChangeRef = useRef(onValidationChange);
  useEffect(() => {
    onValidationChangeRef.current = onValidationChange;
  }, [onValidationChange]);

  const lastValidRef = useRef<boolean | null>(null);

  useEffect(() => {
    const isValid = attributes.every(attr => {
      // If the field is hidden by valueDependency or trim rule, it should NOT be required for validation!
      const isShown = evaluateValueDependency(attr, formData);
      if (!isShown) return true;

      const isTrim = isTrimAttribute(attr);
      const isTrimReq = isTrim
        ? (extractIsTrimRequired(refItemsMap[String(formData[attributes.find(a => isModelAttribute(a))?.slug || ''])]) ??
           extractIsTrimRequired(refItemsMap[String(formData[attributes.find(a => isMakeAttribute(a))?.slug || ''])]) ??
           attr.isRequired)
        : (attr.isRequired || (attr as any).required);

      if (isTrimReq) {
        // §7.7 (1): A proposal counts as filled for reference attributes
        const hasProposal = !!proposals[attr.id]?.name;
        if (attr.type === 'reference' && hasProposal) {
          return true;
        }

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
  }, [formData, proposals, attributes, evaluateValueDependency, refItemsMap]);

  return {
    formData,
    proposals,
    referenceOptions,
    loadingOptions,
    refItemsMap,
    registerRefItems,
    handleFieldChange,
    handleSetProposal,
    handleClearProposal,
    handleResolveFuzzyExisting,
  };
};
