'use client';
import Box from '@/components/ui/box';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Steps from '@/components/web/ProductsPage/addProducts/Main/Steps';
import { Skeleton } from '@/components/ui/skeleton';
import {
  EDIT_STORAGE_KEYS,
  STORAGE_KEYS,
  clearFormData,
} from '@/components/web/ProductsPage/addProducts/Main/hooks/useLocalStorage';
import { useGetListingById } from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';
import { splitPhone } from '@/core/lib/phone/phone.util';
import { normalizeGovernorate, normalizeCity, normalizeAddress } from '@/core/entities/enums/syria.enums';

const EditProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch generic listing data
  const { data, isLoading, error } = useGetListingById(Number(id));

  // Prepare data and initialize local storage on component mount
  useEffect(() => {
    if (data && data.data && !isInitialized) {
      // Clear existing edit-mode data to prevent stale values
      clearFormData(true);

      const rawListing = Array.isArray(data.data)
        ? data.data[0]
        : ((data.data as any)?.listing ||
           (data.data as any)?.rawListing ||
           (data.data as any)?.carListing ||
           (data.data as any)?.data ||
           data.data);

      const listing = rawListing || {};

      if (!listing || (!listing.id && !listing.listingTypeId && !listing.title)) return;

      const typeId =
        listing.listingTypeId ||
        (listing as any).typeId ||
        (listing as any).listingType?.id ||
        1;

      const stepOneData = {
        id: typeId,
        name: (listing as any).listingType?.name || (listing as any).listingType || 'Listing',
        rentEnabled: (listing as any).listingType?.rentEnabled,
        installmentsEnabled: (listing as any).listingType?.installmentsEnabled,
        installmentsMode: (listing as any).listingType?.installmentsMode,
        installmentOptions: (listing as any).listingType?.installmentOptions,
      };

      // Initialize stepTwoData with flattened attribute values and their metadata
      const attributeValuesMap: Record<string, any> = {};
      const attributeMetaMap: Record<string, any> = {};
      const proposalsMap: Record<number, { name: string; status: 'pending' }> = {};

      if (listing.attributeValues && Array.isArray(listing.attributeValues)) {
        listing.attributeValues.forEach((av: any) => {
          const slug = av.attribute?.slug || av.slug;
          const attrId = av.attribute?.id || av.attributeId;
          
          if (av.refItemProposal && av.refItemProposal.status === 'pending') {
            if (attrId) {
              proposalsMap[attrId] = {
                name: av.refItemProposal.submittedName,
                status: 'pending',
              };
            }
            if (slug) {
              attributeMetaMap[slug] = {
                id: attrId,
                type: av.attribute?.type,
              };
              attributeValuesMap[slug] = null;
            }
          } else {
            let val = null;
            if (
              av.referenceItem &&
              (slug === 'governorate' || slug === 'محافظة' || slug === 'city' || slug === 'مدينة')
            ) {
              val =
                typeof av.referenceItem.name === 'object'
                  ? (av.referenceItem.name.ar || av.referenceItem.name.en)
                  : av.referenceItem.name ||
                    av.referenceItem.nameTranslations?.ar ||
                    av.referenceItem.nameTranslations?.en ||
                    av.valueText;
            } else if (av.referenceItemId !== null && av.referenceItemId !== undefined)
              val = String(av.referenceItemId);
            else if (av.valueNumber !== null && av.valueNumber !== undefined)
              val = Number(av.valueNumber);
            else if (av.valueJson !== null && av.valueJson !== undefined)
              val = av.valueJson;
            else if (av.valueBoolean !== null && av.valueBoolean !== undefined)
              val = av.valueBoolean;
            else if (av.valueText !== null && av.valueText !== undefined)
              val = av.valueText;
            else if (av.valueDate !== null && av.valueDate !== undefined)
              val = av.valueDate;

            if (slug) {
              attributeMetaMap[slug] = {
                id: attrId,
                type: av.attribute?.type,
              };
              attributeValuesMap[slug] = val;
            }
          }
        });
      }

      // Robust extraction of location fields with fallbacks
      const rawGov =
        listing.governorate ??
        listing.locationGovernorate ??
        (listing as any).location?.governorate ??
        (listing as any).details?.governorate ??
        (listing as any).addressInfo?.governorate ??
        (listing as any).address?.governorate ??
        (listing as any).rawListing?.governorate ??
        (listing as any).carListing?.governorate ??
        (listing.translations as any)?.ar?.governorate ??
        (listing.translations as any)?.en?.governorate ??
        attributeValuesMap['governorate'] ??
        attributeValuesMap['محافظة'];

      const rawCity =
        listing.city ??
        listing.locationCity ??
        (listing as any).location?.city ??
        (listing as any).details?.city ??
        (listing as any).addressInfo?.city ??
        (listing as any).address?.city ??
        (listing as any).rawListing?.city ??
        (listing as any).carListing?.city ??
        (listing.translations as any)?.ar?.city ??
        (listing.translations as any)?.en?.city ??
        attributeValuesMap['city'] ??
        attributeValuesMap['مدينة'];

      const rawAddress =
        listing.address ??
        listing.detailedAddress ??
        (listing as any).location?.address ??
        (listing as any).location?.detailedAddress ??
        (listing as any).details?.address ??
        (listing as any).addressInfo?.address ??
        (listing as any).rawListing?.address ??
        (listing as any).carListing?.address ??
        (listing.translations as any)?.ar?.address ??
        (listing.translations as any)?.en?.address ??
        attributeValuesMap['address'] ??
        attributeValuesMap['العنوان'] ??
        attributeValuesMap['detailed_address'];

      const rawLat =
        (listing as any).latitude ??
        (listing as any).lat ??
        (listing as any).location?.latitude ??
        (listing as any).location?.lat ??
        (listing as any).details?.latitude ??
        null;

      const rawLng =
        (listing as any).longitude ??
        (listing as any).lng ??
        (listing as any).lon ??
        (listing as any).location?.longitude ??
        (listing as any).location?.lng ??
        (listing as any).details?.longitude ??
        null;

      const normGov = normalizeGovernorate(rawGov);
      const normCity = normalizeCity(rawCity, normGov);
      const normAddress = normalizeAddress(rawAddress);
      const numLat = rawLat != null && !isNaN(Number(rawLat)) ? Number(rawLat) : null;
      const numLng = rawLng != null && !isNaN(Number(rawLng)) ? Number(rawLng) : null;

      // Merge direct attributes fallback from listing object
      const stepTwoData = {
        ...attributeValuesMap,
        governorate: normGov || null,
        city: normCity || null,
        address: normAddress || null,
        latitude: numLat,
        longitude: numLng,
        make: listing.makeId || listing.make?.id || attributeValuesMap.make || null,
        model: listing.modelId || listing.model?.id || attributeValuesMap.model || null,
        trim: listing.trimId || listing.trim?.id || attributeValuesMap.trim || null,
        currency: listing.currency || 'USD',
        __attributeMap__: attributeMetaMap,
        __proposals__: proposalsMap,
      };

      // Normalize images
      const rawImgs = listing.images || [];
      const imageUrls: string[] = rawImgs
        .map((img: any) =>
          typeof img === 'string' ? img : img.url || img.imageUrl,
        )
        .filter(Boolean);

      if (imageUrls.length === 0 && listing.primaryImage) {
        imageUrls.push(listing.primaryImage);
      }

      const stepThreeData = {
        coverImage: imageUrls,
        sectionStatus: transformDamagesToSectionStatus(listing.damages || []),
      };

      const itemTitle =
        listing.title ||
        (listing.translations as any)?.ar?.title ||
        (listing.translations as any)?.en?.title ||
        (listing.translations as any)?.[0]?.title ||
        '';

      const itemDescription =
        listing.description ||
        (listing.translations as any)?.ar?.description ||
        (listing.translations as any)?.en?.description ||
        (listing.translations as any)?.[0]?.description ||
        '';

      const stepFourData = {
        title: itemTitle,
        description: itemDescription,
        price:
          listing.price !== null && listing.price !== undefined
            ? listing.price.toString()
            : '',
        saveStatus: listing.saveStatus || 'PUBLISHED',
        listingType: listing.listingOfferType || listing.listingType || 'for_sale',
        rentType: listing.rentType || null,
        installmentsAvailable: Boolean(listing.installmentsAvailable),
        installmentPlans: Array.isArray(listing.installmentPlans)
          ? listing.installmentPlans.map((p: any) => ({
              months: Number(p.months),
              downPayment: p.downPayment !== null && p.downPayment !== undefined ? p.downPayment.toString() : '',
              monthlyAmount: p.monthlyAmount !== null && p.monthlyAmount !== undefined ? p.monthlyAmount.toString() : '',
              noteTranslations: p.noteTranslations || (p.note ? { en: p.note, ar: p.note } : undefined),
            }))
          : [],
        countryDialCode: splitPhone(listing.contactNumber).dialCode,
        contactNumber: splitPhone(listing.contactNumber).localNumber,
        publicationDate: listing.publishedAt
          ? new Date(listing.publishedAt).toISOString()
          : new Date().toISOString(),
        currency: listing.currency || 'USD',
        governorate: normGov,
        city: normCity,
        address: normAddress,
        latitude: numLat,
        longitude: numLng,
        detectedGovernorate: normGov || null,
      };

      try {
        // Store data in localStorage with edit-specific keys
        localStorage.setItem(
          EDIT_STORAGE_KEYS.STEP_ONE,
          JSON.stringify(stepOneData),
        );
        localStorage.setItem(
          EDIT_STORAGE_KEYS.STEP_TWO,
          JSON.stringify(stepTwoData),
        );
        localStorage.setItem(
          EDIT_STORAGE_KEYS.STEP_THREE,
          JSON.stringify(stepThreeData),
        );
        localStorage.setItem(
          EDIT_STORAGE_KEYS.STEP_FOUR,
          JSON.stringify(stepFourData),
        );

        // Set edit mode flag
        if (id) {
          localStorage.setItem(STORAGE_KEYS.EDIT_MODE_FLAG, id.toString());
        }

        setIsInitialized(true);
      } catch (err) {
        console.error('Error setting local storage for edit mode:', err);
      }
    }
  }, [data, id, isInitialized]);

  // Clean up function to remove edit mode flag when component unmounts
  useEffect(() => {
    return () => {
      const pathname = (typeof window !== 'undefined' ? window.location.pathname : '').toLowerCase();
      if (!pathname.includes('/edit')) {
        localStorage.removeItem(STORAGE_KEYS.EDIT_MODE_FLAG);
        clearFormData(true);
      }
    };
  }, []);

  // Helper function to transform damages from API format to section status format
  function transformDamagesToSectionStatus(
    damages: any[],
  ): Record<string, any> {
    const sectionStatus: Record<string, any> = {};
    damages?.forEach((damage) => {
      if (damage.damageZone && damage.damageType) {
        sectionStatus[damage.damageZone] = {
          status: damage.damageType,
          description: damage.description || '',
        };
      }
    });
    return sectionStatus;
  }

  // Show loading state
  if (isLoading) {
    return (
      <Box variant="column" className="mt-[50px] bg-background">
        <Box className="w-full mt-10 p-6" variant="column">
          <Skeleton className="h-8 w-1/3 mb-4" />
          <Skeleton className="h-64 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-2" />
          <Skeleton className="h-12 w-full" />
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error || !data) {
    return (
      <Box variant="column" className="mt-[50px] bg-background">
        <Box className="w-full mt-10 p-6" variant="column">
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error?.message ||
              'Error loading listing. Please try again or contact support.'}
            <button
              onClick={() => router.back()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 block"
            >
              Go Back
            </button>
          </div>
        </Box>
      </Box>
    );
  }

  return (
    <Box variant="column" className="mt-[50px] bg-background">
      <Box className="w-full mt-10" variant="column">
        {isInitialized && (
          <Steps
            isEditMode={true}
            carId={Number(id)}
            initialData={data.data}
          />
        )}
      </Box>
    </Box>
  );
};

export default EditProductPage;