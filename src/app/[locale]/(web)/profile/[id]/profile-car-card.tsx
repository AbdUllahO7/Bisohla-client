'use client';

import Text from '@/components/text/text';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { ListingType, SaveStatus } from '@/core/entities/enums/cars.enums';
import { useDirection } from '@/hooks/use-direction';

interface ProfileCarCardProps {
  car: SelectCarListingDto;
}

export const ProfileCarCard: React.FC<ProfileCarCardProps> = ({ car }) => {
  const t = useTranslations('publicProfile');
  const direction = useDirection();
  const isRTL = direction === 'rtl';
  const isSold = car.saveStatus === SaveStatus.SOLD;

  // Determine listing type text
  const listingTypeText =
    car.listingType === ListingType.FOR_RENT
      ? t('listings.rent')
      : t('listings.sale');

  return (
    <Link
      key={car.id}
      href={`/products/product/${car.id}`}
      className="group w-full relative"
    >
      {/* Hover glow effect */}
      <div
        className={`absolute -inset-0.5 rounded-xl opacity-0 group-hover:opacity-20 blur transition-opacity duration-300 ${
          isRTL
            ? 'bg-gradient-to-l from-[#198341] to-[#ABDE3B]'
            : 'bg-gradient-to-r from-[#198341] to-[#ABDE3B]'
        }`}
      />

      <Card className="relative bg-white border-2 border-gray-100 rounded-xl overflow-hidden shadow-md hover:shadow-2xl hover:border-[#198341] transition-all duration-300">
        {/* Image */}
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
              className={`object-cover transition-transform duration-300 ${
                isSold ? 'grayscale' : 'group-hover:scale-105'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Text variant="small" className="text-gray-400">
                {t('listings.noImage')}
              </Text>
            </div>
          )}

          {/* Listing type badge */}
          <div
            className={`absolute top-2 ${isRTL ? 'right-2' : 'left-2'} z-30`}
          >
            <Text className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow">
              {listingTypeText}
            </Text>
          </div>

          {/* SOLD badge */}
          {isSold && (
            <>
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-20 pointer-events-none" />
              <div
                className={`absolute top-2 ${
                  isRTL ? 'left-2' : 'right-2'
                } z-30 text-white font-bold bg-red-600 px-2 py-1 rounded rotate-12 shadow-lg`}
              >
                {t('listings.sold')}
              </div>
            </>
          )}
        </div>

        {/* Car info */}
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
              className={`font-bold ${
                isSold ? 'text-gray-400 line-through' : 'text-[#198341]'
              }`}
            >
              {car.price} {car.currency}
            </Text>
          </div>
        </CardContent>

        {/* Optional sold overlay footer */}
        {isSold && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-30 pointer-events-none">
            <Text className="text-sm font-bold tracking-wider">
              {t('listings.soldDesc')}
            </Text>
          </div>
        )}
      </Card>
    </Link>
  );
};
