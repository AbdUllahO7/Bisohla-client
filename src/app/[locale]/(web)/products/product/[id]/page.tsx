import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { generateWebMetadata } from '../../../MetaData';
import { generateProductMetadata } from '@/utils/settings-metadata.utils';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { getMyCarById } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { QueryParams } from '@/core/entities/api/api';
import { getCarListingById } from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';
import { getListingBySlug, getListingById } from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
import { getSession } from '@/core/lib/web/session';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';
import ProductClient from './product-client';
import MobileProductClient from './mobile-product-client';
import { APP_URL } from '@/core/lib/web/constants';
import SimilarAds from '@/components/web/ProductsPage/product/SimilarAds';
import SimilarCarAlertBanner from '@/components/web/ProductsPage/product/SimilarCarAlertBanner';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';
import { logger } from '@/lib/logger';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    profile?: string;
  }>;
}

async function fetchCarData(
  idOrSlug: string,
  isProfileView: boolean,
  locale: string,
  userId?: number,
): Promise<ApiResponse<SelectCarListingDto>> {
  if (isProfileView) {
    const myCarRes = await getMyCarById(Number(idOrSlug));
    if (myCarRes.success && myCarRes.data) {
      return {
        ...myCarRes,
        data: normalizeListingToCarDto(myCarRes.data, locale)
      } as ApiResponse<SelectCarListingDto>;
    }
    return myCarRes;
  }

  // Attempt 1: Fetch by Slug (New generic endpoint)
  const slugRes = await getListingBySlug(idOrSlug);
  if (slugRes.success && slugRes.data) {
    return {
      ...slugRes,
      data: normalizeListingToCarDto(slugRes.data, locale)
    } as ApiResponse<SelectCarListingDto>;
  }

  // Attempt 2: Fetch by ID if numeric (New generic endpoint)
  const id = Number(idOrSlug);
  if (!isNaN(id) && idOrSlug.trim() !== '') {
    const idRes = await getListingById(id);
    if (idRes.success && idRes.data) {
      return {
        ...idRes,
        data: normalizeListingToCarDto(idRes.data, locale)
      } as ApiResponse<SelectCarListingDto>;
    }

    // Attempt 3: Legacy car endpoint fallback
    const legacyRes = await getCarListingById({ id, userId });
    if (legacyRes.success && legacyRes.data) {
      return legacyRes;
    }
  }

  return slugRes as ApiResponse<SelectCarListingDto>;
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const isProfileView = (await searchParams).profile === 'true';

  try {
    const session = await getSession();
    const locale = await getLocale();
    const carResponse = await fetchCarData(id, isProfileView, locale, session?.user?.id);

    if (!carResponse.success || !carResponse.data) {
      return generateWebMetadata('car-detail');
    }

    const car = carResponse.data;
    const carTitle = `${car.make?.name || ''} ${car.model?.name || ''} ${car.details?.year || ''}`.trim();
    const carDescription = `${carTitle} - ${car.details?.fuelType || ''} - ${car.details?.transmission || ''} - Price: ${car.price || 'N/A'}`;

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
    const isAuthenticated = !!(session?.accessToken || session?.user);
    const locale = await getLocale();

    const carResponse = await fetchCarData(id, isProfileView, locale, session?.user?.id);

    if (!carResponse.success || !carResponse.data) {
      notFound();
    }

    return (
      <>
        {/* Desktop Version */}
        <div className="hidden md:block">
          <ProductClient
            carDataRes={carResponse}
            isAuthenticated={isAuthenticated}
            locale={locale}
            isProfileView={isProfileView}
          />
        </div>

        {/* Mobile Version */}
        <div className="block md:hidden">
          <MobileProductClient
            carDataRes={carResponse}
            isAuthenticated={isAuthenticated}
            locale={locale}
            isProfileView={isProfileView}
          />
        </div>

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

