// hooks/useSubmitForm.ts
import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createListing, updateListing } from '@/core/infrastructure-adapters/actions/users/listing.user.actions';
import { CreateListingDto, UpdateListingDto, AttributeValue, AttributeMeta } from '@/core/entities/models/listings/create-listing.dto';
import {
  STORAGE_KEYS,
  getAllFormData,
  clearFormData
} from './useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { useLocale } from 'next-intl';

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
): AttributeValue | null => {
  // Skip empty/null values
  if (rawValue === undefined || rawValue === null || rawValue === '') return null;

  const base: AttributeValue = { attributeId: attrId };

  const type = attrType.toLowerCase();

  // Repeating groups / arrays → valueJson
  if (type === 'repeating_group' || Array.isArray(rawValue)) {
    if (Array.isArray(rawValue) && rawValue.length === 0) return null;
    return { ...base, valueJson: rawValue };
  }

  // Numbers → valueNumber
  if (type === 'number' || type === 'integer') {
    const num = Number(rawValue);
    if (isNaN(num)) return { ...base, valueText: String(rawValue) };
    return { ...base, valueNumber: num };
  }

  // Booleans → valueBoolean
  if (type === 'boolean' || type === 'checkbox') {
    return { ...base, valueBoolean: Boolean(rawValue) };
  }

  // Reference (foreign key IDs) → valueNumber
  if (type === 'reference') {
    const num = Number(rawValue);
    if (!isNaN(num)) return { ...base, valueNumber: num };
    return { ...base, valueText: String(rawValue) };
  }

  // Default: text
  return { ...base, valueText: String(rawValue) };
};

export const useSubmitForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const locale = useLocale();

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
      const price = storedData4?.price ? Number(storedData4.price) : null;
      const currency: string = storedData4?.currency || 'USD';
      const contactNumber: string | null = storedData4?.contactNumber || null;
      const publicationStatus: string = storedData4?.saveStatus === 'published' ? 'published' : 'draft';
      const publishedAt: string | null = storedData4?.publishedAt || storedData4?.publicationDate || null;

      // ─────────────────────────────────────────────────────────────────────
      // 3. location — location fields are in stepTwo as virtual fields
      //    (governorate, city, address are injected with negative IDs so they
      //     won't appear in __attributeMap__, we handle them separately)
      // ─────────────────────────────────────────────────────────────────────
      const governorate: string | null = storedData2?.governorate || null;
      const city: string | null = storedData2?.city || null;
      const address: string | null = storedData2?.address || null;

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
      const attributeValues: AttributeValue[] = [];

      // Virtual/injected location slugs that we handle as top-level fields
      const LOCATION_SLUGS = new Set(['governorate', 'city', 'address']);

      for (const [slug, meta] of Object.entries(attributeMap)) {
        if (LOCATION_SLUGS.has(slug)) continue; // Already handled as top-level
        if (!meta?.id || meta.id <= 0) continue; // Skip invalid/virtual attrs

        const rawValue = storedData2?.[slug];
        const attrValue = buildAttributeValue(meta.id, meta.type, rawValue);
        if (attrValue) {
          attributeValues.push(attrValue);
        }
      }

      // ─────────────────────────────────────────────────────────────────────
      // 6. images — from stepThree
      // ─────────────────────────────────────────────────────────────────────
      const images: string[] = [];
      if (storedData3?.coverImage && Array.isArray(storedData3.coverImage)) {
        images.push(...storedData3.coverImage);
      }

      // ─────────────────────────────────────────────────────────────────────
      // 7. Build the final payload
      // ─────────────────────────────────────────────────────────────────────
      console.log('[useSubmitForm] stepTwo data:', storedData2);
      console.log('[useSubmitForm] attributeMap:', attributeMap);
      console.log('[useSubmitForm] attributeValues built:', attributeValues);

      let response;

      if (isEditMode && carIdToEdit) {
        const updateDto: UpdateListingDto = {
          listingTypeId,
          listingOfferType,
          price,
          currency,
          governorate,
          city,
          address,
          contactNumber,
          publicationStatus,
          publishedAt,
          translations,
          attributeValues,
          images,
        };
        console.log('[useSubmitForm] PATCH payload:', updateDto);
        response = await updateListing(Number(carIdToEdit), updateDto);
        console.log('response',response)
      } else {
        const createDto: CreateListingDto = {
          listingTypeId,
          listingOfferType,
          price,
          currency,
          governorate,
          city,
          address,
          contactNumber,
          publicationStatus,
          publishedAt,
          translations,
          attributeValues,
          images,
        };
        console.log('[useSubmitForm] POST payload:', createDto);
        response = await createListing(createDto);
        console.log('response',response)
      }

      if (response.success) {
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
        setErrorMessage(formatErrorMessage(response));
        setShowErrorDialog(true);
        toast({
          variant: 'destructive',
          title: locale === 'en' ? 'Error' : 'خطأ',
          description: formatErrorMessage(response),
        });
        console.error('[useSubmitForm] Error response:', response);
        return null;
      }
    } catch (error) {
      console.error('[useSubmitForm] Exception:', error);
      setErrorMessage(formatErrorMessage(error));
      setShowErrorDialog(true);
      toast({
        variant: 'destructive',
        title: locale === 'en' ? 'Error' : 'خطأ',
        description: formatErrorMessage(error),
      });
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, [router, toast, locale]);

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