import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { generateWebMetadata } from '../../../MetaData';
import { generateProductMetadata } from '@/utils/settings-metadata.utils';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { GenericListingDto } from '@/core/entities/models/listings/generic-listing.dto';
import { getListingById as getMyListingById } from '@/core/infrastructure-adapters/actions/users/listing.user.actions';
import { getListingBySlug, getListingById } from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
import { getReferenceItemsByIds } from '@/core/infrastructure-adapters/actions/visitors/listing-type-refs.actions';
import { getSession } from '@/core/lib/web/session';
import { getInjection } from '@/di/container';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';
import { buildListingAttributeSections, type DisplaySection } from '@/lib/listing-attributes/attribute-sections/attribute-sections';
import { collectParentLookups } from '@/lib/listing-attributes/attribute-hydration/attribute-hydration';
import { flattenActiveAttributes } from '@/lib/listing-attributes/attribute-validator/attribute-validator';
import type { AttributeValueMap, ReferenceMetadataMap } from '@/lib/listing-attributes/types/attribute-form.types';
import ProductDetailSwitcher from './product-detail-switcher';
import ListingUnavailableDeadEnd from '@/components/web/ProductsPage/product/ListingUnavailableDeadEnd';
import { APP_URL } from '@/core/lib/web/constants';
import SimilarAds from '@/components/web/ProductsPage/product/SimilarAds';
import SimilarCarAlertBanner from '@/components/web/ProductsPage/product/SimilarCarAlertBanner';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';

interface ProductPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ profile?: string }>;
}

interface FetchListingResult {
  /** Legacy card shape, still consumed by the similar-ads / alert-banner cards. */
  carResponse: ApiResponse<SelectCarListingDto>;
  rawListing: GenericListingDto | null;
}

const fetchListing = cache(async (idOrSlug: string, isProfileView: boolean, locale: string, userId?: number): Promise<FetchListingResult> => {
  if (isProfileView) {
    let id = Number(idOrSlug);
    if (isNaN(id)) {
      const slugRes = await getListingBySlug(idOrSlug);
      if (slugRes.success && slugRes.data) id = slugRes.data.id;
    }
    if (!isNaN(id)) {
      const myListingRes = await getMyListingById(id, {
        include: 'attributeValues.attribute,images,user,listingType,listingTypeVersion',
      });
      if (myListingRes.success && myListingRes.data) {
        return {
          carResponse: { ...myListingRes, data: normalizeListingToCarDto(myListingRes.data, locale) } as ApiResponse<SelectCarListingDto>,
          rawListing: myListingRes.data as unknown as GenericListingDto,
        };
      }
    }
  }

  const params = userId ? { userId } : undefined;
  const slugRes = await getListingBySlug(idOrSlug, params);
  if (slugRes.success && slugRes.data) {
    return {
      carResponse: { ...slugRes, data: normalizeListingToCarDto(slugRes.data, locale) } as ApiResponse<SelectCarListingDto>,
      rawListing: slugRes.data as GenericListingDto,
    };
  }

  const id = Number(idOrSlug);
  if (!isNaN(id) && idOrSlug.trim() !== '') {
    const idRes = await getListingById(id, params);
    if (idRes.success && idRes.data) {
      return {
        carResponse: { ...idRes, data: normalizeListingToCarDto(idRes.data, locale) } as ApiResponse<SelectCarListingDto>,
        rawListing: idRes.data as GenericListingDto,
      };
    }
  }

  return { carResponse: slugRes as ApiResponse<SelectCarListingDto>, rawListing: null };
});

/**
 * Schema-driven read model: sections/order/labels from the type's form schema, and
 * every `conditionallyRequiredWhen` parent's metadata resolved by id (the detail's
 * `referenceItem` carries none) so a child like Trim hides only once its parent resolved.
 */
const buildSections = cache(async (listing: GenericListingDto, locale: 'en' | 'ar'): Promise<DisplaySection[]> => {
  try {
    const [schemaRes, t] = await Promise.all([
      getInjection('IListingTypesRepoController').getFormSchema(listing.listingTypeId),
      getTranslations({ locale, namespace: 'product.sections' }),
    ]);
    if (!schemaRes.success || !schemaRes.data) return [];
    const sections = schemaRes.data.sections;
    const allAttrs = flattenActiveAttributes(sections.filter((s) => s.isActive !== false));

    const values: AttributeValueMap = {};
    for (const av of listing.attributeValues ?? []) {
      if (av.referenceItemId != null) values[av.attributeId] = av.referenceItemId;
    }
    const lookups = collectParentLookups(allAttrs, values);
    const parentMetadataById: ReferenceMetadataMap = {};
    await Promise.all(
      Object.entries(lookups).map(async ([groupIdStr, ids]) => {
        const res = await getReferenceItemsByIds(Number(groupIdStr), ids).catch(() => null);
        if (!res?.success || !res.data) return;
        const byId = new Map(res.data.map((item) => [item.id, item.metadata ?? null]));
        for (const attr of allAttrs) {
          const v = values[attr.id];
          if (typeof v === 'number' && byId.has(v)) parentMetadataById[attr.id] = byId.get(v) ?? null;
        }
      }),
    );

    return buildListingAttributeSections({
      sections,
      attributeValues: listing.attributeValues ?? [],
      parentMetadataById,
      locale,
      labels: { yes: t('yes'), no: t('no') },
    });
  } catch (error) {
    console.error('[ProductPage] failed to build attribute sections', error);
    return [];
  }
});

const resolveTitle = (listing: GenericListingDto, locale: string): string => {
  const tr = (listing as unknown as { translations?: Record<string, { title?: string; description?: string | null }> }).translations;
  return tr?.[locale]?.title || listing.title || '';
};

const resolveDescription = (listing: GenericListingDto, locale: string): string | null => {
  const tr = (listing as unknown as { translations?: Record<string, { title?: string; description?: string | null }> }).translations;
  return tr?.[locale]?.description ?? listing.description ?? null;
};

export async function generateMetadata({ params, searchParams }: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const isProfileView = (await searchParams).profile === 'true';

  try {
    const session = await getSession();
    const locale = (await getLocale()) as 'en' | 'ar';
    const { rawListing } = await fetchListing(id, isProfileView, locale, session?.user?.id);
    if (!rawListing) return generateWebMetadata('car-detail');

    const sections = await buildSections(rawListing, locale);
    const highlights = sections
      .flatMap((s) => s.rows)
      .filter((r) => r.kind === 'simple' && r.value)
      .slice(0, 5)
      .map((r) => (r.kind === 'simple' ? r.value : ''));

    const title = resolveTitle(rawListing, locale) || rawListing.listingType?.name || 'Listing';
    const description =
      resolveDescription(rawListing, locale) ||
      [title, ...highlights, rawListing.price ? `${rawListing.price} ${rawListing.currency}` : null].filter(Boolean).join(' - ');
    const canonicalPath = `${APP_URL}/${locale}/products/product/${id}${isProfileView ? '?profile=true' : ''}`;

    return await generateProductMetadata({
      title,
      description,
      images: [rawListing.images?.find((img) => img.isPrimary)?.url || rawListing.images?.[0]?.url].filter((u): u is string => Boolean(u)),
      keywords: [rawListing.listingType?.name ?? '', ...highlights, rawListing.governorate, rawListing.city].filter(Boolean),
      canonical: canonicalPath,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return generateWebMetadata('car-detail');
  }
}

const ProductPage = async ({ params, searchParams }: ProductPageProps) => {
  const { id } = await params;
  const isProfileView = (await searchParams).profile === 'true';

  try {
    const session = await getSession();
    const isAuthenticated = !!session?.user;
    const locale = (await getLocale()) as 'en' | 'ar';

    const { carResponse, rawListing } = await fetchListing(id, isProfileView, locale, session?.user?.id);
    if (!carResponse.success || !carResponse.data || !rawListing) {
      return <ListingUnavailableDeadEnd />;
    }
    const attributeSections = await buildSections(rawListing, locale);

    return (
      <>
        <ProductDetailSwitcher
          carDataRes={carResponse}
          rawListing={rawListing}
          attributeSections={attributeSections}
          isAuthenticated={isAuthenticated}
          locale={locale}
          isProfileView={isProfileView}
        />

        <div className="container">
          <AdsSectionProduct />
        </div>

        <div className="container">
          <SimilarAds count={4} container={false} title={locale === 'ar' ? 'إعلانات مشابهة' : 'Similar ads'} car={carResponse.data} />
        </div>

        <SimilarCarAlertBanner car={carResponse.data} isAuthenticated={isAuthenticated} locale={locale} />
      </>
    );
  } catch (error) {
    console.error('Error in ProductPage:', error);
    notFound();
  }
};

export default ProductPage;
