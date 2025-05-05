import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React, { useMemo } from 'react';
import { getBodyTypeOptions, getFuelTypeOptions, getTransmissionOptions } from '@/core/entities/enums/cars.enums';

// Define the props interface
export interface ProductBasicInfoProps {
  carType?: string;
  model?: string;
  controlType?: string;
  distance?: string;
  modelYear?: string;
  gaz?: string;
  bodyType?: string;
}

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  carType = '',
  controlType = '',
  distance = '',
  gaz = '',
  model = '',
  modelYear = '',
  bodyType = ""
}: ProductBasicInfoProps) => {
  // Get translators for different namespaces
  const productT = useTranslations('product');
  const bodyTypeT = useTranslations('addProduct.enteredData.stepTow');
  
  // Get the translated options from the car enums
  const bodyTypeOptions = useMemo(() => getBodyTypeOptions(bodyTypeT), [bodyTypeT]);
  const transmissionOptions = useMemo(() => getTransmissionOptions(bodyTypeT), [bodyTypeT]);
  const fuelTypeOptions = useMemo(() => getFuelTypeOptions(bodyTypeT), [bodyTypeT]);
  
  // Find the matching label for the given values
  const getTranslatedLabel = (value: string, options: Array<{ value: string; label: string }>) => {
    const option = options.find(opt => opt.value === value);
    return option ? option.label : value;
  };
  
  // Translated values
  const translatedBodyType = bodyType ? getTranslatedLabel(bodyType, bodyTypeOptions) : '';
  const translatedControlType = controlType ? getTranslatedLabel(controlType, transmissionOptions) : '';
  const translatedGaz = gaz ? getTranslatedLabel(gaz, fuelTypeOptions) : '';

  // Define the information to render dynamically
  const basicInfo = [
    { key: 'carType', label: productT('BasicInfo.carType'), value: carType, icon: '/assets/icons/car-clender.png' },
    { key: 'model', label: productT('BasicInfo.model'), value: model, icon: '/assets/icons/car-2.png' },
    { key: 'controlType', label: productT('BasicInfo.controlType'), value: translatedControlType, icon: '/assets/icons/gear-shift.png' },
    { key: 'distance', label: productT('BasicInfo.distance'), value: distance, icon: '/assets/icons/distance.png' },
    { key: 'modelYear', label: productT('BasicInfo.modelYear'), value: modelYear, icon: '/assets/icons/user-1.png' },
    { key: 'gaz', label: productT('BasicInfo.gaz'), value: translatedGaz, icon: '/assets/icons/gaz.png' },
    { key: 'bodyType', label: productT('BasicInfo.bodyType'), value: translatedBodyType, icon: '/assets/icons/car-2.png' },
  ];

  return (
    <Box variant="center" className='w-full'>
      <Box variant="row" className="flex flex-wrap justify-between gap-4 w-full">
        {basicInfo.map((info) => (
          <Card 
            key={info.key} 
            className="bg-white border-none rounded-lg p-5 w-[180px] h-32 flex-shrink-0 hover:shadow-2xl duration-500"
          >
            <CardContent className="flex flex-col h-full p-0">
              <div className="flex items-start gap-2 mb-2">
                <Image src={info.icon} alt={info.key} width={30} height={30} className='text-green-50' />
                <Text variant="mid" className="text-primary font-cairo font-bold">
                  {info.label}
                </Text>
              </div>
              <Text variant="mid" className="text-secondary-text mt-auto overflow-hidden text-ellipsis">
                {info.value}
              </Text>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ProductBasicInfo;