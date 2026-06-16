'use client';

import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useLocale, useTranslations } from 'next-intl';
import type React from 'react';
import { useMemo } from 'react';
import {
  getFuelTypeOptions,
  getTransmissionOptions,
} from '@/core/entities/enums/cars.enums';

// Update interface to make all properties optional and add isLoading
export interface ProductInfoProps {
  isLoading?: boolean;
  carType?: string;
  model?: string;
  controlType?: string;
  distance?: string;
  modelYear?: string;
  gaz?: string;
  price?: string | number;
  currency?: string;
  adsNumber?: string | number;
  adsDate?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  isLoading = false,
  controlType = '',
  gaz = '',
  modelYear = '',
  price = '',
  currency = '',
  adsNumber = '',
  adsDate = '',
}: ProductInfoProps) => {
  const locale = useLocale();
  const productT = useTranslations('product');
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTwo');

  // Get the translated options from the car enums - similar to ProductBasicInfo
  // Translation functions are stable, so we can safely omit them from dependencies
  const transmissionOptions = useMemo(
    () => getTransmissionOptions(bodyTypeT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const fuelTypeOptions = useMemo(
    () => getFuelTypeOptions(bodyTypeT),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Find the matching label for the given values - same helper as in ProductBasicInfo
  const getTranslatedLabel = (
    value: string,
    options: Array<{ value: string; label: string }>,
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  // Translated values - memoized to prevent re-calculations
  const translatedControlType = useMemo(
    () => (controlType ? getTranslatedLabel(controlType, transmissionOptions) : ''),
    [controlType, transmissionOptions]
  );
  
  const translatedGaz = useMemo(
    () => (gaz ? getTranslatedLabel(gaz, fuelTypeOptions) : ''),
    [gaz, fuelTypeOptions]
  );

  // Dynamic info list with translated values - memoized to prevent unnecessary re-renders
  const productDetails = useMemo(
    () => [
      { label: productT('BasicInfo.price'), value: `${price} ${currency}` },
      { label: productT('BasicInfo.controlType'), value: translatedControlType },
      { label: productT('BasicInfo.modelYear'), value: modelYear },
      { label: productT('BasicInfo.gaz'), value: translatedGaz },
      { label: productT('BasicInfo.adsNumber'), value: adsNumber },
      { label: productT('BasicInfo.dateOfAds'), value: adsDate },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [price, currency, translatedControlType, modelYear, translatedGaz, adsNumber, adsDate]
  );

  // Enhanced skeleton loading state
  if (isLoading) {
    return (
      <Box variant="center" className="w-full">
        {/* Mobile skeleton */}
        <div className="md:hidden w-full">
          <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4">
              <Skeleton className="h-6 w-32 rounded-lg" />
            </div>
            <div className="p-6 space-y-4">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`mobile-skeleton-${index}`}
                  className="flex justify-between items-center py-3"
                >
                  <Skeleton className="h-5 w-28 rounded-lg" />
                  <Skeleton className="h-5 w-24 rounded-lg" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop skeleton */}
        <Box
          className="2xl:w-[400px] lg:w-[300px] xs:w-full bg-white rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg justify-center hidden md:flex"
          variant="column"
        >
          <div className="w-full bg-gradient-to-r from-gray-50 to-gray-100 p-4">
            <Skeleton className="h-7 w-36 rounded-lg" />
          </div>
          <ScrollArea
            className="h-[470px] w-full overflow-y-auto"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            {Array.from({ length: 9 }).map((_, index) => (
              <Box
                key={`desktop-skeleton-${index}`}
                variant="rowBetween"
                className={`w-full px-6 ${
                  index !== 8 ? 'border-b border-gray-100' : ''
                } py-4`}
              >
                <Skeleton className="h-6 w-[130px] rounded-lg" />
                <Skeleton className="h-6 w-[90px] rounded-lg" />
              </Box>
            ))}
          </ScrollArea>
        </Box>
      </Box>
    );
  }

  return (
    <Box variant="center" className="w-full">
      {/* Enhanced Mobile Layout */}
      <div className="md:hidden w-full relative">
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#198341] to-[#198341] rounded-2xl opacity-10 blur-lg"></div>
        
        <Box
          className="relative w-full bg-white rounded-2xl overflow-hidden border border-[#198341]/20 shadow-md"
          variant="column"
        >
          {/* Header */}
          <div className="w-full bg-[#198341] p-4 border-b border-gray-100 relative overflow-hidden z-10">
            <Text className="font-bold font-cairo text-white text-base tracking-wide relative z-10 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#ABDE3B] rounded-full"></span>
              {locale === 'ar' ? 'معلومات المنتج' : 'Product Info'}
            </Text>
          </div>

          {/* Details list */}
          <div className="w-full divide-y divide-gray-100">
            {productDetails.map((detail, index) => (
              <Box
                key={index}
                variant="rowBetween"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className="w-full px-5 py-3.5 flex justify-between items-center bg-white"
              >
                <Text className="font-cairo font-medium text-sm text-gray-500">
                  {detail.label}
                </Text>
                <Text className="font-cairo font-semibold text-sm text-[#2C3C39]">
                  {detail.value || 'N/A'}
                </Text>
              </Box>
            ))}
          </div>
        </Box>
      </div>

      {/* Enhanced Desktop Layout */}
      <div className="relative hidden md:flex">
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#198341] to-[#198341] rounded-2xl opacity-20 blur-xl"></div>
        
        <Box
          className="relative 2xl:w-[400px] lg:w-[300px] xs:w-full bg-white rounded-2xl overflow-hidden border-2 border-[#198341]/30 shadow-xl hover:shadow-2xl hover:border-[#198341] transition-all duration-300 justify-center"
          variant="column"
        >
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#198341]/20 to-transparent rounded-bl-full pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#198341]/20 to-transparent rounded-tr-full pointer-events-none"></div>
          
          {/* Enhanced Header */}
          <div className="w-full bg-gradient-to-r from-[#198341] to-[#198341] p-4 border-b border-gray-100 relative overflow-hidden z-10">
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
            
            {/* Top accent bar */}
            
            <Text className="font-bold font-cairo text-white text-lg tracking-wide relative z-10 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-[#ABDE3B] rounded-full"></span>
              {locale === 'ar' ? 'معلومات المنتج' : 'Product Info'}
            </Text>
          </div>

          {/* Enhanced Scroll Area */}
          <ScrollArea
            className="h-[470px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            {productDetails.map((detail, index) => (
              <Box
                key={index}
                variant="rowBetween"
                dir={locale === 'ar' ? 'rtl' : 'ltr'}
                className={`group relative w-full px-6 hover:bg-gradient-to-r hover:from-[#198341]/5 hover:to-[#ABDE3B]/5 transition-all duration-300 ${
                  index !== productDetails.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                } py-4`}
              >
                {/* Hover indicator */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-10 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full"></div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-[#ABDE3B]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <Text className="relative font-cairo font-medium text-[#2C3C39] group-hover:text-[#198341] group-hover:font-semibold transition-all duration-300">
                  {detail.label}
                </Text>
                <Text className="relative font-cairo font-semibold text-[#2C3C39] group-hover:text-[#198341] transition-colors duration-300">
                  {detail.value || 'N/A'}
                </Text>
              </Box>
            ))}
          </ScrollArea>
        </Box>
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </Box>
  );
};

export default ProductInfo;
