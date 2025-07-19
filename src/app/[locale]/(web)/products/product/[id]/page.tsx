import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { generateWebMetadata } from '../../../MetaData';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { ApiResponse } from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { getMyCarById } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { QueryParams } from '@/core/entities/api/api';
import { getCarListingById } from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';
import { getSession } from '@/core/lib/web/session';
import ProductClient from './product-client';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    profile?: string;
  }>;
}

async function fetchCarData(
  id: number,
  isProfileView: boolean,
  userId?: number,
): Promise<ApiResponse<SelectCarListingDto>> {
  if (isProfileView) {
    return await getMyCarById(id);
  } else {
    const params: QueryParams = {
      id,
      userId,
    };
    return await getCarListingById(params);
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const isProfileView = (await searchParams).profile === 'true';

  try {
    // Get session for user ID
    const session = await getSession();
    const userId = session?.user?.id;

    // Fetch car data
    const carResponse = await fetchCarData(Number(id), isProfileView, userId);

    if (!carResponse.success || !carResponse.data) {
      return generateWebMetadata('car-detail');
    }

    const car = carResponse.data;
    const carTitle = `${car.make?.name || ''} ${car.model?.name || ''} ${
      car.details?.year || ''
    }`.trim();
    const carDescription = `${carTitle} - ${car.details?.fuelType || ''} - ${
      car.details?.transmission || ''
    } - Price: ${car.price || 'N/A'}`;

    const webMetadata = await generateWebMetadata('car-detail', {
      title: carTitle || 'Car Details',
      description: carDescription,
      keywords: [
        car.make?.name || '',
        car.model?.name || '',
        car.details?.year?.toString() || '',
        car.details?.fuelType || '',
        car.details?.transmission || '',
        'car for sale',
        'vehicle details',
      ].filter(Boolean),
      ogImage:
        car.images?.find((img) => img.isPrimary)?.url ||
        car.images?.[0]?.url ||
        undefined,
      canonical: `/products/${id}${isProfileView ? '?profile=true' : ''}`,
    });

    return {
      ...webMetadata,
      icons: {
        icon: '/favicon.ico',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return generateWebMetadata('car-detail');
  }
}

const ProductPage = async ({ params, searchParams }: ProductPageProps) => {
  const { id } = await params;
  const isProfileView = (await searchParams).profile === 'true';

  try {
    // Get session and check auth
    const session = await getSession();
    const userId = session?.user?.id;

    // Check authentication status
    const authResponse = await checkAuth();
    const isAuthenticated = authResponse.success;

    // Fetch car data (this will be cached/deduplicated with metadata generation)
    const carResponse = await fetchCarData(Number(id), isProfileView, userId);

    if (!carResponse.success || !carResponse.data) {
      notFound();
    }

    const locale = await getLocale();

    // Pass the fetched data to the client component
    return (
      <ProductClient
        carDataRes={carResponse}
        isAuthenticated={isAuthenticated}
        locale={locale}
        isProfileView={isProfileView}
      />
    );
  } catch (error) {
    console.error('Error in ProductPage:', error);
    notFound();
  }
};

export default ProductPage;
