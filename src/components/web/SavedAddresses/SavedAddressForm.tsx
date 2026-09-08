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
  SyriaCity,
  SyriaCity_ARABIC_NAMES,
  SyriaGovernorate_TO_CITIES,
} from '@/core/entities/enums/syria.enums';
import { cn } from '@/lib/utils';

interface SavedAddressFormProps {
  addressId?: number;
}

export const SavedAddressForm: React.FC<SavedAddressFormProps> = ({ addressId }) => {
  const router = useRouter();
  const locale = useLocale();
  const direction = useDirection();
  const t = useTranslations();
  const { toast } = useToast();

  const isEdit = Boolean(addressId);

  // Queries & mutations
  const { data: addressesResponse, isLoading: isLoadingList } = useSavedAddresses();
  const createMutation = useCreateSavedAddress();
  const updateMutation = useUpdateSavedAddress();
  const deleteMutation = useDeleteSavedAddress();

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [rootError, setRootError] = useState<string | null>(null);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Map references
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
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

  // Find address from cache once
  useEffect(() => {
    if (isEdit && !hasInitializedRef.current && addressesResponse?.data) {
      const address = addressesResponse.data.find((a) => a.id === addressId);
      if (address) {
        hasInitializedRef.current = true;
        // Legacy repair: if lat exists, repair detectedGovernorate
        const detected = address.latitude != null ? address.governorate : null;

        form.reset({
          label: address.label || '',
          governorate: address.governorate || '',
          city: address.city || '',
          address: address.address || '',
          latitude: address.latitude,
          longitude: address.longitude,
          detectedGovernorate: detected,
        });

        if (mapInstanceRef.current && address.latitude && address.longitude) {
          mapInstanceRef.current.setView([address.latitude, address.longitude], 14);
          if (markerInstanceRef.current) {
            markerInstanceRef.current.setLatLng([address.latitude, address.longitude]);
          }
        }
      } else if (!isLoadingList) {
        setNotFound(true);
      }
    }
  }, [isEdit, addressId, addressesResponse, isLoadingList, form]);

  // Leaflet map setup
  useEffect(() => {
    let isMounted = true;

    const initMap = async () => {
      if (typeof window === 'undefined' || !mapContainerRef.current || mapInstanceRef.current) {
        return;
      }

      // Dynamically import Leaflet
      const L = await import('leaflet');
      // Import leaflet CSS
      if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!isMounted || !mapContainerRef.current) return;

      const initialLat = form.getValues('latitude') || 33.5138;
      const initialLng = form.getValues('longitude') || 36.2765;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: form.getValues('latitude') ? 14 : 11,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Custom marker icon fix for Leaflet
      const defaultIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([initialLat, initialLng], {
        draggable: true,
        icon: defaultIcon,
      }).addTo(map);

      mapInstanceRef.current = map;
      markerInstanceRef.current = marker;

      // Handle map clicks
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        handleCoordsChange(lat, lng);
      });

      // Handle marker drag
      marker.on('dragend', () => {
        const { lat, lng } = marker.getLatLng();
        handleCoordsChange(lat, lng);
      });
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Reverse geocode coords to resolve governorate & city
  const handleCoordsChange = async (lat: number, lng: number) => {
    form.setValue('latitude', lat, { shouldValidate: true, shouldDirty: true });
    form.setValue('longitude', lng, { shouldValidate: true, shouldDirty: true });

    setIsGeocoding(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=ar`
      );
      const data = await res.json();

      if (data) {
        const displayName = data.display_name || '';
        const addressObj = data.address || {};
        const fullText = [
          displayName,
          ...Object.values(addressObj).map((v) => String(v)),
        ].join(' ');

        // Match Governorate
        let matchedGov: string | null = null;
        for (const [govKey, govArabic] of Object.entries(SyriaGovernorate_ARABIC_NAMES)) {
          if (fullText.includes(govArabic)) {
            matchedGov = govKey;
            break;
          }
        }

        // Match City
        let matchedCity: string | null = null;
        for (const [cityKey, cityArabic] of Object.entries(SyriaCity_ARABIC_NAMES)) {
          if (fullText.includes(cityArabic)) {
            matchedCity = cityKey;
            break;
          }
        }

        if (matchedGov) {
          form.setValue('detectedGovernorate', matchedGov);
          form.setValue('governorate', matchedGov, {
            shouldValidate: true,
            shouldDirty: true,
          });
        } else {
          form.setValue('detectedGovernorate', null);
        }

        if (matchedCity) {
          form.setValue('city', matchedCity, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }

        if (displayName && !form.getValues('address')) {
          form.setValue('address', displayName, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      }
    } catch {
      form.setValue('detectedGovernorate', null);
    } finally {
      setIsGeocoding(false);
      form.trigger(['governorate', 'city']);
    }
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
          // Bidi isolation for label
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
              {isGeocoding && (
                <span className="text-xs text-primary flex items-center gap-1.5 font-medium animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{direction === 'rtl' ? 'جارٍ تحديد المحافظة...' : 'Detecting area...'}</span>
                </span>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-sm">
              <div
                ref={mapContainerRef}
                className="w-full h-64 bg-slate-100 dark:bg-zinc-900 z-0"
              />
              <div className="absolute bottom-2 end-2 z-10 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-slate-200/60 dark:border-zinc-800 text-[11px] font-medium text-slate-600 dark:text-zinc-300 shadow-sm flex items-center gap-1.5 pointer-events-none">
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
          </div>

          {/* 2. Governorate and City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Governorate Field */}
            <FormField
              control={form.control}
              name="governorate"
              render={({ field }) => (
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
                          mapContainerRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                          });
                        }}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {t('savedAddresses.form.governorate_change_on_map')}
                      </button>
                    )}
                  </div>
                  <Select
                    disabled={isGovLocked}
                    onValueChange={(val) => {
                      field.onChange(val);
                      form.setValue('city', '');
                    }}
                    value={field.value || ''}
                    dir={direction}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 disabled:opacity-85 disabled:bg-slate-50 dark:disabled:bg-zinc-800/60">
                        <SelectValue
                          placeholder={t('savedAddresses.form.governorate_required')}
                        />
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
              )}
            />

            {/* City Field */}
            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-slate-700 dark:text-zinc-200 text-sm">
                    {t('savedAddresses.form.city')}
                    <span className="text-rose-500 ms-1">*</span>
                  </FormLabel>
                  <Select
                    disabled={!selectedGov || cityOptions.length === 0}
                    onValueChange={field.onChange}
                    value={field.value || ''}
                    dir={direction}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800">
                        <SelectValue
                          placeholder={t('savedAddresses.form.city_required')}
                        />
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
              )}
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
