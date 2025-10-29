import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import React from 'react';

const CardAds = ({ isRent }: { isRent: boolean }) => {
  const t = useTranslations('homePage');

  return (
    <Box variant="column" className="flex  flex-col justify-center items-center ">
      <Card className={`${isRent ? 'max-h-[420px]  min-h-[370px]' : 'max-h-[350px] min-h-[370px] '}  border-none rounded-t-[10px] text-center flex flex-col justify-center items-center bg-primary-light `}>
        <CardHeader className="p-0 w-full h-full flex justify-center items-center">
          <CardDescription className="flex flex-col justify-center items-center h-full w-full font-bold font-cairo text-[20px]">
            <Text variant="h4" className="p-[8px] text-white">
              {t('productAds.title')}
            </Text>
            <a 
              href="mailto:bishola4h@gmail.com" 
              className="mt-2 px-6 py-3 bg-white text-primary-light font-[800] font-cairo text-[14px] rounded-lg hover:bg-primary-foreground hover:text-white transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 cursor-pointer"
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