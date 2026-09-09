import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createListing, updateListing } from '@/core/infrastructure-adapters/actions/users/listing.user.actions';
import { CreateListingDto, UpdateListingDto, AttributeValue, AttributeMeta } from '@/core/entities/models/listings/create-listing.dto';
import { InstallmentPlanInputDto } from '@/core/entities/models/listings/installments.dto';
import { RentType } from '@/core/entities/enums/cars.enums';
import { normalizeGovernorate, normalizeCity, normalizeAddress } from '@/core/entities/enums/syria.enums';
import {
  STORAGE_KEYS,
  getAllFormData,
  clearFormData
} from './useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { useLocale, useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import { createUserAddress } from '@/core/infrastructure-adapters/actions/users/saved-address.actions';

// Format error message for display
const formatErrorMessage = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.status && error.path) {
    return `Error ${error.status}: ${error.message || 'An error occurred'} (${error.path})`;
  }
  return JSON.stringify(error, null, 2);
};

// Determine the correct value key and value to use for an attribute
const buildAttributeValue = (
  attrId: number,
  attrType: string,
  rawValue: any,
  slug?: string,
): AttributeValue | null => {
  // Skip empty/null values
  if (rawValue === undefined || rawValue === null || rawValue === '') return null;

  const base: AttributeValue = { attributeId: attrId };

  const type = (attrType || '').toLowerCase();
  const slugLower = (slug || '').toLowerCase();

  // Repeating groups / arrays → valueJson
  if (type === 'repeating_group' || Array.isArray(rawValue)) {
    if (Array.isArray(rawValue) && rawValue.length === 0) return null;
    return { ...base, valueJson: rawValue };
  }

  // Reference (foreign key IDs) → referenceItemId
  if (type === 'reference') {
    const num = Number(rawValue);
    if (!isNaN(num)) return { ...base, referenceItemId: num };
    return null;
  }

  // Booleans → valueBoolean
  if (type === 'boolean' || type === 'checkbox') {
    return { ...base, valueBoolean: Boolean(rawValue) };
  }

  // Known numeric slugs or numeric attribute types (doors, cylinders, seats, mileage, etc.)
  const isNumericSlug =
    slugLower === 'doors' ||
    slugLower === 'cylinders' ||
    slugLower === 'seats' ||
    slugLower === 'gears' ||
    slugLower === 'mileage' ||
    slugLower === 'engine_capacity' ||
    slugLower === 'horsepower' ||
    slugLower === 'year' ||
    slugLower.includes('door') ||
    slugLower.includes('cylinder') ||
    slugLower.includes('seat');

  const isNumericType =
    type === 'number' ||
    type === 'integer' ||
    type === 'float' ||
    type === 'decimal' ||
    type === 'numeric' ||
    type === 'year';

  if (isNumericType || isNumericSlug) {
    const num = Number(rawValue);
    if (!isNaN(num)) {
      return { ...base, valueNumber: num };
    }
  }

  // Default: text
  return { ...base, valueText: String(rawValue) };
};

export const useSubmitForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const locale = useLocale();
  const tListing = useTranslations('listing');

  // Determine if we're in edit mode on mount
  useEffect(() => {
    const editModeId = localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
    setIsEditMode(!!editModeId);
  }, []);

  const handleTryAgain = useCallback(() => {
    setShowErrorDialog(false);
    setErrorMessage('');
  }, []);

  const submitForm = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // Check if we're in edit mode
      const carIdToEdit = localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
      const isEditMode = !!carIdToEdit;

      // Get all form data with awareness of edit mode
      const formData = getAllFormData(isEditMode);

      if (!formData) {
        const errorMsg = 'Missing required data in localStorage';
        setErrorMessage(errorMsg);
        setIsSubmitting(false);
        return null;
      }

      const { stepOne: storedData1, stepTwo: storedData2, stepThree: storedData3, stepFour: storedData4 } = formData;

      // ─────────────────────────────────────────────────────────────────────
      // 1. listingTypeId — from stepOne (the full ListingTypeDto object)
      // ─────────────────────────────────────────────────────────────────────
      const listingTypeId: number = storedData1?.id || storedData1?.listingTypeId;

      // ─────────────────────────────────────────────────────────────────────
      // 2. top-level fields — from stepFour
      // ─────────────────────────────────────────────────────────────────────
      const listingOfferType: string = storedData4?.listingType || 'for_sale';
      const rentType: RentType | null = listingOfferType === 'for_rent' ? (storedData4?.rentType || null) : null;
      const price = storedData4?.price ? Number(storedData4.price) : null;
      const currency: string = storedData4?.currency || 'USD';
      const contactNumber: string | null = storedData4?.contactNumber || null;
      const publicationStatus: string = storedData4?.saveStatus === 'published' ? 'published' : 'draft';
      const publishedAt: string | null = storedData4?.publishedAt || storedData4?.publicationDate || null;

      const isInstallmentsPolicyEnabled = storedData1?.installmentsEnabled !== false;
      const installmentsAvailable: boolean = (listingOfferType === 'for_sale' && isInstallmentsPolicyEnabled) ? Boolean(storedData4?.installmentsAvailable) : false;
      let installmentPlans: InstallmentPlanInputDto[] | undefined = undefined;

      if (listingOfferType === 'for_sale' && installmentsAvailable && Array.isArray(storedData4?.installmentPlans) && storedData4.installmentPlans.length > 0) {
        installmentPlans = storedData4.installmentPlans.map((p: any) => ({
          months: Number(p.months),
          downPayment: Number(p.downPayment || 0),
          monthlyAmount: Number(p.monthlyAmount || 0),
          noteTranslations: p.noteTranslations || (p.note ? { en: p.note, ar: p.note } : undefined),
        }));
      } else if (isEditMode) {
        installmentPlans = [];
      }

      // ─────────────────────────────────────────────────────────────────────
      // 3. location — location fields are in stepTwo as virtual fields
      //    (governorate, city, address are injected with negative IDs so they
      //     won't appear in __attributeMap__, we handle them separately)
      // ─────────────────────────────────────────────────────────────────────
      const rawGov = storedData4?.governorate || storedData2?.governorate;
      const rawCity = storedData4?.city || storedData2?.city;
      const rawAddress = storedData4?.address || storedData2?.address;
      const governorate: string | null = normalizeGovernorate(rawGov) || rawGov || null;
      const city: string | null = normalizeCity(rawCity, governorate || undefined) || rawCity || null;
      const address: string | null = normalizeAddress(rawAddress) || rawAddress || null;
      const latitude: number | null = storedData4?.latitude != null && !isNaN(Number(storedData4.latitude))
        ? Number(storedData4.latitude)
        : (storedData2?.latitude != null && !isNaN(Number(storedData2.latitude)) ? Number(storedData2.latitude) : null);
      const longitude: number | null = storedData4?.longitude != null && !isNaN(Number(storedData4.longitude))
        ? Number(storedData4.longitude)
        : (storedData2?.longitude != null && !isNaN(Number(storedData2.longitude)) ? Number(storedData2.longitude) : null);
      const saveAsSavedAddress = Boolean(storedData4?.saveAsSavedAddress);
      const savedAddressLabel = storedData4?.savedAddressLabel;

      // ─────────────────────────────────────────────────────────────────────
      // 4. translations — title & description from stepFour
      // ─────────────────────────────────────────────────────────────────────
      const title: string = storedData4?.title || '';
      const description: string = storedData4?.description || '';
      const story: string | null = storedData4?.story || null;

      // Build bilingual translations — use the same text for both if single-language
      const translations = {
        en: { title, description, story },
        ar: { title, description, story },
      };

      // ─────────────────────────────────────────────────────────────────────
      // 5. attributeValues — from stepTwo dynamic fields via __attributeMap__
      // ─────────────────────────────────────────────────────────────────────
      const attributeMap: Record<string, AttributeMeta> = storedData2?.__attributeMap__ || {};
      const proposals: Record<number, { name: string; status: 'pending' }> = storedData2?.__proposals__ || {};
      const attributeValues: AttributeValue[] = [];

      // Virtual/injected location slugs that we handle as top-level fields
      const LOCATION_SLUGS = new Set(['governorate', 'city', 'address']);

      for (const [slug, meta] of Object.entries(attributeMap)) {
        if (LOCATION_SLUGS.has(slug)) continue; // Already handled as top-level
        if (!meta?.id || meta.id <= 0) continue; // Skip invalid/virtual attrs

        const pendingProposal = proposals[meta.id] || (proposals as any)?.[String(meta.id)];
        if (pendingProposal && typeof pendingProposal.name === 'string' && pendingProposal.name.trim() !== '') {
          // Mutually exclusive: when proposing, send ONLY proposedReferenceName without referenceItemId or valueText
          attributeValues.push({
            attributeId: meta.id,
            proposedReferenceName: pendingProposal.name.trim(),
          });
        } else {
          const rawValue = storedData2?.[slug];
          const attrValue = buildAttributeValue(meta.id, meta.type, rawValue, slug);
          if (attrValue) {
            attributeValues.push(attrValue);
          }
        }
      }

      console.log("[useSubmitForm] proposals in STEP_TWO:", proposals);
      console.log("[useSubmitForm] generated attributeValues:", attributeValues);

      const bodyHasReferenceProposal = attributeValues.some(av => !!av.proposedReferenceName);

      // ─────────────────────────────────────────────────────────────────────
      // 6. images — from stepThree
      // ─────────────────────────────────────────────────────────────────────
      const images: string[] = [];
      if (storedData3?.coverImage && Array.isArray(storedData3.coverImage)) {
        images.push(...storedData3.coverImage);
      }

      let response;

      if (isEditMode && carIdToEdit) {
        const updateDto: UpdateListingDto = {
          listingTypeId,
          listingOfferType,
          rentType: rentType || undefined,
          price,
          currency,
          governorate,
          city,
          address,
          latitude,
          longitude,
          contactNumber,
          publicationStatus,
          publishedAt,
          translations,
          attributeValues,
          images,
          installmentsAvailable,
          installmentPlans,
        };
        response = await updateListing(Number(carIdToEdit), updateDto);
      } else {
        const createDto: CreateListingDto = {
          listingTypeId,
          listingOfferType,
          rentType: rentType || undefined,
          price,
          currency,
          governorate,
          city,
          address,
          latitude,
          longitude,
          contactNumber,
          publicationStatus,
          publishedAt,
          translations,
          attributeValues,
          images,
          installmentsAvailable,
          installmentPlans,
        };
        console.log("createDto", createDto);
        response = await createListing(createDto);
      }

      if (response.success) {
        // If "Save this address for next time" was selected, save in both create and edit modes
        if (saveAsSavedAddress && (governorate || city || address)) {
          const fallbackLabel =
            address?.trim() ||
            [governorate, city].filter(Boolean).join(' - ') ||
            (locale === 'ar' ? 'عنوان محفوظ' : 'Saved Address');
          const finalLabel = (savedAddressLabel?.trim() || fallbackLabel).slice(0, 100);

          try {
            const addrRes = await createUserAddress({
              label: finalLabel,
              governorate: governorate || undefined,
              city: city || undefined,
              address: address ? address.slice(0, 500) : undefined,
              latitude: latitude != null && !isNaN(latitude) ? latitude : undefined,
              longitude: longitude != null && !isNaN(longitude) ? longitude : undefined,
            });

            if (addrRes?.success) {
              await queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
            } else {
              console.error('[useSubmitForm] createUserAddress failed:', addrRes);
              toast({
                variant: 'destructive',
                title: tListing('wizard.saved_address.save_failed_toast'),
                description: addrRes?.message,
              });
            }
          } catch (addrErr) {
            console.error('[useSubmitForm] createUserAddress exception:', addrErr);
            toast({
              variant: 'destructive',
              title: tListing('wizard.saved_address.save_failed_toast'),
            });
          }
        }

        toast({
          title: locale === 'en' ? '🚗 Success!' : '🚗 تم بنجاح',
          description: locale === 'en'
            ? (isEditMode ? 'Your listing has been updated!' : 'Your listing has been created!')
            : (isEditMode ? 'تم تحديث الإعلان بنجاح!' : 'تم إنشاء الإعلان بنجاح!'),
          className: 'bg-green-600 text-white w-[330px] border-green-700 fixed bottom-4 right-4 z-[999]',
        });

        clearFormData(true);
        router.push('/userProfile/Products');
        setTimeout(() => router.refresh(), 100);
        return response;
      } else {
        let finalError = formatErrorMessage(response);
        if (response?.status === 422 && bodyHasReferenceProposal) {
          finalError = tListing('errors.reference_proposal_generic');
        }
        setErrorMessage(finalError);
        setShowErrorDialog(true);
        toast({
          variant: 'destructive',
          title: locale === 'en' ? 'Error' : 'خطأ',
          description: finalError,
        });
        console.error('[useSubmitForm] Error response:', response);
        return null;
      }
    } catch (error: any) {
      console.error('[useSubmitForm] Exception:', error);
      let finalError = formatErrorMessage(error);
      if (error?.status === 422) {
        finalError = tListing('errors.reference_proposal_generic');
      }
      setErrorMessage(finalError);
      setShowErrorDialog(true);
      toast({
        variant: 'destructive',
        title: locale === 'en' ? 'Error' : 'خطأ',
        description: finalError,
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [router, toast, locale, tListing, queryClient]);

  return {
    isSubmitting,
    showErrorDialog,
    errorMessage,
    handleTryAgain,
    setShowErrorDialog,
    submitForm,
    isEditMode,
  };
};