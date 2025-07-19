'use client';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import type React from 'react';
import { useMemo } from 'react';
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
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 w-full">
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
      <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-2 sm:gap-3 md:gap-4 w-full">
        {basicInfo.map((info) => (
          <Card
            key={info.key}
            className="bg-white border-none rounded-lg p-2 sm:p-3 h-20 flex-shrink-0 hover:shadow-lg duration-300"
          >
            <CardContent className="flex flex-row items-center h-full p-0 gap-4">
              <div>
                <Image
                  src={info.icon || '/placeholder.svg'}
                  alt={info.label}
                  width={20}
                  height={20}
                  className="text-green-50 w-5 h-5 sm:w-6 sm:h-6"
                />
              </div>
              <div className="flex flex-col gap-1 sm:gap-2">
                <Text
                  variant="small"
                  className="text-primary font-cairo font-bold text-xs sm:text-sm line-clamp-1"
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
          </Card>
        ))}
      </div>
    </Box>
  );
};

export default ProductBasicInfo;
