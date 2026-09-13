'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocale, useTranslations } from 'next-intl';
import {
  MapPin,
  Trash2,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Navigation,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useToast } from '@/hooks/use-toast';
import { useDirection } from '@/hooks/use-direction';
import {
  UserAddress,
  SavedAddressFormSchema,
  SavedAddressFormData,
} from '@/core/entities/models/users/saved-address.dto';
import {
  useSavedAddresses,
  useCreateSavedAddress,
  useUpdateSavedAddress,
  useDeleteSavedAddress,
} from '@/core/infrastructure-adapters/use-actions/users/saved-address.use-actions';
import {
  SyriaGovernorate,
  SyriaGovernorate_ARABIC_NAMES,
  SyriaCity_ARABIC_NAMES,
  SyriaGovernorate_TO_CITIES,
  normalizeGovernorate,
  normalizeCity,
  normalizeAddress,
} from '@/core/entities/enums/syria.enums';
import { matchGovernorate, resolveCityValue } from '@/utils/geocodeToSyria';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';
import type { LocationPickerResult } from '@/components/web/Map/GoogleMapPicker';
import { reverseGeocode } from '@/utils/reverseGeocode';
import { useSettings } from '@/providers/settings.provider';

const GoogleMapPicker = dynamic(() => import('@/components/web/Map/GoogleMapPicker'), {
  ssr: false,
  loading: () => (
    <div className="w-full bg-slate-100 dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center" style={{ height: '420px' }}>
      <Loader2 className="w-6 h-6 animate-spin text-primary" />
    </div>
  ),
});

interface SavedAddressFormProps {
  addressId?: number;
}

export const SavedAddressForm: React.FC<SavedAddressFormProps> = ({ addressId }) => {
  const router = useRouter();
  const locale = useLocale();
  const direction = useDirection();
  const t = useTranslations();
  const { toast } = useToast();
  const { getGoogleMapsApiKey, getGoogleGeocodingApiKey } = useSettings();
  const googleMapsApiKey = getGoogleGeocodingApiKey() || getGoogleMapsApiKey();

  const isEdit = Boolean(addressId);

  // Queries & mutations
  const { data: addressesResponse, isLoading: isLoadingList } = useSavedAddresses();
  const createMutation = useCreateSavedAddress();
  const updateMutation = useUpdateSavedAddress();
  const deleteMutation = useDeleteSavedAddress();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Track initial map coordinates to pass to GoogleMapPicker
  const [mapInitLat, setMapInitLat] = useState<number | null>(null);
  const [mapInitLng, setMapInitLng] = useState<number | null>(null);

  const hasInitializedRef = useRef(false);

  const form = useForm<SavedAddressFormData>({
    resolver: zodResolver(SavedAddressFormSchema),
    defaultValues: {
      label: '',
      governorate: '',
      city: '',
      address: '',
      latitude: null,
      longitude: null,
      detectedGovernorate: null,
    },
  });

  const currentLat = form.watch('latitude');
  const currentLng = form.watch('longitude');
  const selectedGov = form.watch('governorate');
  const detectedGov = form.watch('detectedGovernorate');

  // Load existing address data in edit mode
  useEffect(() => {
    if (isEdit && !hasInitializedRef.current && addressesResponse?.data) {
      const address = addressesResponse.data.find((a) => a.id === addressId);
      if (address) {
        hasInitializedRef.current = true;
        const normGov = normalizeGovernorate(address.governorate) || matchGovernorate(address.governorate) || address.governorate || '';
        const normCity = resolveCityValue(address.city, normGov, address.latitude, address.longitude);
        const normAddress = normalizeAddress(address.address);
        const detected = address.latitude != null ? normGov : null;

        form.reset({
          label: address.label || '',
          governorate: normGov,
          city: normCity,
          address: normAddress,
          latitude: address.latitude,
          longitude: address.longitude,
          detectedGovernorate: detected,
        });

        if (address.latitude && address.longitude) {
          setMapInitLat(address.latitude);
          setMapInitLng(address.longitude);
        }
      } else if (!isLoadingList) {
        setNotFound(true);
      }
    }
  }, [isEdit, addressId, addressesResponse, isLoadingList, form]);

  // Handle confirmed location from the GoogleMapPicker (called after user reviews and confirms)
  const handleLocationConfirm = (result: LocationPickerResult) => {
    form.setValue('latitude', result.latitude, { shouldValidate: true, shouldDirty: true });
    form.setValue('longitude', result.longitude, { shouldValidate: true, shouldDirty: true });

    const normGov = normalizeGovernorate(result.governorate) || matchGovernorate(result.governorate) || result.governorate || '';
    const normCity = resolveCityValue(result.city, normGov, result.latitude, result.longitude);
    const normAddress = normalizeAddress(result.address);

    if (normGov) {
      form.setValue('governorate', normGov, { shouldValidate: true, shouldDirty: true });
      form.setValue('detectedGovernorate', normGov, { shouldValidate: true, shouldDirty: true });
    } else {
      form.setValue('detectedGovernorate', null);
    }

    if (normCity) {
      form.setValue('city', normCity as string, { shouldValidate: true, shouldDirty: true });
    }

    if (normAddress && !form.getValues('address')) {
      form.setValue('address', normAddress, { shouldValidate: true, shouldDirty: true });
    }

    setTimeout(() => {
      if (normCity) {
        form.setValue('city', normCity as string, { shouldValidate: true, shouldDirty: true });
      }
      form.trigger(['governorate', 'city', 'address']);
    }, 50);
  };

  const onSubmit = async (values: SavedAddressFormData) => {
    setRootError(null);
    try {
      if (isEdit && addressId) {
        const res = await updateMutation.mutateAsync({
          id: addressId,
          dto: {
            label: values.label,
            governorate: values.governorate,
            city: values.city,
            address: values.address || undefined,
            latitude: values.latitude ?? undefined,
            longitude: values.longitude ?? undefined,
          },
        });

        if (res.success) {
          toast({
            title: locale === 'ar' ? 'تم حفظ التعديلات بنجاح' : 'Address updated successfully',
            className: 'bg-emerald-600 text-white border-emerald-700',
          });
          router.push('/userProfile/SavedAddresses');
        } else {
          setRootError(res.message || t('savedAddresses.form.save_failed_error'));
        }
      } else {
        const res = await createMutation.mutateAsync({
          label: values.label,
          governorate: values.governorate,
          city: values.city,
          address: values.address || undefined,
          latitude: values.latitude ?? undefined,
          longitude: values.longitude ?? undefined,
        });

        if (res.success) {
          toast({
            title: locale === 'ar' ? 'تمت إضافة العنوان بنجاح' : 'Address created successfully',
            className: 'bg-emerald-600 text-white border-emerald-700',
          });
          router.push('/userProfile/SavedAddresses');
        } else {
          setRootError(res.message || t('savedAddresses.form.save_failed_error'));
        }
      }
    } catch (err: any) {
      setRootError(err?.message || t('savedAddresses.form.save_failed_error'));
    }
  };

  const handleDelete = async () => {
    if (!addressId) return;
    try {
      const res = await deleteMutation.mutateAsync(addressId);
      if (res.success) {
        setIsDeleteDialogOpen(false);
        const promoted = res.data?.promotedDefault;
        if (promoted?.label) {
          const safeLabel = `\u2066${promoted.label}\u2069`;
          toast({
            title: t('savedAddresses.delete_success_promoted_toast', {
              label: safeLabel,
            }),
            className: 'bg-emerald-600 text-white border-emerald-700',
          });
        } else {
          toast({
            title: t('savedAddresses.delete_success_toast'),
            className: 'bg-emerald-600 text-white border-emerald-700',
          });
        }
        router.push('/userProfile/SavedAddresses');
      } else {
        toast({
          variant: 'destructive',
          title: t('savedAddresses.delete_failed_toast'),
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: t('savedAddresses.delete_failed_toast'),
      });
    }
  };

  const BackIcon = direction === 'rtl' ? ArrowRight : ArrowLeft;

  // Loading State in Edit Mode
  if (isEdit && !hasInitializedRef.current && isLoadingList) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {locale === 'ar' ? 'جاري تحميل العنوان...' : 'Loading address...'}
        </p>
      </div>
    );
  }

  // Not Found State
  if (isEdit && notFound) {
    return (
      <div className="max-w-2xl mx-auto p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-500">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          {t('savedAddresses.form.not_found_title')}
        </h2>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          {t('savedAddresses.form.not_found_body')}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push('/userProfile/SavedAddresses')}
          className="rounded-xl"
        >
          {direction === 'rtl' ? 'العودة للعناوين المحفوظة' : 'Back to saved addresses'}
        </Button>
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isGovLocked = Boolean(detectedGov);

  const governorateOptions = Object.values(SyriaGovernorate).map((gov) => ({
    value: gov,
    label:
      locale === 'ar'
        ? SyriaGovernorate_ARABIC_NAMES[gov]
        : gov.replace(/-/g, ' '),
  }));

  const cityList =
    selectedGov && SyriaGovernorate_TO_CITIES[selectedGov as SyriaGovernorate]
      ? SyriaGovernorate_TO_CITIES[selectedGov as SyriaGovernorate]
      : [];

  const cityOptions = cityList.map((c) => ({
    value: c,
    label:
      locale === 'ar'
        ? SyriaCity_ARABIC_NAMES[c] || c
        : c.replace(/-/g, ' '),
  }));

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push('/userProfile/SavedAddresses')}
          className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-300 transition-colors"
        >
          <BackIcon className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {isEdit
              ? t('savedAddresses.form.title_edit')
              : t('savedAddresses.form.title_add')}
          </h1>
        </div>
      </div>

      {rootError && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{rootError}</span>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {/* 1. Map Pin FIRST */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{t('savedAddresses.form.pick_on_map')}</span>
              </label>
            </div>


            {/* Google Maps / Leaflet picker */}
            <GoogleMapPicker
              key={isEdit ? `edit-${addressId}-${mapInitLat}` : 'new-address'}
              apiKey={googleMapsApiKey}
              initialLat={mapInitLat}
              initialLng={mapInitLng}
              onConfirm={handleLocationConfirm}
              locale={locale === 'ar' ? 'ar' : 'en'}
              height="420px"
            />

            {/* Coordinates badge */}
            {(currentLat || currentLng) && (
              <div className="flex justify-end">
                <div className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 text-[11px] font-medium text-slate-600 dark:text-zinc-300 shadow-sm flex items-center gap-1.5 pointer-events-none">
                  <Navigation className="w-3 h-3 text-primary" />
                  <span>
                    {currentLat && currentLng
                      ? `${currentLat.toFixed(4)}, ${currentLng.toFixed(4)}`
                      : direction === 'rtl'
                      ? 'انقر على الخريطة لتحديد الموقع'
                      : 'Click map to place pin'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Governorate and City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Governorate Field */}
            <FormField
              control={form.control}
              name="governorate"
              render={({ field }) => {
                const selectedGovOption = governorateOptions.find((opt) => opt.value === field.value);
                return (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="font-bold text-slate-700 dark:text-zinc-200 text-sm">
                        {t('savedAddresses.form.governorate')}
                        <span className="text-rose-500 ms-1">*</span>
                      </FormLabel>
                      {isGovLocked && (
                        <button
                          type="button"
                          onClick={() => {
                            // Allow changing governorate by clearing the detected lock
                            form.setValue('detectedGovernorate', null);
                          }}
                          className="text-xs font-semibold text-primary hover:underline"
                        >
                          {t('savedAddresses.form.governorate_change_on_map')}
                        </button>
                      )}
                    </div>
                    <Select
                      key={`gov-${field.value}`}
                      disabled={false}
                      onValueChange={(val) => {
                        field.onChange(val);
                        form.setValue('detectedGovernorate', val);
                        if (form.getValues('governorate') !== val) {
                          form.setValue('city', '');
                        }
                      }}
                      value={field.value || ''}
                      dir={direction}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                          <SelectValue
                            placeholder={t('savedAddresses.form.governorate_required')}
                          >
                            {selectedGovOption ? selectedGovOption.label : undefined}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir={direction} className="max-h-64">
                        {governorateOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Governorate Hint */}
                    {isGovLocked ? (
                      <FormDescription className="text-xs text-slate-500 dark:text-zinc-400">
                        {t('savedAddresses.form.governorate_pin_locked')}
                      </FormDescription>
                    ) : currentLat != null ? (
                      <FormDescription className="text-xs text-amber-600 dark:text-amber-400">
                        {t('savedAddresses.form.governorate_pin_undetected')}
                      </FormDescription>
                    ) : null}

                    <FormMessage />
                  </FormItem>
                );
              }}
            />

            {/* City Field */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => {
                const selectedCityOption = cityOptions.find((opt) => opt.value === field.value);
                return (
                  <FormItem>
                    <FormLabel className="font-bold text-slate-700 dark:text-zinc-200 text-sm">
                      {t('savedAddresses.form.city')}
                      <span className="text-rose-500 ms-1">*</span>
                    </FormLabel>
                    <Select
                      key={`city-${field.value}-${cityOptions.length}`}
                      disabled={!selectedGov || cityOptions.length === 0}
                      onValueChange={field.onChange}
                      value={field.value || ''}
                      dir={direction}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                          <SelectValue
                            placeholder={t('savedAddresses.form.city_required')}
                          >
                            {selectedCityOption ? selectedCityOption.label : undefined}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir={direction} className="max-h-64">
                        {cityOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          </div>

          {/* 3. Address Details */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700 dark:text-zinc-200 text-sm">
                  {t('savedAddresses.form.address')}
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={
                      direction === 'rtl'
                        ? 'مثال: خلف الصيدلية المركزية، بناء الأمل، الطابق 2'
                        : 'e.g. Behind central pharmacy, Building 4, 2nd floor'
                    }
                    className="min-h-[85px] rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 resize-y"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* 4. Label Field */}
          <FormField
            control={form.control}
            name="label"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-slate-700 dark:text-zinc-200 text-sm">
                  {t('savedAddresses.form.label_field')}
                  <span className="text-rose-500 ms-1">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder={t('savedAddresses.form.label_placeholder')}
                    className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Save Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>{t('savedAddresses.form.save_button')}</span>
            </Button>
          </div>
        </form>
      </Form>

      {/* Edit Mode Only: Destructive Delete Card */}
      {isEdit && (
        <div className="mt-10 p-5 rounded-2xl border border-rose-100 dark:border-rose-950/40 bg-rose-50/40 dark:bg-rose-950/10 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {t('savedAddresses.form.delete_button')}
              </h4>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                {t('savedAddresses.form.delete_note')}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="rounded-xl flex-shrink-0"
          >
            {t('savedAddresses.form.delete_button')}
          </Button>

          {/* Delete Confirmation Dialog */}
          <ConfirmationDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            title={t('savedAddresses.delete_confirm_title')}
            description={t('savedAddresses.delete_confirm_body')}
            confirmText={t('savedAddresses.delete_confirm_button')}
            cancelText={direction === 'rtl' ? 'إلغاء' : 'Cancel'}
            variant="destructive"
            isLoading={deleteMutation.isPending}
            onConfirm={handleDelete}
          />
        </div>
      )}
    </div>
  );
};
