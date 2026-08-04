import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { generateWebMetadata } from '../../../MetaData';
import { generateProductMetadata } from '@/utils/settings-metadata.utils';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { GenericListingDto } from '@/core/entities/models/listings/generic-listing.dto';
import { getMyCarById } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { getListingById as getMyListingById } from '@/core/infrastructure-adapters/actions/users/listing.user.actions';
import { getCarListingById } from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';
import { getListingBySlug, getListingById } from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
import { getSession } from '@/core/lib/web/session';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';
import ProductDetailSwitcher from './product-detail-switcher';
import { APP_URL } from '@/core/lib/web/constants';
import SimilarAds from '@/components/web/ProductsPage/product/SimilarAds';
import SimilarCarAlertBanner from '@/components/web/ProductsPage/product/SimilarCarAlertBanner';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    profile?: string;
  }>;
}

interface FetchListingResult {
  carResponse: ApiResponse<SelectCarListingDto>;
  rawListing: GenericListingDto | null;
  /**
   * Set only by the legacy car fallback below. Car ids and listing-types ids come
   * from different tables, so a car id must never be sent to the listing-types
   * reveal-contact endpoint — it would resolve to an unrelated listing and hand
   * the visitor the wrong seller's number.
   */
  isLegacyCar?: boolean;
}

const fetchCarData = cache(async (
  idOrSlug: string,
  isProfileView: boolean,
  locale: string,
  userId?: number,
): Promise<FetchListingResult> => {

  if (isProfileView) {
    let id = Number(idOrSlug);
    if (isNaN(id)) {
      // It's a slug! Let's get the listing by slug first to extract its numeric id.
      const slugRes = await getListingBySlug(idOrSlug);
      if (slugRes.success && slugRes.data) {
        id = slugRes.data.id;
      }
    }

    if (!isNaN(id)) {
      const myListingRes = await getMyListingById(id, {
        include: 'attributeValues.attribute,images,user,listingType,listingTypeVersion',
      });
      if (myListingRes.success && myListingRes.data) {
        return {
          carResponse: {
            ...myListingRes,
            data: normalizeListingToCarDto(myListingRes.data, locale),
          } as ApiResponse<SelectCarListingDto>,
          rawListing: myListingRes.data as unknown as GenericListingDto,
        };
      }

      const myCarRes = await getMyCarById(id);
      if (myCarRes.success && myCarRes.data) {
        return {
          carResponse: {
            ...myCarRes,
            data: normalizeListingToCarDto(myCarRes.data, locale),
          } as ApiResponse<SelectCarListingDto>,
          rawListing: myCarRes.data as unknown as GenericListingDto,
        };
      }
    }
  }

  // Attempt 1: Fetch by Slug (New generic endpoint)
  const params = userId ? { userId } : undefined;
  
  const slugRes = await getListingBySlug(idOrSlug, params);
  if (slugRes.success && slugRes.data) {
    return {
      carResponse: {
        ...slugRes,
        data: normalizeListingToCarDto(slugRes.data, locale),
      } as ApiResponse<SelectCarListingDto>,
      rawListing: slugRes.data as GenericListingDto,
    };
  }

  // Attempt 2: Fetch by ID if numeric (New generic endpoint)
  const id = Number(idOrSlug);
  if (!isNaN(id) && idOrSlug.trim() !== '') {
    const idRes = await getListingById(id, params);
    if (idRes.success && idRes.data) {
      return {
        carResponse: {
          ...idRes,
          data: normalizeListingToCarDto(idRes.data, locale),
        } as ApiResponse<SelectCarListingDto>,
        rawListing: idRes.data as GenericListingDto,
      };
    }

    // Attempt 3: Legacy car endpoint fallback
    const legacyRes = await getCarListingById({ id, userId });
    if (legacyRes.success && legacyRes.data) {
      return { carResponse: legacyRes, rawListing: null, isLegacyCar: true };
    }
  }

  console.warn(`[ProductPage] all attempts failed for ${idOrSlug}`);
  return { carResponse: slugRes as ApiResponse<SelectCarListingDto>, rawListing: null };
});

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const isProfileView = (await searchParams).profile === 'true';

  try {
    const session = await getSession();
    const locale = await getLocale();
    const { carResponse } = await fetchCarData(id, isProfileView, locale, session?.user?.id);

    if (!carResponse.success || !carResponse.data) {
      return generateWebMetadata('car-detail');
    }

    const car = carResponse.data;
    const makeModel = `${car.make?.name || ''} ${car.model?.name || ''}`.trim();
    const baseTitle = makeModel || car.title || 'Car Details';
    const yearStr = car.details?.year && car.details.year > 0 ? car.details.year.toString() : '';
    const carTitle = yearStr && !baseTitle.includes(yearStr) ? `${baseTitle} ${yearStr}`.trim() : baseTitle;
    const carDescription = [
      carTitle,
      car.details?.fuelType,
      car.details?.transmission,
      car.price ? `Price: ${car.price}` : null
    ].filter(Boolean).join(' - ');

    const baseUrl = APP_URL;
    const canonicalPath = `${baseUrl}/${locale}/products/product/${id}${isProfileView ? '?profile=true' : ''}`;

    return await generateProductMetadata({
      title: carTitle || 'Car Details',
      description: carDescription,
      images: [
        car.images?.find((img) => img.isPrimary)?.url || car.images?.[0]?.url,
      ].filter(Boolean),
      keywords: [
        car.make?.name || '',
        car.model?.name || '',
        car.details?.year?.toString() || '',
        car.details?.fuelType || '',
        car.details?.transmission || '',
        'car for sale',
        'vehicle details',
      ].filter(Boolean),
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
    const locale = await getLocale();

    const { carResponse, rawListing, isLegacyCar } = await fetchCarData(id, isProfileView, locale, session?.user?.id);
    console.log("carResponse",carResponse)
    if (!carResponse.success || !carResponse.data) {
      notFound();
    }

    return (
      <>
        <ProductDetailSwitcher
          carDataRes={carResponse}
          rawListing={rawListing}
          isLegacyCar={isLegacyCar}
          isAuthenticated={isAuthenticated}
          locale={locale}
          isProfileView={isProfileView}
        />

        {/* Ad Section */}
        <div className="container">
          <AdsSectionProduct />
        </div>

        {/* Similar Ads */}
        <div className="container">
          <SimilarAds
            count={4}
            container={false}
            title={locale === 'ar' ? 'إعلانات مشابهة' : 'Similar ads'}
            car={carResponse.data}
          />
        </div>

        {/* Similar Car Alert Banner */}
        <SimilarCarAlertBanner
          car={carResponse.data}
          isAuthenticated={isAuthenticated}
          locale={locale}
        />
      </>
    );
  } catch (error) {
    console.error('Error in ProductPage:', error);
    notFound();
  }
};

export default ProductPage;

