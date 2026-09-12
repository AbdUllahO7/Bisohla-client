'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Bell, Loader2, Info, Layers } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocale, useTranslations } from 'next-intl';
import ServerSelect from '@/components/forms/server-select';
import { getInjection } from '@/di/container';
import { getAlertFormSchema } from '@/core/infrastructure-adapters/actions/visitors/listing-types.actions';
import { ListingTypeAlertFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import {
  useCreateCarAlert,
  useUpdateCarAlert,
} from '@/core/infrastructure-adapters/use-actions/users/car-alert.user.use-actions';
import { getGovernorateOptions, getCityOptions } from '@/components/web/ProductsPage/addProducts/StepOne/utils';
import { extractIsTrimRequired, isTrimAttribute, isMakeAttribute, isModelAttribute } from '@/utils/trim-helpers';
import { searchFuzzyReferenceItems } from '@/core/infrastructure-adapters/actions/visitors/reference-proposal.actions';

interface AlertFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alertId?: number;
  initialData?: Record<string, any>;
  defaultListingTypeId?: number;
  onSuccess?: () => void;
}

export function AlertFormModal({
  open,
  onOpenChange,
  alertId,
  initialData,
  defaultListingTypeId = 1,
  onSuccess,
}: AlertFormModalProps) {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const tModal = useTranslations('carAlertModal');
  const { toast } = useToast();

  const isEditMode = !!alertId;

  // Form State
  const [selectedTypeId, setSelectedTypeId] = useState<number>(
    initialData?.listingTypeId || defaultListingTypeId,
  );
  const [listingTypes, setListingTypes] = useState<Array<{ id: number; name: string }>>([]);
  const [schema, setSchema] = useState<ListingTypeAlertFormSchemaDto | null>(null);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);
  const [refItemsMap, setRefItemsMap] = useState<Record<string, ListingTypeRefItemDto>>({});

  const [formData, setFormData] = useState<Record<string, any>>({
    minPrice: '',
    maxPrice: '',
    governorate: '',
    city: '',
  });

  const createAlertMutation = useCreateCarAlert();
  const updateAlertMutation = useUpdateCarAlert();
  const isSubmitting = createAlertMutation.isPending || updateAlertMutation.isPending;

  const governorateOptions = useMemo(() => getGovernorateOptions(isArabic), [isArabic]);

  // Fetch listing types if in create mode
  useEffect(() => {
    if (open && !isEditMode) {
      const fetchTypes = async () => {
        try {
          const controller = getInjection('IListingTypesRepoController');
          const res = await controller.getListingTypes(1, 100);
          if (res.success && res.data) {
            setListingTypes(
              res.data.data
                .filter((t: any) => t.isActive)
                .map((t: any) => ({
                  id: t.id,
                  name:
                    t.translations?.find((tr: any) => tr.locale === locale)?.name || t.name,
                })),
            );
          }
        } catch {
          // silently ignore
        }
      };
      fetchTypes();
    }
  }, [open, isEditMode, locale]);

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

  // Fetch schema when modal opens or listing type changes
  useEffect(() => {
    if (open && selectedTypeId) {
      const fetchSchema = async () => {
        setIsLoadingSchema(true);
        try {
          const res = await getAlertFormSchema(selectedTypeId);
          if (res.success && res.data) {
            setSchema({ ...res.data, listingTypeId: selectedTypeId });

            const initial: Record<string, any> = {
              minPrice: initialData?.minPrice ?? '',
              maxPrice: initialData?.maxPrice ?? '',
              governorate: initialData?.governorate ?? '',
              city: initialData?.city ?? '',
            };

            res.data.sections.forEach((section) => {
              section.attributes.forEach((attr) => {
                const slug = attr.slug;
                let val = (initialData as any)?.[slug];
                if ((val === undefined || val === null) && initialData?.attributeFilters) {
                  val = initialData.attributeFilters[slug];
                }
                if (val === undefined || val === null) {
                  val = (initialData as any)?.[`${slug}Id`];
                }
                initial[slug] = val || '';
              });
            });

            setFormData(initial);
          }
        } catch (error) {
          console.error('Failed to load alert form schema:', error);
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
  }, [open, selectedTypeId, initialData, isArabic, toast]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === 'governorate') {
        newData.city = '';
      }

      if (schema) {
        schema.sections.forEach((section) => {
          section.attributes.forEach((attr) => {
            if (attr.dependsOnAttributeId) {
              const parentAttr = schema.sections
                .flatMap((s) => s.attributes)
                .find((a) => a.id === attr.dependsOnAttributeId);
              if (parentAttr && parentAttr.slug === name) {
                newData[attr.slug] = '';
              }
            }
          });
        });
      }

      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formData.minPrice &&
      formData.maxPrice &&
      Number(formData.minPrice) > Number(formData.maxPrice)
    ) {
      toast({
        title: isArabic ? 'خطأ في النطاق' : 'Range Error',
        description: tModal('priceRangeError'),
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload: any = {
        listingTypeId: selectedTypeId,
        minPrice: formData.minPrice ? Number(formData.minPrice) : null,
        maxPrice: formData.maxPrice ? Number(formData.maxPrice) : null,
        governorate: formData.governorate || null,
        city: formData.city || null,
        attributeFilters: {},
      };

      if (schema) {
        schema.sections.forEach((section) => {
          section.attributes.forEach((attr) => {
            const value = formData[attr.slug];
            if (value !== undefined && value !== null && value !== '') {
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

      let res;
      if (isEditMode && alertId) {
        res = await updateAlertMutation.mutateAsync({ id: alertId, dto: payload });
      } else {
        res = await createAlertMutation.mutateAsync(payload);
      }

      if (res.success) {
        toast({
          title: isEditMode ? tModal('alertUpdated') : tModal('alertCreated'),
          description: isEditMode ? tModal('changesSaved') : tModal('willNotify'),
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          title: isEditMode ? tModal('updateError') : tModal('creationError'),
          description: res.message || tModal('unexpectedError'),
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: isArabic ? 'خطأ' : 'Error',
        description: tModal('unexpectedError'),
        variant: 'destructive',
      });
    }
  };

  const cityOptions = useMemo(() => {
    return formData.governorate ? getCityOptions(formData.governorate, isArabic) : [];
  }, [formData.governorate, isArabic]);

  // Generic fetch for ServerSelect
  const fetchRefItems = useCallback(
    async (groupId: number, parentId?: number, params?: any) => {
      const controller = getInjection('IListingTypeRefsRepoController');
      const sTerm = params?.searchTerm?.trim();
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 30;

      const res = await controller.getItemsByGroupId(
        groupId,
        parentId,
        pageSize,
        sTerm || undefined,
        page,
      );

      let rawItems = (res.success && res.data?.data) ? [...res.data.data] : [];

      if (sTerm && sTerm.length >= 2 && rawItems.length === 0 && page === 1) {
        try {
          const fuzzyRes = await searchFuzzyReferenceItems(groupId, {
            searchTerm: sTerm,
            parentItemId: parentId,
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
        setRefItemsMap((prev) => {
          const next = { ...prev };
          rawItems.forEach((item: any) => {
            if (item?.id) next[String(item.id)] = item;
          });
          return next;
        });
      }

      return {
        ...res,
        data: {
          currentPage: page,
          totalPages: res.data?.totalPages || 1,
          pageSize,
          totalItems: res.data?.totalItems || rawItems.length,
          hasNextPage: !!res.data?.hasNextPage,
          hasPreviousPage: !!res.data?.hasPreviousPage,
          data: rawItems.map((item: any) => ({
            ...item,
            name: getTranslation(item.translations) || getTranslation(item.name) || item.name || item.label || '',
          })),
        },
      };
    },
    [getTranslation, locale],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#198341] to-[#ABDE3B] text-white flex items-center justify-center shadow-md shadow-[#198341]/20">
              <Bell size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-[#2C3C39] dark:text-zinc-100">
                {isEditMode ? tModal('editAlert') : tModal('notifyMe')}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {isEditMode ? tModal('updateCriteria') : tModal('beFirst')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Listing Type Switcher (only in Create Mode) */}
          {!isEditMode && listingTypes.length > 1 && (
            <div className="space-y-2">
              <Label className="text-xs font-bold text-gray-600 dark:text-zinc-300 flex items-center gap-1.5">
                <Layers size={14} className="text-[#198341]" />
                <span>{isArabic ? 'نوع الإعلان' : 'Listing Category'}</span>
              </Label>
              <Select
                value={String(selectedTypeId)}
                onValueChange={(val) => setSelectedTypeId(Number(val))}
              >
                <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-zinc-900">
                  {listingTypes.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Loading Schema Skeleton */}
          {isLoadingSchema && (
            <div className="flex items-center justify-center py-8 gap-2 text-sm text-gray-400">
              <Loader2 size={18} className="animate-spin text-[#198341]" />
              <span>{tModal('loading')}</span>
            </div>
          )}

          {/* Dynamic Attribute Fields */}
          {!isLoadingSchema &&
            schema?.sections?.map((section) => (
              <div key={section.id} className="space-y-4">
                {section.attributes.map((attr) => {
                  const isTrim = isTrimAttribute(attr);
                  if (isTrim && !attr.isRequired && !(attr as any).required) {
                    const allAttrs = schema.sections.flatMap((s) => s.attributes) || [];
                    const makeAttr = allAttrs.find((a) => isMakeAttribute(a));
                    const modelAttr = allAttrs.find((a) => isModelAttribute(a));
                    const selectedMakeId = makeAttr ? formData[makeAttr.slug] : null;
                    const selectedModelId = modelAttr ? formData[modelAttr.slug] : null;

                    const selectedMakeItem = selectedMakeId ? refItemsMap[String(selectedMakeId)] : null;
                    const selectedModelItem = selectedModelId ? refItemsMap[String(selectedModelId)] : null;

                    const trimReqOnModel = extractIsTrimRequired(selectedModelItem);
                    const trimReqOnMake = extractIsTrimRequired(selectedMakeItem);

                    const isTrimReq = trimReqOnModel ?? trimReqOnMake ?? false;
                    if (!isTrimReq) {
                      return null;
                    }
                  }

                  const type = attr.type.toLowerCase();
                  const attrName = getTranslation(attr.translations) || attr.name;
                  const isRequired = attr.isRequired;

                  let parentVal: any = undefined;
                  if (attr.dependsOnAttributeId) {
                    const parentAttr = schema.sections
                      .flatMap((s) => s.attributes)
                      .find((a) => a.id === attr.dependsOnAttributeId);
                    if (parentAttr) {
                      parentVal = formData[parentAttr.slug];
                    }
                  }

                  const isDisabled = attr.dependsOnAttributeId ? !parentVal : false;

                  if (type === 'reference' && attr.referenceGroupId) {
                    return (
                      <div key={attr.id} className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                          {attrName} {isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <ServerSelect
                          value={formData[attr.slug] || ''}
                          onChange={(val: any) => handleChange(attr.slug, val)}
                          labelField="name"
                          valueField="id"
                          fetchFn={(params: any) =>
                            fetchRefItems(
                              attr.referenceGroupId!,
                              parentVal ? Number(parentVal) : undefined,
                              params,
                            )
                          }
                          placeholder={`${tModal('select')} ${attrName}`}
                          disabled={isDisabled}
                          queryKey={[`alert-ref-${attr.referenceGroupId}`, String(parentVal || 'root')]}
                        />
                      </div>
                    );
                  }

                  if (type === 'select' || type === 'radio') {
                    return (
                      <div key={attr.id} className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                          {attrName} {isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <Select
                          value={formData[attr.slug] ? String(formData[attr.slug]) : undefined}
                          onValueChange={(val) => handleChange(attr.slug, val)}
                          disabled={isDisabled}
                        >
                          <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl">
                            <SelectValue placeholder={`${tModal('select')} ${attrName}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-white dark:bg-zinc-900">
                            {attr.options?.map((opt: any, idx: number) => {
                              const optVal =
                                opt.id !== undefined && opt.id !== null
                                  ? String(opt.id)
                                  : opt.value !== undefined && opt.value !== null
                                  ? String(opt.value)
                                  : typeof opt === 'string'
                                  ? opt
                                  : String(idx);
                              if (!optVal) return null;
                              return (
                                <SelectItem key={optVal} value={optVal}>
                                  {getTranslation(opt.label || opt.name || opt.value || opt)}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  }

                  if (type === 'number' || type === 'year') {
                    return (
                      <div key={attr.id} className="space-y-1.5">
                        <Label className="text-xs font-semibold text-gray-700 dark:text-zinc-300">
                          {attrName} {isRequired && <span className="text-red-500">*</span>}
                        </Label>
                        <Input
                          type="number"
                          value={formData[attr.slug] || ''}
                          onChange={(e) => handleChange(attr.slug, e.target.value)}
                          placeholder={attrName}
                          disabled={isDisabled}
                          className="bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl"
                        />
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            ))}

          {/* Price Range */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <Label className="text-xs font-bold text-gray-700 dark:text-zinc-200">
              {isArabic ? 'نطاق السعر (ل.س)' : 'Price Range (SYP)'}
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Input
                  type="number"
                  placeholder={tModal('minPriceSyp')}
                  value={formData.minPrice || ''}
                  onChange={(e) => handleChange('minPrice', e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl"
                />
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  placeholder={tModal('maxPriceSyp')}
                  value={formData.maxPrice || ''}
                  onChange={(e) => handleChange('maxPrice', e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl"
                />
              </div>
            </div>
          </div>

          {/* Location Fields (Governorate -> City) */}
          <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-zinc-800">
            <Label className="text-xs font-bold text-gray-700 dark:text-zinc-200">
              {isArabic ? 'الموقع' : 'Location'}
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">{tModal('governorate')}</Label>
                <Select
                  value={formData.governorate || 'all'}
                  onValueChange={(val) => handleChange('governorate', val === 'all' ? '' : val)}
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl">
                    <SelectValue placeholder={tModal('governorate')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 max-h-52">
                    <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                    {governorateOptions.map((gov) => (
                      <SelectItem key={gov.value} value={gov.value}>
                        {gov.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">{tModal('city')}</Label>
                <Select
                  value={formData.city || 'all'}
                  onValueChange={(val) => handleChange('city', val === 'all' ? '' : val)}
                  disabled={!formData.governorate}
                >
                  <SelectTrigger className="w-full bg-gray-50 dark:bg-zinc-800/80 border-gray-200 dark:border-zinc-700 rounded-xl">
                    <SelectValue placeholder={tModal('city')} />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-zinc-900 max-h-52">
                    <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                    {cityOptions.map((city) => (
                      <SelectItem key={city.value} value={city.value}>
                        {city.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <DialogFooter className="gap-2 pt-4 border-t border-gray-100 dark:border-zinc-800 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              {tModal('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingSchema}
              className="rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin mr-2 rtl:mr-0 rtl:ml-2" />
                  <span>{tModal('saving')}</span>
                </>
              ) : (
                <span>{isEditMode ? tModal('saveChanges') : tModal('activateAlert')}</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
