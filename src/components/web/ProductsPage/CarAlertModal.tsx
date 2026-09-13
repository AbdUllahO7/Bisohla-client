'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Bell, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCarAlert } from '@/core/infrastructure-adapters/actions/users/car-alert.user.actions';
import { getInjection } from '@/di/container';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { useLocale, useTranslations } from 'next-intl';
import { getAlertFormSchema } from '@/core/infrastructure-adapters/actions/visitors/listing-types.actions';
import { 
  ListingTypeAlertFormSchemaDto, 
  FormAttributeDto 
} from '@/core/entities/models/listing-types/listing-types.dto';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { extractIsTrimRequired, isTrimAttribute, isMakeAttribute, isModelAttribute } from '@/utils/trim-helpers';
import SelectableList, { Option } from '@/components/web/ProductsPage/addProducts/StepOne/SelectableList';
import SelectFieldWithSearch from '@/components/web/design/SelectFieldWithSearch';
import { getColorOptions } from '@/core/entities/enums/cars.enums';
import { searchFuzzyReferenceItems } from '@/core/infrastructure-adapters/actions/visitors/reference-proposal.actions';

interface CarAlertModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: {
    id?: number;
    makeId?: number;
    modelId?: number;
    trimId?: number;
    minPrice?: number;
    maxPrice?: number;
    governorate?: string;
    city?: string;
    attributeFilters?: Record<string, any>;
  };
  governorateOptions: { value: string; label: string }[];
  getCityOptions: (governorate: string) => { value: string; label: string }[];
  isArabic: boolean;
  t: any;
  listingTypeId?: number;
}

const CarAlertModal: React.FC<CarAlertModalProps> = ({
  open,
  onOpenChange,
  initialData,
  governorateOptions,
  getCityOptions,
  isArabic,
  t,
  listingTypeId = 1, // Default to 1 (Cars)
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    minPrice: '',
    maxPrice: '',
    governorate: '',
    city: '',
  });

  const [schema, setSchema] = useState<ListingTypeAlertFormSchemaDto | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refItemsMap, setRefItemsMap] = useState<Record<string, ListingTypeRefItemDto>>({});
  const locale = useLocale();
  const tModal = useTranslations('carAlertModal');

  const { toast } = useToast();

  const registerRefItems = useCallback((items: ListingTypeRefItemDto[]) => {
    if (!items || !items.length) return;
    setRefItemsMap((prev) => {
      let changed = false;
      const next = { ...prev };
      items.forEach((item) => {
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

  // Translation helper
  const getTranslation = useCallback(
    (val: any): string => {
      if (!val) return '';
      if (typeof val === 'string') return val;
      if (Array.isArray(val)) {
        const locMatch = val.find((item: any) => item?.locale === locale);
        if (locMatch) {
          if (typeof locMatch === 'string') return locMatch;
          if (typeof locMatch?.name === 'string') return locMatch.name;
          if (typeof locMatch?.value === 'string') return locMatch.value;
        }
        const fallback =
          val.find((item: any) => item?.locale === 'ar' || item?.locale === 'en') || val[0];
        if (fallback) {
          if (typeof fallback === 'string') return fallback;
          if (typeof fallback?.name === 'string') return fallback.name;
          if (typeof fallback?.value === 'string') return fallback.value;
        }
        return '';
      }
      if (typeof val === 'object') {
        const locVal = val[locale] ?? val['ar'] ?? val['en'];
        if (typeof locVal === 'string') return locVal;
        if (locVal && typeof locVal === 'object') {
          if (typeof locVal.name === 'string') return locVal.name;
          if (typeof locVal.label === 'string') return locVal.label;
          if (typeof locVal.value === 'string') return locVal.value;
        }
        if (typeof val.name === 'string') return val.name;
        if (val.name && typeof val.name === 'object') {
          const innerLoc = val.name[locale] ?? val.name['ar'] ?? val.name['en'];
          if (typeof innerLoc === 'string') return innerLoc;
        }
        if (typeof val.label === 'string') return val.label;
        if (typeof val.value === 'string') return val.value;
        for (const k of Object.keys(val)) {
          const prop = val[k];
          if (typeof prop === 'string') return prop;
          if (prop && typeof prop === 'object' && typeof prop.name === 'string') return prop.name;
        }
        return '';
      }
      return String(val);
    },
    [locale],
  );

  // Fetch schema when modal opens
  useEffect(() => {
    if (open && listingTypeId) {
      const fetchSchema = async () => {
        setIsLoadingSchema(true);
        try {
          const res = await getAlertFormSchema(listingTypeId);
          if (res.success && res.data) {
            setSchema({ ...res.data, listingTypeId });
            
            // Initialize form data from schema and initialData
            const initial: Record<string, any> = {
              minPrice: initialData?.minPrice || '',
              maxPrice: initialData?.maxPrice || '',
              governorate: initialData?.governorate || '',
              city: initialData?.city || '',
            };

            // Map attributes from schema
            res.data.sections.forEach((section) => {
              section.attributes.forEach((attr) => {
                const slug = attr.slug;
                let val = (initialData as any)?.[slug];
                
                if ((val === undefined || val === null) && initialData?.attributeFilters) {
                   val = initialData.attributeFilters[slug];
                }

                if (val === undefined || val === null) {
                   // Fallback with Id suffix
                   val = (initialData as any)?.[`${slug}Id`];
                }

                // Make/Model/Trim explicit initial fallbacks
                if ((val === undefined || val === null)) {
                  if (isMakeAttribute(attr)) val = initialData?.makeId;
                  else if (isModelAttribute(attr)) val = initialData?.modelId;
                  else if (isTrimAttribute(attr)) val = initialData?.trimId;
                }
                
                initial[slug] = val ? String(val) : '';
              });
            });

            setFormData(initial);
          }
        } catch (error) {
          console.error('Failed to fetch alert schema:', error);
          toast({
            title: isArabic ? 'خطأ' : 'Error',
            description: isArabic 
              ? 'فشل في تحميل نموذج التنبيه' 
              : 'Failed to load alert form schema',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingSchema(false);
        }
      };
      fetchSchema();
    }
  }, [open, listingTypeId, initialData, isArabic, toast]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const nextData = { ...prev, [name]: value };
      if (name === 'governorate') {
        nextData.city = '';
      }
      
      // Clear dependent fields recursively
      if (schema) {
        const allAttrs = schema.sections.flatMap((s) => s.attributes);
        const targetAttr = allAttrs.find((a) => a.slug === name);
        if (targetAttr) {
          const queue = [targetAttr.id];
          while (queue.length > 0) {
            const currentId = queue.shift();
            const dependentAttrs = allAttrs.filter((a) => a.dependsOnAttributeId === currentId);
            for (const dep of dependentAttrs) {
              nextData[dep.slug] = '';
              queue.push(dep.id);
            }
          }
        }
      }
      
      return nextData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        listingTypeId: listingTypeId,
        minPrice: formData.minPrice ? Number(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? Number(formData.maxPrice) : null,
        governorate: formData.governorate || null,
        city: formData.city || null,
        attributeFilters: {}
      };

      // Collect all dynamic attributes from schema and put them in attributeFilters
      if (schema) {
        schema.sections.forEach((section) => {
          section.attributes.forEach((attr) => {
            const value = formData[attr.slug];
            if (value !== undefined && value !== null && value !== '') {
              // Convert to number if it's a reference or a number type
              const type = attr.type.toLowerCase();
              if (type === 'reference' || type === 'number' || type === 'year') {
                payload.attributeFilters[attr.slug] = Number(value);
              } else {
                payload.attributeFilters[attr.slug] = value;
              }
            }
          });
        });
      }

      const res = await createCarAlert(payload);
      if (res.success) {
        toast({
          title: tModal('alertCreated'),
          description: tModal('willNotify'),
        });
        onOpenChange(false);
      } else {
        toast({
          title: tModal('creationError'),
          description: res.message || tModal('failedCreate'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: tModal('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cityOptions = useMemo(() => {
    return formData.governorate ? getCityOptions(formData.governorate) : [];
  }, [formData.governorate, getCityOptions]);

  // Check if an attribute should be rendered
  const shouldShowAttribute = useCallback(
    (attr: FormAttributeDto) => {
      const isTrim = isTrimAttribute(attr);
      if (isTrim) {
        if (attr.isRequired || (attr as any).required) return true;

        const allAttrs = schema?.sections.flatMap((s) => s.attributes) || [];
        const makeAttr = allAttrs.find((a) => isMakeAttribute(a));
        const modelAttr = allAttrs.find((a) => isModelAttribute(a));
        const selectedMakeId = makeAttr ? formData[makeAttr.slug] : null;
        const selectedModelId = modelAttr ? formData[modelAttr.slug] : null;

        const selectedMakeItem = selectedMakeId ? refItemsMap[String(selectedMakeId)] : null;
        const selectedModelItem = selectedModelId ? refItemsMap[String(selectedModelId)] : null;

        const trimReqOnModel = extractIsTrimRequired(selectedModelItem);
        if (trimReqOnModel !== undefined) return trimReqOnModel;

        const trimReqOnMake = extractIsTrimRequired(selectedMakeItem);
        if (trimReqOnMake !== undefined) return trimReqOnMake;

        return false;
      }
      return true;
    },
    [schema, formData, refItemsMap],
  );

  // Group attributes into reference attributes (Make, Model, Trim, etc.) and other form fields
  const { referenceAttributes, otherAttributes } = useMemo(() => {
    if (!schema) return { referenceAttributes: [], otherAttributes: [] };
    const all = schema.sections
      .flatMap((s) => s.attributes)
      .sort((a, b) => a.order - b.order);

    const refAttrs: FormAttributeDto[] = [];
    const otherAttrs: FormAttributeDto[] = [];

    all.forEach((attr) => {
      const type = attr.type.toLowerCase();
      if (type === 'reference' || !!attr.referenceGroupId) {
        refAttrs.push(attr);
      } else {
        otherAttrs.push(attr);
      }
    });

    return { referenceAttributes: refAttrs, otherAttributes: otherAttrs };
  }, [schema]);

  const renderReferenceAttribute = (attr: FormAttributeDto) => {
    if (!shouldShowAttribute(attr)) return null;

    const parentAttr = attr.dependsOnAttributeId 
      ? schema?.sections.flatMap((s) => s.attributes).find((a) => a.id === attr.dependsOnAttributeId)
      : null;
    const parentValue = parentAttr ? formData[parentAttr.slug] : undefined;

    const selectedValue = formData[attr.slug]?.toString() || '';
    const selectedRef = selectedValue ? refItemsMap[selectedValue] : null;

    const isDigitsOnly = (str: string) => /^\d+$/.test(str.trim());
    const refLabel = selectedRef
      ? (getTranslation(selectedRef.translations) ||
         getTranslation(selectedRef.name) ||
         (selectedRef as any).label ||
         (typeof selectedRef.name === 'string' ? selectedRef.name : '') ||
         '')
      : '';

    const selectedOptionProp: Option | null = selectedRef
      ? {
          value: String(selectedValue),
          label: refLabel || (!isDigitsOnly(String(selectedValue)) ? String(selectedValue) : ''),
          logoUrl: selectedRef.logoUrl || selectedRef.iconUrl,
          keywords: [
            typeof selectedRef.name === 'string' ? selectedRef.name : '',
            (selectedRef.name as any)?.ar || (selectedRef.translations as any)?.ar?.name || '',
            (selectedRef.name as any)?.en || (selectedRef.translations as any)?.en?.name || '',
          ].filter(Boolean),
        }
      : (selectedValue && !isDigitsOnly(String(selectedValue))
          ? { value: String(selectedValue), label: String(selectedValue) }
          : null);

    const isTrim = isTrimAttribute(attr);
    const isTrimReq = isTrim
      ? (extractIsTrimRequired(refItemsMap[String(formData[schema?.sections.flatMap(s => s.attributes).find(a => isModelAttribute(a))?.slug || ''])]) ??
         extractIsTrimRequired(refItemsMap[String(formData[schema?.sections.flatMap(s => s.attributes).find(a => isMakeAttribute(a))?.slug || ''])]) ??
         attr.isRequired)
      : attr.isRequired;

    return (
      <div key={attr.id} className="flex-1 min-w-[260px] max-w-[320px]">
        <SelectableList
          title={getTranslation(attr.name)}
          type={attr.slug}
          selectedValue={selectedValue}
          selectedOption={selectedOptionProp}
          direction={isArabic ? 'rtl' : 'ltr'}
          required={isTrimReq}
          onSelect={(_type, val, optionObj) => {
            if (optionObj && optionObj.label) {
              registerRefItems([{
                id: isNaN(Number(val)) ? val : Number(val),
                name: optionObj.label,
                translations: { [locale]: { name: optionObj.label } },
                logoUrl: optionObj.logoUrl,
                metadata: (optionObj as any).metadata,
              } as any]);
            }
            // Allow toggle off if clicking the already selected value
            const nextVal = selectedValue === String(val) ? '' : val;
            handleChange(attr.slug, nextVal);
          }}
          fetchOptions={
            attr.referenceGroupId
              ? async (params) => {
                  if (attr.dependsOnAttributeId && !parentValue) {
                    return { options: [], hasMore: false, total: 0 };
                  }
                  const controller = getInjection('IListingTypeRefsRepoController');
                  const sTerm = params.searchTerm?.trim();

                  // 1. Fetch from standard endpoint without locale restriction to search Arabic & English
                  const res = await controller.getItemsByGroupId(
                    attr.referenceGroupId!,
                    parentValue ? Number(parentValue) : undefined,
                    params.pageSize || 30,
                    sTerm || undefined,
                    params.page || 1,
                  );

                  let rawItems = (res.success && res.data?.data) ? [...res.data.data] : [];

                  // 2. If searched and standard query returned 0 items on page 1, try fuzzy search
                  if (sTerm && sTerm.length >= 2 && rawItems.length === 0 && (params.page || 1) === 1) {
                    try {
                      const fuzzyRes = await searchFuzzyReferenceItems(attr.referenceGroupId!, {
                        searchTerm: sTerm,
                        parentItemId: parentValue ? Number(parentValue) : undefined,
                      });
                      if (fuzzyRes && fuzzyRes.success && Array.isArray(fuzzyRes.data) && fuzzyRes.data.length > 0) {
                        rawItems = fuzzyRes.data.map((fItem: any) => ({
                          id: fItem.id,
                          name: fItem.label,
                          translations: fItem.translations || { [locale]: { name: fItem.label } },
                          metadata: fItem.metadata,
                          logoUrl: fItem.logoUrl || fItem.iconUrl,
                        })) as any;
                      }
                    } catch (err) {
                      console.warn('Fuzzy search fallback failed for:', sTerm, err);
                    }
                  }

                  if (rawItems.length > 0) {
                    registerRefItems(rawItems);
                    const items = rawItems.map((item: any) => ({
                      value: item.id.toString(),
                      label: getTranslation(item.translations) || getTranslation(item.name) || item.name || item.label || '',
                      logoUrl: item.logoUrl || item.iconUrl,
                      keywords: [
                        typeof item.name === 'string' ? item.name : '',
                        item.name?.ar || item.translations?.ar?.name || '',
                        item.name?.en || item.translations?.en?.name || '',
                        item.label || '',
                        item.slug || '',
                        ...(Array.isArray(item.translations) ? item.translations.map((tr: any) => tr.name) : []),
                      ].filter(Boolean),
                    }));
                    return {
                      options: items,
                      hasMore: !!res.data?.hasNextPage,
                      total: res.data?.totalItems || items.length,
                    };
                  }
                  return { options: [], hasMore: false, total: 0 };
                }
              : undefined
          }
          dependencyKey={`${attr.referenceGroupId}_${parentValue || 'none'}`}
        />
      </div>
    );
  };

  const renderOtherAttribute = (attr: FormAttributeDto) => {
    if (!shouldShowAttribute(attr)) return null;

    const label = getTranslation(attr.name);
    const hint = getTranslation(attr.hint);
    const type = attr.type.toLowerCase();

    const labelElement = (
      <div className="flex items-center gap-1.5 mb-2">
        <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
          {label}
          {attr.isRequired && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );

    if (type === 'year') {
      const minYear = attr.validationRules?.min || 1950;
      const maxYear = attr.validationRules?.max || new Date().getFullYear() + 1;
      const yearOptions = [];
      for (let y = maxYear; y >= minYear; y--) {
        yearOptions.push({ value: y.toString(), label: y.toString() });
      }
      return (
        <div key={attr.id} className="space-y-1">
          {labelElement}
          <SelectFieldWithSearch
            name={attr.slug}
            options={yearOptions}
            value={formData[attr.slug]?.toString() || ''}
            onChange={(name, val) => handleChange(name, val)}
            placeholder={hint || (isArabic ? `اختر ${label}` : `Select ${label}`)}
            searchPlaceholder={isArabic ? `بحث في ${label}...` : `Search ${label}...`}
            emptyMessage={isArabic ? 'لا توجد نتائج' : 'No results found'}
            isRtl={isArabic}
            SelectTriggerStyle="h-10 border-slate-200  dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 rounded-lg text-sm"
          />
        </div>
      );
    }

    if (type === 'color_picker') {
      const val = formData[attr.slug] || '';
      return (
        <div key={attr.id} className="space-y-1">
          {labelElement}
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={val || '#000000'}
              onChange={(e) => handleChange(attr.slug, e.target.value)}
              className="w-10 h-10 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer p-0.5 bg-white dark:bg-zinc-900 shadow-sm"
            />
            <Input
              type="text"
              placeholder="#000000"
              value={val}
              onChange={(e) => handleChange(attr.slug, e.target.value)}
              className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg font-mono"
              dir="ltr"
            />
          </div>
        </div>
      );
    }

    const slugLower = (attr.slug || '').toLowerCase();
    const isColorField = slugLower.includes('color') || slugLower.includes('لون') || slugLower.includes('colour');

    if ((isColorField && type !== 'color_picker') || type === 'select' || type === 'dropdown' || type === 'color_selection' || type === 'color_multi_selection') {
      const fixedOptions = Array.isArray(attr.options) ? attr.options : [];
      let combinedOptions: any[] = [];

      if (isColorField && fixedOptions.length === 0) {
        combinedOptions = getColorOptions(t).map((opt) => ({
          value: opt.value,
          label: opt.label,
        }));
      } else if (isColorField && type !== 'color_selection' && type !== 'color_multi_selection') {
        combinedOptions = getColorOptions(t).map((opt) => ({
          value: opt.value,
          label: opt.label,
        }));
      } else {
        combinedOptions = fixedOptions.map((opt: any, idx: number) => {
          const optVal =
            opt.id !== undefined && opt.id !== null
              ? String(opt.id)
              : opt.value !== undefined && opt.value !== null
              ? String(opt.value)
              : typeof opt === 'string'
              ? opt
              : String(idx);
          return {
            value: optVal,
            label: getTranslation(opt.label || opt.name || opt),
          };
        }).filter((o) => Boolean(o.value));
      }

      const isMulti = type === 'color_multi_selection';

      return (
        <div key={attr.id} className="space-y-1">
          {labelElement}
          <SelectFieldWithSearch
            name={attr.slug}
            options={combinedOptions}
            value={
              isMulti
                ? Array.isArray(formData[attr.slug])
                  ? formData[attr.slug]
                  : formData[attr.slug]
                  ? [formData[attr.slug].toString()]
                  : []
                : formData[attr.slug]?.toString() || ''
            }
            onChange={(name, val) => handleChange(name, val)}
            placeholder={getTranslation(attr.hint || attr.name)}
            searchPlaceholder={isArabic ? `بحث في ${getTranslation(attr.name)}...` : `Search ${getTranslation(attr.name)}...`}
            emptyMessage={isArabic ? 'لا توجد نتائج' : 'No results found'}
            isRtl={isArabic}
            isMulti={isMulti}
            SelectTriggerStyle="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 rounded-lg text-sm"
            fetchOptions={
              attr.referenceGroupId
                ? async (params) => {
                    const controller = getInjection('IListingTypeRefsRepoController');
                    const res = await controller.getItemsByGroupId(
                      attr.referenceGroupId!,
                      undefined,
                      params.pageSize || 30,
                      params.searchTerm?.trim() || undefined,
                      params.page || 1
                    );
                    if (res.success && res.data) {
                      const rawItems = res.data.data || [];
                      registerRefItems(rawItems);
                      return {
                        options: rawItems.map((item: any) => ({
                          value: item.id.toString(),
                          label: getTranslation(item.translations) || getTranslation(item.name) || item.name || '',
                        })),
                        hasMore: !!res.data.hasNextPage,
                        total: res.data.totalItems,
                      };
                    }
                    return { options: [], hasMore: false, total: 0 };
                  }
                : undefined
            }
            dependencyKey={attr.referenceGroupId}
          />
        </div>
      );
    }

    if (type === 'number' || type === 'text' || type === 'string') {
      return (
        <div key={attr.id} className="space-y-1">
          {labelElement}
          <Input
            type={type === 'number' ? 'number' : 'text'}
            placeholder={hint || label}
            value={formData[attr.slug] || ''}
            onChange={(e) => handleChange(attr.slug, e.target.value)}
            className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-w-[95vw] w-full p-0 overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border-none shadow-2xl">
        <div className="relative bg-primary dark:bg-gradient-to-r dark:from-[#198341] dark:to-[#ABDE3B] px-8 py-7">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md border border-white/30 dark:border-zinc-950/30">
              <Bell className="h-7 w-7 text-white dark:text-zinc-950" />
            </div>
            <div className="flex flex-col items-start">
              <DialogTitle className="text-2xl sm:text-3xl font-bold text-white dark:text-zinc-950 m-0 mb-1">
                {initialData?.id ? tModal('editAlert') : tModal('notifyMe')}
              </DialogTitle>
              <p className="text-sm text-white/95 dark:text-zinc-900">
                {initialData?.id ? tModal('updateCriteria') : tModal('beFirst')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-6 sm:px-8 py-6 max-h-[68vh] overflow-y-auto space-y-8 scrollbar-hide overscroll-contain" dir={isArabic ? 'rtl' : 'ltr'}>
            {isLoadingSchema ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-primary dark:text-[#ABDE3B] animate-spin" />
                <p className="text-slate-500 dark:text-zinc-400 font-medium animate-pulse">
                  {isArabic ? 'جاري تحميل الخيارات...' : 'Loading options...'}
                </p>
              </div>
            ) : (
              <>
                {/* Reference Attributes (Make, Model, Trim, etc.) Rendered as SelectableList like Add/Edit Product */}
                {referenceAttributes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-[#ABDE3B]" />
                      <h3 className="text-sm font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                        {isArabic ? 'المركبة والمواصفات المرجعية' : 'Vehicle & Specifications'}
                      </h3>
                      <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                    </div>
                    <div className="flex flex-wrap items-start justify-center gap-6 pb-2">
                      {referenceAttributes.map(renderReferenceAttribute)}
                    </div>
                  </div>
                )}

                {/* Other Dynamic Schema Attributes */}
                {otherAttributes.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-[#ABDE3B]" />
                      <h3 className="text-sm font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                        {isArabic ? 'تفاصيل إضافية' : 'Additional Details'}
                      </h3>
                      <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {otherAttributes.map(renderOtherAttribute)}
                    </div>
                  </div>
                )}

                {/* Location Fields */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-[#ABDE3B]" />
                    <h3 className="text-sm font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                      {isArabic ? 'الموقع' : 'Location'}
                    </h3>
                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        {isArabic ? 'المحافظة' : 'Governorate'}
                      </Label>
                      <SelectFieldWithSearch
                        name="governorate"
                        options={governorateOptions}
                        value={formData.governorate || ''}
                        onChange={(_name, val) => handleChange('governorate', val)}
                        placeholder={isArabic ? 'اختر محافظة' : 'Select Governorate'}
                        searchPlaceholder={isArabic ? 'بحث في المحافظات...' : 'Search governorates...'}
                        emptyMessage={isArabic ? 'لا توجد نتائج' : 'No results found'}
                        isRtl={isArabic}
                        SelectTriggerStyle="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 rounded-lg text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        {isArabic ? 'المدينة' : 'City'}
                      </Label>
                      <SelectFieldWithSearch
                        name="city"
                        options={cityOptions}
                        value={formData.city || ''}
                        onChange={(_name, val) => handleChange('city', val)}
                        disabled={!formData.governorate}
                        placeholder={
                          !formData.governorate
                            ? isArabic
                              ? 'اختر المحافظة أولاً'
                              : 'Select Governorate first'
                            : isArabic
                              ? 'اختر مدينة'
                              : 'Select City'
                        }
                        searchPlaceholder={isArabic ? 'بحث في المدن...' : 'Search cities...'}
                        emptyMessage={isArabic ? 'لا توجد نتائج' : 'No results found'}
                        isRtl={isArabic}
                        SelectTriggerStyle="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Range Fields */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-[#ABDE3B]" />
                    <h3 className="text-sm font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                      {isArabic ? 'السعر' : 'Price'}
                    </h3>
                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        {isArabic ? 'السعر الأدنى' : 'Min Price'}
                      </Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={formData.minPrice}
                        onChange={(e) => handleChange('minPrice', e.target.value)}
                        className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        {isArabic ? 'السعر الأعلى' : 'Max Price'}
                      </Label>
                      <Input
                        type="number"
                        placeholder={isArabic ? 'لا يوجد حد' : 'No limit'}
                        value={formData.maxPrice}
                        onChange={(e) => handleChange('maxPrice', e.target.value)}
                        className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-zinc-800 flex-row gap-4 bg-slate-50/50 dark:bg-zinc-950/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-13 text-base font-semibold rounded-2xl border-2 border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
            >
              {tModal('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingSchema}
              className="flex-1 h-13 text-base rounded-2xl bg-primary dark:bg-gradient-to-r dark:from-[#198341] dark:to-[#ABDE3B] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white dark:text-zinc-950 font-bold transition-all shadow-md"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin dark:text-zinc-950" />
                  {tModal('saving')}
                </>
              ) : (
                initialData?.id ? tModal('saveChanges') : tModal('activateAlert')
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CarAlertModal;
