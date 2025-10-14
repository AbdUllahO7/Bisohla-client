'use client';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
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
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTow');

  // Get the translated options from the car enums - similar to ProductBasicInfo
  const transmissionOptions = useMemo(
    () => getTransmissionOptions(bodyTypeT),
    [bodyTypeT],
  );
  const fuelTypeOptions = useMemo(
    () => getFuelTypeOptions(bodyTypeT),
    [bodyTypeT],
  );

  // Find the matching label for the given values - same helper as in ProductBasicInfo
  const getTranslatedLabel = (
    value: string,
    options: Array<{ value: string; label: string }>,
  ) => {
    const option = options.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

  // Translated values
  const translatedControlType = controlType
    ? getTranslatedLabel(controlType, transmissionOptions)
    : '';
  const translatedGaz = gaz ? getTranslatedLabel(gaz, fuelTypeOptions) : '';

  // Dynamic info list with translated values
  const productDetails = [
    { label: productT('BasicInfo.price'), value: `${price} ${currency}` },
    { label: productT('BasicInfo.controlType'), value: translatedControlType },
    { label: productT('BasicInfo.modelYear'), value: modelYear },
    { label: productT('BasicInfo.gaz'), value: translatedGaz },
    { label: productT('BasicInfo.adsNumber'), value: adsNumber },
    { label: productT('BasicInfo.dateOfAds'), value: adsDate },
  ];

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
      <div className="md:hidden w-full">
        <div className="bg-white rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300">
          {/* Enhanced Mobile Header */}
          <div className="bg-gradient-to-r from-primary to-primary-light p-4 border-b border-gray-100">
            <Text className="font-bold font-cairo text-white text-lg tracking-wide">
              {locale === 'ar' ? 'معلومات السيارة' : 'Car Info'}
            </Text>
          </div>

          {/* Enhanced Mobile Content */}
          <div className="p-6" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="space-y-4">
              {productDetails.map((detail, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-3 px-2 rounded-lg hover:bg-gray-50 transition-colors duration-200 ${
                    index !== productDetails.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <Text className="font-cairo font-medium text-gray-600 text-sm flex-1">
                    {detail.label}
                  </Text>
                  <Text className="font-cairo font-semibold text-gray-800 text-sm text-right ml-3">
                    {detail.value || 'N/A'}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Enhanced Mobile Price Highlight */}
          {price && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <Text className="font-cairo font-bold text-green-700 text-base">
                  {locale === 'ar' ? 'السعر' : 'Price'}
                </Text>
                <Text className="font-cairo font-bold text-green-600 text-xl">
                  {price} {currency}
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Desktop Layout */}
      <Box
        className="2xl:w-[400px] lg:w-[300px] xs:w-full bg-white rounded-2xl overflow-hidden border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 justify-center hidden md:flex"
        variant="column"
      >
        {/* Enhanced Header */}
        <div className="w-full bg-gradient-to-r from-primary to-primary-light p-4 border-b border-gray-100">
          <Text className="font-bold font-cairo text-white text-lg tracking-wide">
            {locale === 'ar' ? 'معلومات السيارة' : 'Car Info'}
          </Text>
        </div>

        {/* Enhanced Scroll Area */}
        <ScrollArea
          className="h-[470px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-green-400 scrollbar-track-gray-100 scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {productDetails.map((detail, index) => (
            <Box
              key={index}
              variant="rowBetween"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              className={`w-full px-6 hover:bg-gray-50 transition-colors duration-200 group ${
                index !== productDetails.length - 1
                  ? 'border-b border-gray-100'
                  : ''
              } py-4`}
            >
              <Text className="font-cairo font-medium text-gray-600 group-hover:text-gray-700 transition-colors duration-200">
                {detail.label}
              </Text>
              <Text className="font-cairo font-semibold text-gray-800 group-hover:text-gray-900 transition-colors duration-200">
                {detail.value || 'N/A'}
              </Text>
            </Box>
          ))}
        </ScrollArea>
      </Box>
    </Box>
  );
};

export default ProductInfo;
