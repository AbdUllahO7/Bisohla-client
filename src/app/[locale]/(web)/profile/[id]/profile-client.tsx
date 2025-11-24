'use client';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import SmartBreadcrumb from '@/components/smart-breadcrumbs';
import ProfileHeader from '@/components/web/ProfilePage/ProfileHeader';
import ProfileStats from '@/components/web/ProfilePage/ProfileStats';
import { ApiResponse } from '@/core/entities/api/success.response';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';
import { useGetPublicUserCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/public-profile.use-actions';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

interface ProfileClientProps {
  profileDataRes: ApiResponse<PublicProfileData>;
  isAuthenticated: boolean;
  locale: string;
  isOwnProfile: boolean;
  userId: number;
}

const ProfileClient = ({
  profileDataRes,
  isOwnProfile,
  userId,
}: ProfileClientProps) => {
  const profileData = profileDataRes.data;
  const t = useTranslations('publicProfile');
  const breadcrumbT = useTranslations('breadcrumb');

  // Fetch user's car listings
  const { data: carListingsData, isLoading: isLoadingListings } =
    useGetPublicUserCarListings(userId, true, {
      page: 1,
    });

  console.log('Car Listings Data:', carListingsData);

  if (!profileData) {
    return (
      <Box variant="center" className="min-h-screen">
        <Text variant="p">{t('noData')}</Text>
      </Box>
    );
  }

  // Define breadcrumb items
  const breadcrumbItems = [
    {
      label: breadcrumbT('home'),
      arLabel: breadcrumbT('home'),
      href: '/',
    },
    {
      label: profileData.name,
    },
  ];

  return (
    <div className="bg-background w-full min-h-screen mb-5 mt-5">
      <Box variant="container" className="w-full mb-16 mt-8">
        <SmartBreadcrumb
          items={breadcrumbItems}
          variant="default"
          separator="default"
        />
      </Box>

      <Box variant="container">
        {/* Profile Header */}
        <Box className="w-full mb-6">
          <ProfileHeader
            profile={profileData}
            isLoading={false}
            isOwnProfile={isOwnProfile}
          />
        </Box>

        {/* Profile Stats */}
        <Box className="w-full mb-6">
          <ProfileStats profile={profileData} isLoading={false} />
        </Box>

        {/* Car Listings Section */}
        <Box className="w-full flex flex-col gap-2">
          {/* Section Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full"></div>
              <Text variant="h3" className="font-bold text-[#2C3C39]">
                {t('listings.title')}
              </Text>
            </div>
          </div>

          {/* Listings Grid */}
          {isLoadingListings ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card
                  key={`skeleton-${index}`}
                  className="bg-white border-none rounded-xl overflow-hidden shadow-md"
                >
                  <Skeleton className="h-48 w-full" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-1/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : carListingsData?.data?.data &&
            carListingsData.data.data.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {carListingsData.data.data.map((car) => (
                <Link
                  key={car.id}
                  href={`/products/product/${car.id}`}
                  className="group"
                >
                  <div className="relative">
                    {/* Hover glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>

                    <Card className="relative bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:border-[#198341] transition-all duration-300">
                      {/* Car Image */}
                      <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                        {car.images && car.images.length > 0 ? (
                          <Image
                            src={
                              car.images.find((img) => img.isPrimary)?.url ||
                              car.images[0]?.url ||
                              '/placeholder.svg'
                            }
                            alt={car.title}
                            fill
                            className="object-cover group-active:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Text variant="small" className="text-gray-400">
                              {t('listings.noImage')}
                            </Text>
                          </div>
                        )}
                      </div>

                      {/* Car Info */}
                      <CardContent className="p-4 space-y-3">
                        <Text
                          variant="h5"
                          className="font-bold text-[#2C3C39] line-clamp-1 group-hover:text-[#198341] transition-colors duration-300"
                        >
                          {car.title}
                        </Text>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {car.details?.year && <span>{car.details.year}</span>}
                          {car.details?.mileage && (
                            <>
                              <span>•</span>
                              <span>
                                {car.details.mileage} {t('listings.km')}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <Text
                            variant="h5"
                            className="font-bold text-[#198341]"
                          >
                            {car.price} {car.currency}
                          </Text>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center shadow-md">
              <Text variant="p" className="text-gray-500">
                {t('listings.noListings')}
              </Text>
            </div>
          )}

          {/* Pagination Info */}
          {carListingsData?.data && (
            <div className="mt-6 text-center">
              <Text variant="small" className="text-gray-600">
                {t('listings.showing')} {carListingsData.data.data?.length || 0}{' '}
                {t('listings.of')} {carListingsData.data.totalItems}{' '}
                {t('listings.listings')}
              </Text>
            </div>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default ProfileClient;
