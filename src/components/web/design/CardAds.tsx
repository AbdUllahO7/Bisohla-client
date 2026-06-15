import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import React from 'react';

const CardAds = ({ isRent }: { isRent?: boolean }) => {
  const t = useTranslations('homePage');

  return (
    <Box variant="column" className="w-full h-full flex flex-col justify-stretch items-stretch">
      <Card className="w-full h-full border-none rounded-[10px] text-center flex flex-col justify-center items-center bg-primary-light shadow-md hover:shadow-2xl hover:shadow-emerald-500/15 transition-all duration-500 ease-out overflow-hidden">
        <CardHeader className="p-0 w-full h-full flex justify-center items-center">
          <CardDescription className="flex flex-col justify-center items-center h-full w-full font-bold font-cairo text-[20px] p-6">
            <Text variant="h4" className="p-[8px] text-white">
              {t('productAds.title')}
            </Text>
            <a 
              href="mailto:bishola4h@gmail.com" 
              className="mt-4 px-6 py-3 bg-white text-primary-light font-[800] font-cairo text-[14px] rounded-lg hover:bg-primary-foreground hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
            >
              {t('productAds.description')}
            </a>
          </CardDescription>
        </CardHeader>
      </Card>
    </Box>
  );
};

export default CardAds;