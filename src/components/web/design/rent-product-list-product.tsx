'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import Text from '@/components/ui/text';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import Box from '@/components/ui/box';
import {
  ArrowRight,
  Eye,
  Fuel,
  HeartIcon,
  LifeBuoy,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { toggleListingFavorite } from '@/core/infrastructure-adapters/actions/users/listing.user.actions';
import { useTranslations } from 'next-intl';
import {
  getFuelTypeOptions,
  getTransmissionOptions,
  SaveStatus,
} from '@/core/entities/enums/cars.enums';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { useCardViewTracking } from '@/hooks/use-card-view-tracking';
import { useSession } from '@/core/infrastructure-adapters/use-actions/auth/use-session';
import { cn } from '@/lib/utils';
import { useDirection } from '@/hooks/use-direction';
import { CAR_DEFAULTS } from '@/constants/cars';

// Props interface for the list card
interface RentProductListCardProps {
  car: SelectCarListingDto;
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
  isMarkedFavorite?: boolean;
  priceWord?: string;
  enableViewTracking?: boolean;
}

// List-style CardItem Component for mobile
export const RentProductListCard: React.FC<RentProductListCardProps> = ({
  car,
  onFavoriteToggle,
  isMarkedFavorite = false,
  priceWord = 'Price',
  enableViewTracking = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const isAuthenticated = session && session.accessToken;
  const isOwner =
    (!session.isLoading &&
      isAuthenticated &&
      session.user?.id === car.userId) ||
    false;
  const [favoriteStatus, setFavoriteStatus] = useState(isMarkedFavorite);
  const [isProcessing, setIsProcessing] = useState(false);
  const direction = useDirection();
  // Get translators for different namespaces
  const productT = useTranslations('product');
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTwo');

  // Use the custom card view tracking hook with owner protection
  const { hasTrackedView } = useCardViewTracking({
    carId: car.id,
    carUserId: car.userId,
    enabled: enableViewTracking,
    cardRef,
  });

  // Get the translated options from the car enums
  const transmissionOptions = useMemo(
    () => getTransmissionOptions(bodyTypeT),
    [bodyTypeT],
  );
  const fuelTypeOptions = useMemo(
    () => getFuelTypeOptions(bodyTypeT),
    [bodyTypeT],
  );

  // Find the matching label for the given values
  const getTranslatedLabel = (
    value: string,
    options: Array<{ value: string; label: string }>,
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  // Extract data from car object
  const {
    id: productId,
    title,
    make,
    price,
    listingType,
    images,
    details,
    currency,
    saveStatus,
  } = car;

  const isSold = saveStatus === SaveStatus.SOLD;

  // Get primary image or first available image
  const imageSrc =
    images?.find((img) => img.isPrimary)?.url ||
    images?.[0]?.url ||
    '/placeholder-car.jpg';

  // Translated values for details
  const translatedFuelType = details?.fuelType
    ? getTranslatedLabel(details.fuelType, fuelTypeOptions)
    : '';
  const translatedTransmission = details?.transmission
    ? getTranslatedLabel(details.transmission, transmissionOptions)
    : '';

  // Update internal state when the prop changes
  useEffect(() => {
    setFavoriteStatus(isMarkedFavorite);
  }, [isMarkedFavorite, productId]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isAuthenticated && !isProcessing && productId) {
      setIsProcessing(true);

      try {
        const currentState = favoriteStatus;
        const newStatus = !currentState;
        setFavoriteStatus(newStatus);

        if (onFavoriteToggle) {
          onFavoriteToggle(Number(productId), newStatus);
        }

        const response = await toggleListingFavorite({
          listingId: Number(productId),
        });

        if (response.success) {
          let responseStatus: boolean;

          if (typeof response.data === 'boolean') {
            responseStatus = response.data;
          } else if (
            response.data &&
            typeof response.data === 'object' &&
            'isFavorite' in response.data
          ) {
            responseStatus = response.data.isFavorite as boolean;
          } else {
            responseStatus = newStatus;
          }

          if (responseStatus !== newStatus) {
            setFavoriteStatus(responseStatus);
            if (onFavoriteToggle) {
              onFavoriteToggle(Number(productId), responseStatus);
            }
          }
        } else {
          setFavoriteStatus(currentState);
          if (onFavoriteToggle) {
            onFavoriteToggle(Number(productId), currentState);
          }
        }
      } catch (error) {
        console.error(`Exception in toggleFavorite:`, error);
        setFavoriteStatus(isMarkedFavorite);
        if (onFavoriteToggle) {
          onFavoriteToggle(Number(productId), isMarkedFavorite);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  return (
    <Card
      className={`w-full relative border border-gray-200 bg-white transition-all duration-300 ease-out overflow-hidden mb-4 ${
        isSold ? 'opacity-75 cursor-default' : 'hover:shadow-lg'
      }`}
      ref={cardRef}
    >
      <Link href={`/products/product/${car.slug || productId}`} className="block w-full">
        <div className="flex flex-row h-32 relative">
          {/* SOLD Badge and Overlay */}
          {isSold && (
            <>
              {/* Semi-transparent overlay */}
              <div className="absolute inset-0 bg-gray-900/20 z-20 pointer-events-none rounded" />

              {/* SOLD Badge */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                <div className="bg-red-600 text-white font-bold text-lg px-6 py-2 rounded-lg shadow-2xl border-2 border-white transform -rotate-12">
                  SOLD
                </div>
              </div>
            </>
          )}

          {/* Image Section - Fixed width */}
          <div className="relative w-32 h-full flex-shrink-0">
            <Image src={imageSrc} alt={title} fill className="object-cover" />

            {/* Type Badge */}
            <div className="absolute top-2 left-2 z-10">
              <span className="bg-primary text-white px-2 py-1 rounded text-xs font-medium">
                {listingType === 'for_rent' ? 'Rent' : 'Sale'}
              </span>
            </div>

            {/* Hover overlay */}
            {!isSold && (
              <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Eye className="h-4 w-4 text-emerald-600" />
                </div>
              </div>
            )}
          </div>

          {/* Content Section - Flexible width */}
          <div className="flex-1 flex flex-col justify-between p-3">
            {/* Header with title and favorite */}
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <Text
                  variant="h4"
                  className="text-primary font-semibold text-sm line-clamp-1 mb-1"
                >
                  {title}
                </Text>
                <Text variant="small" className="text-gray-600 text-xs">
                  {make?.name || ''}
                </Text>
              </div>
            </div>

            {/* Details Section */}
            <div className="flex items-center gap-3 my-2">
              {translatedFuelType && (
                <div className="flex items-center gap-1">
                  <Fuel className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {translatedFuelType}
                  </span>
                </div>
              )}

              {translatedTransmission && (
                <div className="flex items-center gap-1">
                  <LifeBuoy className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">
                    {translatedTransmission}
                  </span>
                </div>
              )}

              {details?.year && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{details.year}</span>
                </div>
              )}
            </div>

            {/* Price and Arrow Section */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Text className="text-xs text-gray-500">{priceWord}</Text>
                <Text className="text-sm font-bold text-primary">
                  {price
                    ? `${price} ${currency || ''}`
                    : CAR_DEFAULTS.PRICE_FALLBACK}
                </Text>
              </div>

              {!isSold && <ArrowRight className="h-4 w-4 text-emerald-600" />}
            </div>
          </div>
        </div>
      </Link>
      {/* Heart Icon */}
      {!isOwner && (
        <Button
          className={cn(
            'absolute top-2 p-1 h-8 w-8 bg-transparent hover:bg-gray-100 rounded-full',
            direction === 'ltr' ? 'right-2' : 'left-2',
          )}
          onClick={handleFavoriteClick}
          disabled={!isAuthenticated || isProcessing || isSold || isOwner}
        >
          <HeartIcon
            size={16}
            className={
              isProcessing
                ? 'text-gray-400 animate-pulse'
                : !isAuthenticated || isSold || isOwner
                ? 'text-gray-400'
                : favoriteStatus
                ? 'text-red-500'
                : 'text-gray-600'
            }
            fill={favoriteStatus ? 'currentColor' : 'none'}
          />
        </Button>
      )}
    </Card>
  );
};
