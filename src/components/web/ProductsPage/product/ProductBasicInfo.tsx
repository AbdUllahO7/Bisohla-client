'use client';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type React from 'react';
import { useMemo, useRef } from 'react';
import {
  getBodyTypeOptions,
  getFuelTypeOptions,
  getTransmissionOptions,
} from '@/core/entities/enums/cars.enums';
import { Skeleton } from '@/components/ui/skeleton';

// Define the props interface
export interface ProductBasicInfoProps {
  isLoading?: boolean;
  carType?: string;
  model?: string;
  controlType?: string;
  distance?: string;
  modelYear?: string;
  gaz?: string;
  bodyType?: string;
}

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  isLoading = false,
  carType = '',
  controlType = '',
  distance = '',
  gaz = '',
  model = '',
  modelYear = '',
  bodyType = '',
}: ProductBasicInfoProps) => {
  // Get translators for different namespaces
  const productT = useTranslations('product');
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTow');

  // Get the translated options from the car enums
  const bodyTypeOptions = useMemo(
    () => getBodyTypeOptions(bodyTypeT),
    [bodyTypeT],
  );
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

  // Translated values
  const translatedBodyType = bodyType
    ? getTranslatedLabel(bodyType, bodyTypeOptions)
    : '';
  const translatedControlType = controlType
    ? getTranslatedLabel(controlType, transmissionOptions)
    : '';
  const translatedGaz = gaz ? getTranslatedLabel(gaz, fuelTypeOptions) : '';

  // Define the information to render dynamically
  const basicInfo = [
    {
      key: 'carType',
      label: productT('BasicInfo.carType'),
      value: carType,
      icon: '/assets/icons/car-clender.png',
    },
    {
      key: 'model',
      label: productT('BasicInfo.model'),
      value: model,
      icon: '/assets/icons/car-2.png',
    },
    {
      key: 'controlType',
      label: productT('BasicInfo.controlType'),
      value: translatedControlType,
      icon: '/assets/icons/gear-shift.png',
    },
    {
      key: 'distance',
      label: productT('BasicInfo.distance'),
      value: distance,
      icon: '/assets/icons/distance.png',
    },
    {
      key: 'modelYear',
      label: productT('BasicInfo.modelYear'),
      value: modelYear,
      icon: '/assets/icons/user-1.png',
    },
    {
      key: 'gaz',
      label: productT('BasicInfo.gaz'),
      value: translatedGaz,
      icon: '/assets/icons/gaz.png',
    },
    {
      key: 'bodyType',
      label: productT('BasicInfo.bodyType'),
      value: translatedBodyType,
      icon: '/assets/icons/car-2.png',
    },
  ];

  // Render skeleton cards when loading
  if (isLoading) {
    return (
      <Box variant="center" className="w-full">
        {/* Mobile skeleton */}
        <div className="md:hidden w-full">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {Array.from({ length: 7 }).map((_, index) => (
              <Card
                key={`mobile-skeleton-${index}`}
                className="bg-white border-none rounded-lg p-3 min-w-[140px] flex-shrink-0 shadow-sm"
              >
                <CardContent className="flex flex-col h-full p-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Desktop skeleton */}
        <div className="hidden md:grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 w-full">
          {Array.from({ length: 7 }).map((_, index) => (
            <Card
              key={`skeleton-${index}`}
              className="bg-white border-none rounded-lg p-2 sm:p-3 h-20 flex-shrink-0"
            >
              <CardContent className="flex flex-col h-full p-0">
                <div className="flex items-start gap-2 mb-1">
                  <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded-md" />
                  <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                </div>
                <Skeleton className="h-3 sm:h-4 w-full mt-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
      </Box>
    );
  }

  return (
    <Box variant="center" className="w-full">
      {/* Mobile Layout (< md) - Horizontal Scrollable with Enhanced Design */}
      <div className="md:hidden w-full">
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide">
          {basicInfo.map((info) => (
            <div key={info.key} className="relative group">
              {/* Hover glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
              
              <Card
                className="relative bg-white border-2 border-slate-200 rounded-lg p-3 min-w-[140px] flex-shrink-0 shadow-sm hover:shadow-lg hover:border-[#198341] transition-all duration-300 overflow-hidden"
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                
                <CardContent className="flex flex-col h-full p-0 space-y-2 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      {/* Icon glow on hover */}
                      <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300 rounded-lg"></div>
                      
                      <div className="relative p-1.5 bg-gradient-to-br from-[#198341]/10 to-[#ABDE3B]/10 group-hover:from-[#198341]/20 group-hover:to-[#ABDE3B]/20 rounded-lg transition-colors duration-300">
                        <Image
                          src={info.icon || '/placeholder.svg'}
                          alt={info.label}
                          width={20}
                          height={20}
                          className="w-5 h-5 text-primary group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    </div>
                    <Text
                      variant="small"
                      className="text-[#2C3C39] group-hover:text-[#198341] font-cairo font-bold text-xs line-clamp-1 flex-1 transition-colors duration-300"
                    >
                      {info.label}
                    </Text>
                  </div>
                  <Text
                    variant="small"
                    className="text-gray-700 font-cairo font-medium text-sm line-clamp-2 min-h-[2.5rem] flex items-center"
                  >
                    {info.value || 'N/A'}
                  </Text>
                </CardContent>
                
                {/* Bottom corner accent */}
                <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-[#ABDE3B]/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Card>
            </div>
          ))}
        </div>

        {/* Mobile: Enhanced scroll indicators */}
        <div className="flex justify-center mt-2">
          <div className="flex gap-2">
            {Array.from({ length: Math.ceil(basicInfo.length / 3) }).map(
              (_, index) => (
                <div
                  key={index}
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#198341] to-[#ABDE3B]"
                />
              ),
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout (>= md) - Enhanced Grid */}
      <div className="hidden md:grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 w-full">
        {basicInfo.map((info) => (
          <div key={info.key} className="relative group">
            {/* Hover glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity duration-300"></div>
            
            <Card
              className="relative bg-white border-2 border-slate-200 rounded-lg p-2 sm:p-3 h-20 flex-shrink-0 hover:shadow-xl hover:border-[#198341] transition-all duration-300 overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              {/* Side accent indicator */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover:h-10 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full"></div>
              
              <CardContent className="flex flex-row items-center h-full p-0 gap-4 relative z-10">
                <div className="relative">
                  {/* Icon glow on hover */}
                  <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  
                  <div className="relative group-hover:scale-110 transition-transform duration-300">
                    <Image
                      src={info.icon || '/placeholder.svg'}
                      alt={info.label}
                      width={20}
                      height={20}
                      className="text-green-50 w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Text
                    variant="small"
                    className="text-[#2C3C39] group-hover:text-[#198341] font-cairo font-bold text-xs sm:text-sm line-clamp-1 transition-colors duration-300"
                  >
                    {info.label}
                  </Text>
                  <Text
                    variant="small"
                    className="text-secondary-text mt-auto pb-1 sm:pb-2 overflow-hidden text-ellipsis text-xs sm:text-sm line-clamp-1"
                  >
                    {info.value}
                  </Text>
                </div>
              </CardContent>
              
              {/* Bottom corner accent */}
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-tl from-[#ABDE3B]/10 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Card>
          </div>
        ))}
      </div>
    </Box>
  );
};

export default ProductBasicInfo;