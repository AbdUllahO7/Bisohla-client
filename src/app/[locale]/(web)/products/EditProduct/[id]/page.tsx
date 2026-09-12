'use client';
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import Box from '@/components/ui/box';
import { Skeleton } from '@/components/ui/skeleton';
import Steps from '@/components/web/ProductsPage/addProducts/Main/Steps';
import type { HydratePayload } from '@/components/web/ProductsPage/addProducts/Main/context/listing-wizard.types';
import { defaultAdInfoData } from '@/components/web/ProductsPage/addProducts/StepFour/storageUtils';
import { ListingType, SaveStatus } from '@/core/entities/enums/cars.enums';
import { Currency } from '@/core/entities/enums/currency.enum';
import type { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { getInjection } from '@/di/container';
import { useGetListingById } from '@/core/infrastructure-adapters/use-actions/users/listing.user.use-actions';
import { getReferenceItemsByIds } from '@/core/infrastructure-adapters/actions/visitors/listing-type-refs.actions';
import { splitPhone } from '@/core/lib/phone/phone.util';
import {
  collectParentLookups,
  hydrateFromDetail,
  synthesizeMetadataForUnresolvedParents,
} from '@/lib/listing-attributes/attribute-hydration/attribute-hydration';
import { flattenActiveAttributes } from '@/lib/listing-attributes/attribute-validator/attribute-validator';

interface OwnerListingType {
  id: number;
  slug: string;
  name: string;
  rentEnabled?: boolean;
  installmentsEnabled?: boolean;
  installmentsMode?: 'free' | 'catalog';
}

/** GET /my-listings/:id — `listingType` is an object here, unlike the list card's string. */
type OwnerListing = Omit<ListingDto, 'listingType'> & {
  version?: number;
  condition?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  listingType?: OwnerListingType | string | null;
};

const unwrap = (data: unknown): OwnerListing | null => {
  if (!data) return null;
  const d = data as Record<string, unknown>;
  const raw = Array.isArray(d) ? d[0] : (d.listing ?? d.rawListing ?? d.data ?? d);
  return raw && typeof raw === 'object' && 'id' in (raw as object) ? (raw as OwnerListing) : null;
};

/**
 * Owner detail → wizard state. Attribute values hydrate by id; every
 * `conditionallyRequiredWhen` parent's metadata is resolved by id (the detail's
 * `referenceItem` carries none), and catalog-mode types fetch their installment options.
 */
const buildHydration = async (listing: OwnerListing, locale: string): Promise<HydratePayload> => {
  const controller = getInjection('IListingTypesRepoController');
  const typeMeta: OwnerListingType | null = typeof listing.listingType === 'object' && listing.listingType ? listing.listingType : null;
  const listingTypeId = listing.listingTypeId || typeMeta?.id || 0;

  const [schemaRes, catalogRes] = await Promise.all([
    controller.getFormSchema(listingTypeId),
    typeMeta?.installmentsMode === 'catalog' && typeMeta.slug ? controller.getListingTypeBySlug(typeMeta.slug) : Promise.resolve(null),
  ]);
  const sections = schemaRes.success && schemaRes.data ? schemaRes.data.sections : [];
  const allAttributes = flattenActiveAttributes(sections.filter((s) => s.isActive !== false));

  const hydrated = hydrateFromDetail(listing.attributeValues ?? []);

  const lookups = collectParentLookups(allAttributes, hydrated.values);
  const failedGroups = new Set<number>();
  let snapshots = { ...hydrated.snapshots };
  await Promise.all(
    Object.entries(lookups).map(async ([groupIdStr, ids]) => {
      const groupId = Number(groupIdStr);
      const fetchOnce = () => getReferenceItemsByIds(groupId, ids);
      let res = await fetchOnce().catch(() => null);
      if (!res?.success) res = await fetchOnce().catch(() => null);
      if (!res?.success || !res.data) {
        failedGroups.add(groupId);
        return;
      }
      const byId = new Map(res.data.map((item) => [item.id, item]));
      for (const [attrIdStr, snap] of Object.entries(snapshots)) {
        if (!snap || !byId.has(snap.id)) continue;
        const item = byId.get(snap.id)!;
        const name = (item.translations as Record<string, { name?: string }> | undefined)?.[locale]?.name || item.name || snap.name;
        snapshots[Number(attrIdStr)] = { ...snap, name, metadata: item.metadata ?? null };
      }
    }),
  );
  if (failedGroups.size > 0) {
    snapshots = synthesizeMetadataForUnresolvedParents(allAttributes, hydrated.values, snapshots, failedGroups);
  }

  const translations = (listing.translations ?? {}) as Record<string, { title?: string; description?: string | null }>;
  const current = translations[locale] ?? translations.ar ?? translations.en ?? {};
  const { dialCode, localNumber } = splitPhone(listing.contactNumber || '');
  const plans = Array.isArray(listing.installmentPlans) ? listing.installmentPlans : [];

  return {
    listingType: {
      id: listingTypeId,
      slug: typeMeta?.slug ?? '',
      name: typeMeta?.name ?? '',
      rentEnabled: typeMeta?.rentEnabled,
      installmentsEnabled: typeMeta?.installmentsEnabled,
      installmentsMode: typeMeta?.installmentsMode,
      installmentOptions: catalogRes?.success ? catalogRes.data?.installmentOptions : undefined,
    },
    attributeValues: hydrated.values,
    referenceSnapshots: snapshots,
    proposals: hydrated.proposals,
    images: (listing.images ?? [])
      .slice()
      .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
      .map((img) => (typeof img === 'string' ? img : img.url))
      .filter(Boolean),
    version: listing.version ?? null,
    commonFields: {
      ...defaultAdInfoData,
      title: current.title || listing.title || '',
      description: current.description || listing.description || '',
      price: listing.price != null ? String(listing.price) : '',
      countryDialCode: dialCode || '+963',
      contactNumber: localNumber || '',
      listingType: (listing.listingOfferType as ListingType) || ListingType.FOR_SALE,
      rentType: (listing.rentType as never) ?? null,
      condition: (listing.condition as never) ?? defaultAdInfoData.condition,
      publicationDate: listing.publishedAt ? new Date(listing.publishedAt) : new Date(),
      saveStatus: (listing.publicationStatus as SaveStatus) || SaveStatus.PUBLISHED,
      currency: (listing.currency as Currency) || Currency.USD,
      governorate: listing.governorate || '',
      city: listing.city || '',
      address: listing.address || '',
      latitude: listing.latitude != null && !Number.isNaN(Number(listing.latitude)) ? Number(listing.latitude) : null,
      longitude: listing.longitude != null && !Number.isNaN(Number(listing.longitude)) ? Number(listing.longitude) : null,
      detectedGovernorate: listing.governorate || null,
      installmentsAvailable: Boolean(listing.installmentsAvailable),
      installmentPlans: plans.map((p) => ({
        months: Number(p.months),
        downPayment: Number(p.downPayment ?? 0),
        monthlyAmount: Number(p.monthlyAmount ?? 0),
        noteTranslations: p.noteTranslations ?? null,
        displayOrder: p.displayOrder,
      })),
    },
  };
};

const EditProductPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('addProduct.wizard');
  const listingId = Number(id);
  const { data, isLoading, error } = useGetListingById(listingId);
  const [hydration, setHydration] = useState<HydratePayload | null>(null);
  const [hydrationError, setHydrationError] = useState<string | null>(null);

  useEffect(() => {
    if (!data?.data || hydration) return;
    const listing = unwrap(data.data);
    if (!listing) return;
    let cancelled = false;
    buildHydration(listing, locale)
      .then((payload) => {
        if (!cancelled) setHydration(payload);
      })
      .catch((e: unknown) => {
        if (!cancelled) setHydrationError(e instanceof Error ? e.message : String(e));
      });
    return () => {
      cancelled = true;
    };
  }, [data, hydration, locale]);

  if (isLoading || (data?.data && !hydration && !hydrationError)) {
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

  if (error || !data?.data || hydrationError) {
    return (
      <Box variant="column" className="mt-[50px] bg-background">
        <Box className="w-full mt-10 p-6" variant="column">
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error?.message || hydrationError || t('load_error')}
            <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 block">
              {t('go_back')}
            </button>
          </div>
        </Box>
      </Box>
    );
  }

  return (
    <Box variant="column" className="mt-[50px] bg-background">
      <Box className="w-full mt-10" variant="column">
        <Steps isEditMode={true} listingId={listingId} initialHydration={hydration} />
      </Box>
    </Box>
  );
};

export default EditProductPage;
