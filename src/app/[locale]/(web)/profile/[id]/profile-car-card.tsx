'use client';

import Text from '@/components/text/text';
import { Card, CardContent } from '@/components/ui/card';
import CardAds from '@/components/web/design/CardAds';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

export const ProfileCarCard = ({ car }: { car: SelectCarListingDto }) => {
  const t = useTranslations('publicProfile');

  return (
    <Link key={car.id} href={`/products/product/${car.id}`} className="group">
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
              <Text variant="h5" className="font-bold text-[#198341]">
                {car.price} {car.currency}
              </Text>
            </div>
          </CardContent>
        </Card>
      </div>
    </Link>
  );
};
