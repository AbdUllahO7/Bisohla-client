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
}

const ProductBasicInfo: React.FC<ProductBasicInfoProps> = ({
  carType = '',
  controlType = '',
  distance = '',
  gaz = '',
  model = '',
  modelYear = '',
}: ProductBasicInfoProps) => {
  const t = useTranslations('product');

  // Define the information to render dynamically
  const basicInfo = [
    { key: 'carType', label: t('BasicInfo.carType'), value: carType, icon: '/assets/icons/car-clender.png' },
    { key: 'model', label: t('BasicInfo.model'), value: model, icon: '/assets/icons/car-clender.png' },
    { key: 'controlType', label: t('BasicInfo.controlType'), value: controlType, icon: '/assets/icons/gear-shift.png' },
    { key: 'distance', label: t('BasicInfo.distance'), value: distance, icon: '/assets/icons/distance.png' },
    { key: 'modelYear', label: t('BasicInfo.modelYear'), value: modelYear, icon: '/assets/icons/user-1.png' },
    { key: 'gaz', label: t('BasicInfo.gaz'), value: gaz, icon: '/assets/icons/gaz.png' },
  ];

  return (
    <Box variant="center" className='w-full'>
      <Box variant="row" className="md:flex-wrap xs:flex-wrap flex-nowrap xs:justify-around lg:justify-start w-full items-center md:justify-center gap-8">
        {basicInfo.map((info) => (
          <Card key={info.key} className="bg-white border-none rounded-lg p-5 xs:w-[150px] 2xl:w-[190px] lg:w-[150px] flex-wrap hover:shadow-2xl duration-500">
            <CardContent className="flex items-start justify-start p-0 flex-wrap h-fit gap-2">
              <Image src={info.icon} alt={info.key} width={30} height={30} />
              <Box variant="column" className="w-full justify-start gap-1 items-start">
                <Text variant="mid" className="text-primary font-cairo font-bold">
                  {info.label}
                </Text>
                <Text variant="mid" className="text-secondary-text">{info.value}</Text>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ProductBasicInfo;