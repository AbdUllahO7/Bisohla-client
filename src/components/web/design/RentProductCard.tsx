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
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import Box from '@/components/ui/box';
import { ArrowRight, Eye, Fuel, HeartIcon, LifeBuoy, Bed, Bath, Home, Ruler, Calendar } from 'lucide-react';
import { resolveAttributeValue } from '@/utils/listing-normalization';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { toggleListingFavorite } from '@/core/infrastructure-adapters/actions/users/listing.user.actions';
import { useTranslations } from 'next-intl';
import {
  getFuelTypeOptions,
  getTransmissionOptions,
  SaveStatus,
} from '@/core/entities/enums/cars.enums';
import { useCardViewTracking } from '@/hooks/use-card-view-tracking';
import { useSession } from '@/core/infrastructure-adapters/use-actions/auth/use-session';
import { CAR_DEFAULTS } from '@/constants/cars';
import { useCompare } from '@/providers/CompareProvider';
import { Scale } from 'lucide-react';
import { useLocale } from 'next-intl';

import { motion } from 'framer-motion';

interface RentProductCardProps {
  car: SelectCarListingDto;
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
  enableViewTracking?: boolean;
  priceWord?: string;
}

export const RentProductCard: React.FC<RentProductCardProps> = ({
  car,
  onFavoriteToggle,
  enableViewTracking = true,
  priceWord,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const session = useSession();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const isAuthenticated = session && session.accessToken;
  const isOwner =
    (!session.isLoading &&
      isAuthenticated &&
      session.user?.id === car.userId) ||
    false;

  // Get translators for different namespaces
  const t = useTranslations('SoldCard');
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTwo');

  // Use the custom card view tracking hook with owner protection
  const { hasTrackedView } = useCardViewTracking({
    carId: car.id,
    carUserId: car.userId,
    enabled: enableViewTracking,
    cardRef,
  });

  // Favorite state
  const [favoriteStatus, setFavoriteStatus] = useState(car.isFavorite ?? false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isInCompare, addToCompare, removeFromCompare } = useCompare();

  const isCompared = isInCompare(car.id);

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

  // Translated values for details
  const translatedFuelType = car.details?.fuelType
    ? getTranslatedLabel(car.details.fuelType, fuelTypeOptions)
    : '';
  const translatedTransmission = car.details?.transmission
    ? getTranslatedLabel(car.details.transmission, transmissionOptions)
    : '';

  // Extract attributes from rawListing if available
  const rawAttributes = useMemo(() => {
    return (car as any).rawListing?.attributeValues?.map((av: any) => ({
      slug: av.attribute?.slug,
      name: av.attribute?.name,
      value: av.valueText || av.valueNumber || ''
    })) || [];
  }, [car]);

  const getAttrValue = (slug: string) => {
    const attr = rawAttributes.find((a: any) => a.slug === slug);
    return attr ? attr.value : null;
  };

  const categoryName = (car as any).rawListing?.listingType?.name || (car as any).rawListing?.listingType?.translations?.find((t: any) => t.locale === locale)?.name;

  const subTitle = useMemo(() => {
    if (car.listingTypeId === 1 || !car.listingTypeId) {
      return car.make?.name && car.make?.name !== 'Unknown' ? car.make?.name : 'Car';
    }
    const locationStr = [car.governorate, car.city].filter(Boolean).join(', ');
    return locationStr || categoryName || 'Real Estate';
  }, [car.listingTypeId, car.make?.name, car.governorate, car.city, categoryName]);

  const footerDetails = useMemo(() => {
    const getAttrIcon = (slug: string, defaultIcon: React.ReactNode) => {
      const av = (car as any).rawListing?.attributeValues?.find(
        (av: any) => av.attribute?.slug === slug
      );
      const iconUrl = av?.attribute?.iconUrl;
      if (iconUrl) {
        return (
          <img
            src={iconUrl}
            alt={slug}
            className="h-4 w-4 object-contain"
          />
        );
      }
      return defaultIcon;
    };

    const rawAttrValues = (car as any).rawListing?.attributeValues || [];

    if (rawAttrValues.length > 0) {
      return rawAttrValues
        .map((av: any) => {
          let value = resolveAttributeValue(av, locale);
          const iconUrl = av.attribute?.iconUrl;
          const slug = av.attribute?.slug;

          // Translate slug values if they exist in the stepTwo translation namespace
          if (slug === 'fuel_type' || slug === 'transmission' || slug === 'body_type' || slug === 'condition') {
            try {
              const translationKey = slug === 'fuel_type' 
                ? `fuelType.${value}` 
                : slug === 'transmission' 
                ? `transmission.${value}` 
                : slug === 'body_type' 
                ? `bodyType.${value}` 
                : `vehicleCondition.${value}`;
              value = bodyTypeT(translationKey);
            } catch (e) {
              // Fall back to resolved value
            }
          }

          let defaultIcon = <Home className="h-4 w-4" />;
          if (slug === 'fuel_type') defaultIcon = <Fuel className="h-4 w-4" />;
          else if (slug === 'transmission') defaultIcon = <LifeBuoy className="h-4 w-4" />;
          else if (slug === 'year') defaultIcon = <Calendar className="h-4 w-4" />;
          else if (slug === 'rooms_count' || slug === 'rooms' || slug === 'bedrooms') defaultIcon = <Bed className="h-4 w-4" />;
          else if (slug === 'area' || slug === 'square_meters') defaultIcon = <Ruler className="h-4 w-4" />;
          else if (slug === 'bathrooms') defaultIcon = <Bath className="h-4 w-4" />;

          const icon = iconUrl ? (
            <img
              src={iconUrl}
              alt={slug}
              className="h-4 w-4 object-contain"
            />
          ) : (
            defaultIcon
          );

          return {
            slug,
            icon,
            value,
          };
        })
        .filter((item: any) => {
          return (
            item.value &&
            item.slug !== 'make' &&
            item.slug !== 'model' &&
            item.slug !== 'trim' &&
            !item.slug.startsWith('features_')
          );
        });
    }

    if (car.listingTypeId === 1 || !car.listingTypeId) {
      return [
        {
          icon: getAttrIcon('fuel_type', <Fuel className="h-4 w-4" />),
          value: translatedFuelType
        },
        {
          icon: getAttrIcon('transmission', <LifeBuoy className="h-4 w-4" />),
          value: translatedTransmission
        }
      ].filter(item => item.value);
    }

    const rooms = getAttrValue('rooms_count') || getAttrValue('rooms') || getAttrValue('bedrooms');
    const area = getAttrValue('area') || getAttrValue('square_meters');
    const bathrooms = getAttrValue('bathrooms');

    const details = [];
    if (rooms) {
      const roomsSlug = getAttrValue('rooms_count') ? 'rooms_count' : (getAttrValue('rooms') ? 'rooms' : 'bedrooms');
      details.push({
        icon: getAttrIcon(roomsSlug, <Bed className="h-4 w-4" />),
        value: `${rooms} ${locale === 'ar' ? 'غرف' : 'Rooms'}`
      });
    }
    if (area) {
      const areaSlug = getAttrValue('area') ? 'area' : 'square_meters';
      details.push({
        icon: getAttrIcon(areaSlug, <Ruler className="h-4 w-4" />),
        value: `${area} m²`
      });
    }
    if (bathrooms) {
      details.push({
        icon: getAttrIcon('bathrooms', <Bath className="h-4 w-4" />),
        value: `${bathrooms} ${locale === 'ar' ? 'حمامات' : 'Baths'}`
      });
    }

    return details;
  }, [car.listingTypeId, translatedFuelType, translatedTransmission, rawAttributes, locale, car, bodyTypeT]);

  // Get primary image or first available image
  const imageSrc =
    car.primaryImage ||
    car.images?.find((img) => img.isPrimary)?.url ||
    car.images?.[0]?.url ||
    '/placeholder-car.jpg';

  // Update internal state when the prop changes
  useEffect(() => {
    setFavoriteStatus(car.isFavorite ?? false);
  }, [car.isFavorite, car.id]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || isProcessing || !car.id) return;

    const previousState = favoriteStatus;
    const optimisticState = !previousState;

    // Optimistic update: Change UI immediately
    setFavoriteStatus(optimisticState);
    setIsProcessing(true);

    // Notify parent if callback exists
    onFavoriteToggle?.(car.id, optimisticState);

    try {
      const response = await toggleListingFavorite({
        listingId: car.id,
      });

      // Handle successful response
      if (response.success) {
        // Extract the actual favorite status from response
        const actualStatus =
          typeof response.data === 'boolean'
            ? response.data
            : response.data?.isFavorited ?? optimisticState;

        // Update state with server response if different from optimistic update
        if (actualStatus !== optimisticState) {
          setFavoriteStatus(actualStatus);
          onFavoriteToggle?.(car.id, actualStatus);
        }
      } else {
        // Rollback on failure
        setFavoriteStatus(previousState);
        onFavoriteToggle?.(car.id, previousState);
      }
    } catch (error) {
      // Rollback on error
      console.error('Failed to toggle favorite:', error);
      setFavoriteStatus(previousState);
      onFavoriteToggle?.(car.id, previousState);
    } finally {
      setIsProcessing(false);
    }
  };

  const isSold = car.saveStatus === SaveStatus.SOLD || car.publicationStatus === 'sold';
  
  const maxVisibleAttributes = 4;
  const visibleDetails = footerDetails.slice(0, maxVisibleAttributes);
  const remainingCount = footerDetails.length - maxVisibleAttributes;

  const isRent = (car.listingType || car.listingOfferType) === 'for_rent';
  const badgeText = isRent
    ? (locale === 'ar' ? 'إيجار' : 'Rent')
    : (locale === 'ar' ? 'بيع' : 'Sale');

  return (
    <motion.div
      ref={cardRef}
      className="w-full h-full"
      whileHover={!isSold ? {
        y: -10,
        transition: { duration: 0.3, ease: 'easeOut' }
      } : {}}
    >
      <Card
        className={`border-none min-h-[395px] h-full flex flex-col justify-between bg-white relative group transition-all duration-500 ease-out overflow-hidden shadow-md ${isSold
            ? 'opacity-90 cursor-pointer shadow-lg'
            : 'hover:shadow-2xl hover:shadow-emerald-500/15'
          }`}
      >

        {/* Heart Icon with favorite status */}
        {!isOwner && (
          <Button
            className="absolute top-12 left-2 bg-white p-2 rounded-full shadow-md z-50 transition-transform duration-200 active:scale-90"
            onClick={handleFavoriteClick}
            disabled={!isAuthenticated || isSold || isOwner}
          >
            <HeartIcon
              size={24}
              className={`transition-colors duration-200 ${!isAuthenticated || isSold || isOwner
                  ? 'text-gray-400'
                  : favoriteStatus
                    ? 'text-red-500'
                    : 'text-gray-600'
                }`}
              fill={favoriteStatus ? 'currentColor' : 'none'}
            />
          </Button>
        )}

        {/* Compare Toggle */}
        <Button
          className={`absolute top-12 right-2 bg-white p-2 rounded-full shadow-md z-50 transition-all duration-200 active:scale-90`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isCompared) {
              removeFromCompare(car.id);
            } else {
              addToCompare(car.id);
            }
          }}
          title={isCompared ? 'Remove from compare' : 'Add to compare'}
        >
          <Scale
            size={20}
            className={`transition-colors duration-200 ${isCompared ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-500'
              }`}
          />
        </Button>

        {/* SOLD Badge and Overlay */}
        {isSold && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/40 via-gray-800/30 to-black/40 backdrop-blur-[2px] z-20 pointer-events-none" />

            <div className="absolute top-0 right-0 z-30 pointer-events-none overflow-hidden w-32 h-32">
              <div className="absolute top-6 -right-8 bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-bold py-1.5 px-10 transform rotate-45 shadow-2xl">
                {t('soldOut')}
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-700 text-white text-center py-2 z-30 pointer-events-none">
              <Text className="text-sm font-bold tracking-wider">
                {t('desc')}
              </Text>
            </div>
          </>
        )}

        <div className="flex-1 flex flex-col justify-start">
          <Box
            className={`flex z-40 justify-between p-[8px] rounded-t-[10px] duration-500 ${isSold ? 'bg-gray-400' : 'bg-primary-light group-hover:bg-primary'
              }`}
          >
            <Text
              className={`mid font-cairo text-[500] text-[14px] ${isSold ? 'text-gray-200' : 'text-[#EFEFEF]'
                }`}
            >
              {priceWord || 'Price'}
            </Text>
            <Text
              className={`mid font-cairo font-bold ${isSold ? 'text-gray-200 line-through' : 'text-white'
                }`}
            >
              {car.price
                ? `${car.price} ${car.currency}`
                : CAR_DEFAULTS.PRICE_FALLBACK}
            </Text>
          </Box>

          <Link href={`/products/product/${car.slug || car.id}`} className="block">
            <CardHeader className="p-0">
              <CardTitle className="w-full relative h-48 overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={car.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={`object-cover transition-all duration-500 ${isSold ? 'grayscale' : ''
                    }`}
                  priority={false}
                />

                {/* Rent/Sale Badge inside image container */}
                <span className={`absolute bottom-3 ${isRTL ? 'right-3' : 'left-3'} z-30 px-2.5 py-1 text-[12px] font-bold font-cairo rounded-md shadow-md backdrop-blur-sm transition-all duration-300 ${
                  isRent
                    ? 'bg-emerald-600/95 text-white border border-emerald-500/20'
                    : 'bg-blue-600/95 text-white border border-blue-500/20'
                }`}>
                  {badgeText}
                </span>

                {!isSold && (
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                      <Eye className="h-6 w-6 text-emerald-600" />
                    </div>
                  </div>
                )}
              </CardTitle>
              <CardDescription className="p-[8px]">
                <Text
                  variant="h4"
                  className={`pr-2 pl-2 line-clamp-1 ${isSold ? 'text-gray-500' : 'text-primary'
                    }`}
                >
                  {car.title}
                </Text>
                <Text
                  variant="mid"
                  className={`pr-2 pl-2 ${isSold ? 'text-gray-400' : 'text-primary'
                    }`}
                >
                  {subTitle}
                </Text>
              </CardDescription>
            </CardHeader>
          </Link>
        </div>

        <CardFooter className="flex justify-between items-center p-4 pt-0 gap-4 mt-auto">
          <div className="flex flex-wrap gap-1.5 max-w-full overflow-hidden">
            {visibleDetails.map((detail, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-1 bg-[#F9FAFB] border border-[#F3F4F6] rounded-full px-2.5 py-1 text-[11px] font-medium text-[#4B5563] transition-all duration-300 ${
                  isSold
                    ? 'opacity-70'
                    : 'hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700'
                }`}
              >
                <div className="text-gray-500 group-hover:text-emerald-600 transition-colors flex items-center justify-center">
                  {detail.icon}
                </div>
                <span className="font-semibold">{detail.value}</span>
              </div>
            ))}
            {remainingCount > 0 && (
              <div className="flex items-center bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1 text-[11px] font-bold text-emerald-700">
                +{remainingCount}
              </div>
            )}
          </div>

          {!isSold && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 flex-shrink-0">
              <ArrowRight className="h-5 w-5 text-emerald-600" />
            </div>
          )}
        </CardFooter>

        {!isSold && (
          <>
            <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-20 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-500 rounded-r-full"></div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-20 bg-gradient-to-b from-[#ABDE3B] to-[#198341] transition-all duration-500 rounded-l-full"></div>
          </>
        )}
      </Card>
    </motion.div>
  );
};
