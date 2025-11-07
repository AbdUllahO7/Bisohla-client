'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import Text from '@/components/text/text';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { CarCardItemProps } from '@/types/homePageTypes';
import Box from '@/components/box/box';
import { ArrowRight, Eye, Fuel, HeartIcon, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { toggleCarListingFavorite } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { useTranslations } from 'next-intl';
import {
  getFuelTypeOptions,
  getTransmissionOptions,
  SaveStatus,
} from '@/core/entities/enums/cars.enums';
import { useIncrementViewCount } from '@/hooks/use-carStatistics';

// Extended props interface to include the callback and favorite status
interface ExtendedCarCardItemProps extends CarCardItemProps {
  onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
  isMarkedFavorite?: boolean;
  enableViewTracking?: boolean; // Optional prop to enable/disable view tracking
}

// CardItem Component
export const RentProductCard: React.FC<ExtendedCarCardItemProps> = ({
  title,
  marka,
  price,
  imageSrc,
  priceWord,
  details,
  ProductId,
  type,
  onFavoriteToggle,
  isMarkedFavorite = false,
  saveStatus,
  enableViewTracking = true, 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [favoriteStatus, setFavoriteStatus] = useState(isMarkedFavorite);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Get translators for different namespaces
  const t = useTranslations('SoldCard');
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTow');

  // Initialize view count tracking hook
  const incrementViewCount = useIncrementViewCount();

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
  const translatedFuelType = details?.fuelType
    ? getTranslatedLabel(details.fuelType, fuelTypeOptions)
    : '';
  const translatedTransmission = details?.transmission
    ? getTranslatedLabel(details.transmission, transmissionOptions)
    : '';

  // Track view count using Intersection Observer for better performance
  useEffect(() => {
    // Skip if tracking is disabled, already tracked, or no ProductId
    if (!enableViewTracking || !ProductId || hasTrackedView || !cardRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger when at least 50% of the card is visible for at least 1 second
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Use a timeout to ensure the card is viewed for at least 1 second
          const timeoutId = setTimeout(() => {
            
            // Check if mutation is not already pending
            if (!incrementViewCount.isPending) {
              incrementViewCount.mutate(
                { carListingId: Number(ProductId) },
                {
                  onSuccess: (data) => {
                    setHasTrackedView(true);
                  },
                  onError: (error) => {
                    console.error('[View Tracking] Failed to track view for ProductId:', ProductId, error);
                    // Still mark as tracked to prevent retry loops
                    setHasTrackedView(true);
                  },
                
                }
              );
            }
            
            // Disconnect observer after tracking
            observer.disconnect();
          }, 1000); // Wait 1 second before tracking

          // Clean up timeout if card becomes invisible before 1 second
          return () => clearTimeout(timeoutId);
        }
      },
      {
        threshold: 0.5, // Trigger when 50% visible
        rootMargin: '0px',
      }
    );

    observer.observe(cardRef.current);

    return () => {
      observer.disconnect();
    };
  }, [ProductId, hasTrackedView, incrementViewCount, enableViewTracking]);

  // Fallback: Track view count on mount if Intersection Observer is not supported
  useEffect(() => {
    // Check if Intersection Observer is supported
    if (!window.IntersectionObserver && enableViewTracking && ProductId && !hasTrackedView) {
      
      // Small delay to ensure component is fully mounted
      const timeoutId = setTimeout(() => {
        if (!incrementViewCount.isPending) {
          incrementViewCount.mutate(
            { carListingId: Number(ProductId) },
            {
              onSuccess: () => {
                setHasTrackedView(true);
              },
              onError: (error) => {
                console.error('[View Tracking Fallback] Failed to track view:', error);
                setHasTrackedView(true);
              },
            }
          );
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [ProductId, hasTrackedView, incrementViewCount, enableViewTracking]);

  // Check authentication status when component mounts
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const authResponse = await checkAuth();
        setIsAuthenticated(authResponse.success);
      } catch (error) {
        console.error('Auth check failed for rent product:', error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  // Update internal state when the prop changes
  useEffect(() => {
    setFavoriteStatus(isMarkedFavorite);
  }, [isMarkedFavorite, ProductId]);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAuthenticated && !isProcessing && ProductId) {
      setIsProcessing(true);

      try {
        const currentState = favoriteStatus;
        const newStatus = !currentState;
        setFavoriteStatus(newStatus);

        if (onFavoriteToggle) {
          onFavoriteToggle(Number(ProductId), newStatus);
        }

        const response = await toggleCarListingFavorite({
          carListingId: Number(ProductId),
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
              onFavoriteToggle(Number(ProductId), responseStatus);
            }
          }
        } else {
          setFavoriteStatus(currentState);

          if (onFavoriteToggle) {
            onFavoriteToggle(Number(ProductId), currentState);
          }
        }
      } catch (error) {
        console.error(`Exception in toggleFavorite:`, error);
        setFavoriteStatus(isMarkedFavorite);

        if (onFavoriteToggle) {
          onFavoriteToggle(Number(ProductId), isMarkedFavorite);
        }
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Manual test function for debugging (remove in production)
  const handleManualViewTrack = () => {
    if (ProductId) {
      incrementViewCount.mutate(
        { carListingId: Number(ProductId) },
       
      );
    }
  };

  const isSold = saveStatus === SaveStatus.SOLD;

  return (
    <div ref={cardRef} className="w-full">
      {/* Debug button - Remove in production */}
      
      <Card
        className={`border-none h-[370px] bg-white relative group transition-all duration-500 ease-out overflow-hidden ${
          isSold
            ? 'opacity-90 cursor-pointer shadow-lg'
            : 'hover:shadow-2xl hover:shadow-emerald-500/10'
        }`}
        onMouseEnter={() => !isSold && setIsHovered(true)}
        onMouseLeave={() => !isSold && setIsHovered(false)}
        style={{
          transform:
            isHovered && !isSold
              ? 'translateY(-8px) scale(1.02)'
              : 'translateY(0) scale(1)',
        }}
      >
        {/* Heart Icon with favorite status */}
        <Button
          className="absolute top-12 left-2 bg-white p-2 rounded-full shadow-md z-10"
          onClick={handleFavoriteClick}
          disabled={!isAuthenticated || isProcessing || isSold}
        >
          <HeartIcon
            size={24}
            className={
              isProcessing
                ? 'text-gray-400 animate-pulse'
                : !isAuthenticated || isSold
                ? 'text-gray-400'
                : favoriteStatus
                ? 'text-red-500'
                : 'text-gray-600'
            }
            fill={favoriteStatus ? 'currentColor' : 'none'}
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

        <Text className="absolute bottom-32 z-20 left-2 bg-primary-light px-2 py-1 rounded-lg shadow-md text-secondary text-sm">
          {type === 'for_rent' ? 'Rent' : 'Sale'}
        </Text>

        <Box
          className={`flex z-40 justify-between p-[8px] rounded-t-[10px] duration-500 ${
            isSold ? 'bg-gray-400' : 'bg-primary-light group-hover:bg-primary'
          }`}
        >
          <Text
            className={`mid font-cairo text-[500] text-[14px] ${
              isSold ? 'text-gray-200' : 'text-[#EFEFEF]'
            }`}
          >
            {priceWord}
          </Text>
          <Text
            className={`mid font-cairo font-bold ${
              isSold ? 'text-gray-200 line-through' : 'text-white'
            }`}
          >
            {price}
          </Text>
        </Box>

        <Link href={`/products/product/${ProductId}`} className="block">
          <CardHeader className="p-0">
            <CardTitle className="w-full relative h-48 overflow-hidden">
              <Image
                src={imageSrc}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={`object-cover transition-all duration-500 ${
                  isSold ? 'grayscale' : ''
                }`}
                priority={false}
              />
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
                className={`pr-2 pl-2 line-clamp-1 ${
                  isSold ? 'text-gray-500' : 'text-primary'
                }`}
              >
                {title}
              </Text>
              <Text
                variant="mid"
                className={`pr-2 pl-2 ${
                  isSold ? 'text-gray-400' : 'text-primary'
                }`}
              >
                {marka}
              </Text>
            </CardDescription>
          </CardHeader>
        </Link>

        <CardFooter className="flex justify-between items-center p-4 pt-0 gap-4">
          <div className="flex gap-4">
            <div
              className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                isSold
                  ? 'text-gray-400'
                  : 'text-gray-600 group-hover:text-emerald-600'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors duration-300 ${
                  isSold
                    ? 'bg-gray-200'
                    : 'bg-gray-100 group-hover:bg-emerald-100'
                }`}
              >
                <Fuel className="h-4 w-4" />
              </div>
              <span className="font-medium">{translatedFuelType}</span>
            </div>

            <div
              className={`flex items-center gap-2 text-sm transition-colors duration-300 ${
                isSold
                  ? 'text-gray-400'
                  : 'text-gray-600 group-hover:text-emerald-600'
              }`}
            >
              <div
                className={`p-1.5 rounded-lg transition-colors duration-300 ${
                  isSold
                    ? 'bg-gray-200'
                    : 'bg-gray-100 group-hover:bg-emerald-100'
                }`}
              >
                <LifeBuoy className="h-4 w-4" />
              </div>
              <span className="font-medium">{translatedTransmission}</span>
            </div>
          </div>

          {!isSold && (
            <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
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
    </div>
  );
};