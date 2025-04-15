import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';

// Update interface to make all properties optional
export interface ProductInfoProps {
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
  const t = useTranslations('product');

  // Dynamic info list for better maintainability
  const productDetails = [
    { label: t('BasicInfo.price'), value: price },
    { label: t('BasicInfo.carType'), value: carType },
    { label: t('BasicInfo.model'), value: model },
    { label: t('BasicInfo.controlType'), value: controlType },
    { label: t('BasicInfo.distance'), value: distance },
    { label: t('BasicInfo.modelYear'), value: modelYear },
    { label: t('BasicInfo.gaz'), value: gaz },
    { label: t('BasicInfo.adsNumber'), value: adsNumber },
    { label: t('BasicInfo.dateOfAds'), value: adsDate },
  ];

  return (
    <Box variant="center" className="w-full">
      <Box
        className="2xl:w-[400px] lg:w-[300px] xs:w-full bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm justify-center"
        variant="column"
      >
        {/* Header */}
        <Text className="w-full bg-primary-foreground p-2 font-bold font-cairo text-white rounded-t-lg">
          {locale === 'en' ? 'Information' : 'معلومات'}
        </Text>
        <ScrollArea
          className="h-[470px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
          dir="tlr"
        >
          {productDetails.map((detail, index) => (
            <Box
              key={index}
              variant="rowBetween"
              className={`w-full pr-4 pl-4 ${index !== productDetails.length - 1 ? 'border-b border-b-secondary-text' : ''} py-2 px-2`}
            >
              <Text className="text-secondary font-cairo font-medium pr-4 pl-4">{detail.label}</Text>
              <Text className="text-primary font-cairo font-bold pr-4 pl-4">{detail.value}</Text>
            </Box>
          ))}
        </ScrollArea>
      </Box>
    </Box>
  );
};

export default ProductInfo;