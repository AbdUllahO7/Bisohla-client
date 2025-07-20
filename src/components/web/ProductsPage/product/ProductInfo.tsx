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
  adsNumber?: string | number;
  adsDate?: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  isLoading = false,
  carType = '',
  controlType = '',
  distance = '',
  gaz = '',
  model = '',
  modelYear = '',
  price = '',
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
    { label: productT('BasicInfo.price'), value: price },
    { label: productT('BasicInfo.controlType'), value: translatedControlType },
    { label: productT('BasicInfo.modelYear'), value: modelYear },
    { label: productT('BasicInfo.gaz'), value: translatedGaz },
    { label: productT('BasicInfo.adsNumber'), value: adsNumber },
    { label: productT('BasicInfo.dateOfAds'), value: adsDate },
  ];

  // Render skeleton loading state
  if (isLoading) {
    return (
      <Box variant="center" className="w-full">
        {/* Mobile skeleton */}
        <div className="md:hidden w-full">
          <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <div className="bg-primary-foreground p-3">
              <Skeleton className="h-5 w-32" />
            </div>
            <div className="p-4 space-y-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`mobile-skeleton-${index}`}
                  className="flex justify-between items-center py-2"
                >
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop skeleton */}
        <Box
          className="2xl:w-[400px] lg:w-[300px] xs:w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm justify-center hidden md:flex"
          variant="column"
        >
          <div className="w-full bg-primary-foreground p-2">
            <Skeleton className="h-6 w-32" />
          </div>
          <ScrollArea
            className="h-[470px] w-full overflow-y-auto"
            dir={locale === 'ar' ? 'rtl' : 'ltr'}
          >
            {Array.from({ length: 9 }).map((_, index) => (
              <Box
                key={`desktop-skeleton-${index}`}
                variant="rowBetween"
                className={`w-full pr-4 pl-4 ${
                  index !== 8 ? 'border-b border-b-secondary-text' : ''
                } py-2 px-2 `}
              >
                <Skeleton className="h-6 w-[120px]" />
                <Skeleton className="h-6 w-[80px]" />
              </Box>
            ))}
          </ScrollArea>
        </Box>
      </Box>
    );
  }

  return (
    <Box variant="center" className="w-full">
      {/* Mobile Layout (< md) - Compact Card */}
      <div className="md:hidden w-full">
        <div className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm">
          {/* Mobile Header */}
          <div className="bg-primary-foreground p-3 border-b border-gray-100">
            <Text className="font-bold font-cairo text-black text-base">
              {locale === 'ar' ? 'معلومات السيارة' : 'Car Info'}
            </Text>
          </div>

          {/* Mobile Content - No scroll, just list */}
          <div className="p-4" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="space-y-3">
              {productDetails.map((detail, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center py-2 ${
                    index !== productDetails.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                >
                  <Text className="font-cairo font-medium text-gray-700 text-sm flex-1">
                    {detail.label}
                  </Text>
                  <Text className="font-cairo font-bold text-gray-900 text-sm text-right ml-2">
                    {detail.value || 'N/A'}
                  </Text>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile: Price highlight if it exists */}
          {price && (
            <div className="bg-primary/5 p-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <Text className="font-cairo font-bold text-primary text-base">
                  {locale === 'ar' ? 'السعر' : 'Price'}
                </Text>
                <Text className="font-cairo font-bold text-primary-light text-lg">
                  {price} {locale === 'ar' ? 'ريال' : 'SAR'}
                </Text>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Layout (>= md) - Keep original */}
      <Box
        className="2xl:w-[400px] lg:w-[300px] xs:w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm justify-center hidden md:flex"
        variant="column"
      >
        {/* Header with translation */}
        <Text className="w-full bg-primary-foreground p-2 font-bold font-cairo text-black rounded-t-lg">
          {locale === 'ar' ? 'معلومات السيارة' : 'Car Info'}
        </Text>
        <ScrollArea
          className="h-[470px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          dir={locale === 'ar' ? 'rtl' : 'ltr'}
        >
          {productDetails.map((detail, index) => (
            <Box
              key={index}
              variant="rowBetween"
              dir={locale === 'ar' ? 'rtl' : 'ltr'}
              className={`w-full pr-4 pl-4 ${
                index !== productDetails.length - 1
                  ? 'border-b border-b-secondary-text'
                  : ''
              } py-2 px-2`}
            >
              <Text className="font-cairo font-medium pr-4 pl-4">
                {detail.label}
              </Text>
              <Text className="font-cairo font-bold pr-4 pl-4">
                {detail.value}
              </Text>
            </Box>
          ))}
        </ScrollArea>
      </Box>
    </Box>
  );
};

export default ProductInfo;
