'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Bell, Loader2, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createCarAlert } from '@/core/infrastructure-adapters/actions/users/car-alert.user.actions';
import ServerSelect from '@/components/forms/server-select';
import { getInjection } from '@/di/container';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { useLocale, useTranslations } from 'next-intl';
import { getAlertFormSchema } from '@/core/infrastructure-adapters/actions/visitors/listing-types.actions';
import { 
  ListingTypeAlertFormSchemaDto, 
  FormAttributeDto 
} from '@/core/entities/models/listing-types/listing-types.dto';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const locale = useLocale();
  const tModal = useTranslations('carAlertModal');

  const { toast } = useToast();

  // Translation helper
  const getTranslation = useCallback((val: any) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[locale] || val['en'] || val['ar'] || JSON.stringify(val);
    }
    return String(val);
  }, [locale]);

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
            res.data.sections.forEach(section => {
              section.attributes.forEach(attr => {
                const slug = attr.slug;
                // Check if we have initial data for this slug
                let val = (initialData as any)?.[slug];
                
                // Also check in attributeFilters if initialData has it
                if ((val === undefined || val === null) && initialData?.attributeFilters) {
                   val = initialData.attributeFilters[slug];
                }

                if (val === undefined || val === null) {
                   // Try with Id suffix for references (backward compatibility)
                   val = (initialData as any)?.[`${slug}Id`];
                }
                
                initial[slug] = val || '';
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
      const newData = { ...prev, [name]: value };
      if (name === 'governorate') {
        newData.city = '';
      }
      
      // Handle dependent fields in schema
      if (schema) {
        schema.sections.forEach(section => {
          section.attributes.forEach(attr => {
            if (attr.dependsOnAttributeId) {
              const parentAttr = schema.sections
                .flatMap(s => s.attributes)
                .find(a => a.id === attr.dependsOnAttributeId);
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
        schema.sections.forEach(section => {
          section.attributes.forEach(attr => {
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
          title: t('allCars.alertCreated'),
          description: t('allCars.alertCreatedDesc'),
        });
        onOpenChange(false);
      } else {
        toast({
          title: t('allCars.alertFailed'),
          description: res.message || t('allCars.alertFailedDesc'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: t('allCars.alertError'),
        description: t('allCars.alertErrorDesc'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cityOptions = useMemo(() => {
    return formData.governorate ? getCityOptions(formData.governorate) : [];
  }, [formData.governorate, getCityOptions]);

  // Generic fetch for ServerSelect
  const fetchRefItems = useCallback(async (groupId: number, parentId?: number, params?: any) => {
    const controller = getInjection('IListingTypeRefsRepoController');
    const res = await controller.getItemsByGroupId(groupId, parentId, params?.pageSize || 100);
    if (res.success && res.data) {
      // Translate names for UI
      res.data.data = res.data.data.map((item: any) => ({
        ...item,
        name: getTranslation(item.name)
      }));
    }
    return res;
  }, [getTranslation]);

  const renderAttribute = (attr: FormAttributeDto) => {
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

    if (type === 'reference') {
      const parentAttr = attr.dependsOnAttributeId 
        ? schema?.sections.flatMap(s => s.attributes).find(a => a.id === attr.dependsOnAttributeId)
        : null;
      const parentValue = parentAttr ? formData[parentAttr.slug] : undefined;

      return (
        <div key={attr.id} className="space-y-1">
          {labelElement}
          <ServerSelect<ListingTypeRefItemDto, 'id'>
            queryKey={[`ref-group-${attr.referenceGroupId}`, parentValue]}
            fetchFn={(params) => fetchRefItems(attr.referenceGroupId!, parentValue ? Number(parentValue) : undefined, params)}
            labelField="name"
            valueField="id"
            placeholder={isArabic ? `اختر ${label}` : `Select ${label}`}
            value={formData[attr.slug] ? Number(formData[attr.slug]) : undefined}
            onChange={(val) => handleChange(attr.slug, val)}
            disabled={!!attr.dependsOnAttributeId && !parentValue}
            className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg"
          />
        </div>
      );
    }

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
          <Select
            value={formData[attr.slug]?.toString() || ''}
            onValueChange={(val) => handleChange(attr.slug, val)}
          >
            <SelectTrigger className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg">
              <SelectValue placeholder={isArabic ? `اختر ${label}` : `Select ${label}`} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-100">
              {yearOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

    if (type === 'select' || type === 'dropdown' || type === 'color_selection' || type === 'color_multi_selection') {
      const options = Array.isArray(attr.options) ? attr.options : [];
      return (
        <div key={attr.id} className="space-y-1">
          {labelElement}
          <Select
            value={formData[attr.slug]?.toString() || ''}
            onValueChange={(val) => handleChange(attr.slug, val)}
          >
            <SelectTrigger className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg">
              <SelectValue placeholder={isArabic ? `اختر ${label}` : `Select ${label}`} />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-100">
              {options.map((opt: any) => (
                <SelectItem key={opt.id || opt.value || opt} value={(opt.id || opt.value || opt).toString()}>
                  {getTranslation(opt.label || opt.name || opt)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl border-none shadow-2xl">
        <div className="relative bg-primary dark:bg-gradient-to-r dark:from-[#198341] dark:to-[#ABDE3B] px-8 py-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="relative flex items-center gap-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 dark:bg-zinc-950/20 backdrop-blur-md border border-white/30 dark:border-zinc-950/30">
              <Bell className="h-8 w-8 text-white dark:text-zinc-950" />
            </div>
            <div className='flex flex-col items-start'>
              <DialogTitle className="text-3xl font-bold text-white dark:text-zinc-950 m-0 mb-1">
                {initialData?.id ? tModal('editAlert') : tModal('notifyMe')}
              </DialogTitle>
              <p className="text-sm text-white/95 dark:text-zinc-900">
                {initialData?.id ? tModal('updateCriteria') : tModal('beFirst')}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="px-8 py-8 max-h-[60vh] overflow-y-auto space-y-8 scrollbar-hide">
            {isLoadingSchema ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <Loader2 className="h-10 w-10 text-primary dark:text-[#ABDE3B] animate-spin" />
                <p className="text-slate-500 dark:text-zinc-400 font-medium animate-pulse">
                  {isArabic ? 'جاري تحميل الخيارات...' : 'Loading options...'}
                </p>
              </div>
            ) : (
              <>
                {/* Dynamic Attributes from Schema */}
                {schema?.sections.map((section) => (
                  <div key={section.id} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-[#ABDE3B]" />
                      <h3 className="text-sm font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                        {getTranslation(section.name)}
                      </h3>
                      <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                      {section.attributes.sort((a, b) => a.order - b.order).map(renderAttribute)}
                    </div>
                  </div>
                ))}

                {/* Fixed Location Fields (Requested to be preserved) */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-[#ABDE3B]" />
                    <h3 className="text-sm font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                      {isArabic ? 'الموقع' : 'Location'}
                    </h3>
                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        {isArabic ? 'المحافظة' : 'Governorate'}
                      </Label>
                      <Select
                        value={formData.governorate}
                        onValueChange={(val) => handleChange('governorate', val)}
                      >
                        <SelectTrigger className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg">
                          <SelectValue
                            placeholder={isArabic ? 'اختر محافظة' : 'Select Governorate'}
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-100">
                          {governorateOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                        {isArabic ? 'المدينة' : 'City'}
                      </Label>
                      <Select
                        value={formData.city}
                        onValueChange={(val) => handleChange('city', val)}
                        disabled={!formData.governorate}
                      >
                        <SelectTrigger className="h-10 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 focus:ring-primary/20 dark:focus:ring-[#ABDE3B]/20 rounded-lg">
                          <SelectValue
                            placeholder={
                              !formData.governorate
                                ? isArabic
                                  ? 'اختر المحافظة أولاً'
                                  : 'Select Governorate first'
                                : isArabic
                                  ? 'اختر مدينة'
                                  : 'Select City'
                            }
                          />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 text-slate-800 dark:text-zinc-100">
                          {cityOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Price Range Fields */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary dark:bg-[#ABDE3B]" />
                    <h3 className="text-sm font-bold text-slate-400 dark:text-zinc-500 tracking-wider uppercase">
                      {isArabic ? 'السعر' : 'Price'}
                    </h3>
                    <div className="h-[1px] flex-1 bg-slate-100 dark:bg-zinc-800" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
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

          <DialogFooter className="px-8 py-6 border-t border-slate-100 dark:border-zinc-800 flex-row gap-4 bg-slate-50/50 dark:bg-zinc-950/20">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-14 text-base font-semibold rounded-2xl border-2 border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all"
            >
              {tModal('cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingSchema}
              className="flex-1 h-14 text-base rounded-2xl bg-primary dark:bg-gradient-to-r dark:from-[#198341] dark:to-[#ABDE3B] hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] text-white dark:text-zinc-950 font-bold transition-all shadow-md"
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
