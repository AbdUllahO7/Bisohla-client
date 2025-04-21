import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import React from 'react';

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
  const t = useTranslations('product');

  // Define the information to render dynamically
  const basicInfo = [
    { key: 'carType', label: t('BasicInfo.carType'), value: carType, icon: '/assets/icons/car-clender.png' },
    { key: 'model', label: t('BasicInfo.model'), value: model, icon: '/assets/icons/car-2.png' },
    { key: 'controlType', label: t('BasicInfo.controlType'), value: controlType, icon: '/assets/icons/gear-shift.png' },
    { key: 'distance', label: t('BasicInfo.distance'), value: distance, icon: '/assets/icons/distance.png' },
    { key: 'modelYear', label: t('BasicInfo.modelYear'), value: modelYear, icon: '/assets/icons/user-1.png' },
    { key: 'gaz', label: t('BasicInfo.gaz'), value: gaz, icon: '/assets/icons/gaz.png' },
    { key: 'bodyType', label: t('BasicInfo.bodyType'), value: bodyType, icon: '/assets/icons/car-2.png' },
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