import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import React from 'react';

const CardAds = ({ isRent }: { isRent: boolean }) => {
  const t = useTranslations('homePage');

  return (
    <Box variant="column" className="flex flex-col justify-center items-center ">
      <Card className={`${isRent ? 'max-h-[420px] h-[410px] min-h-[410px]' : 'max-h-[350px] h-[350px] min-h-[350px]'}  border-none rounded-t-[10px] text-center flex flex-col justify-center items-center bg-primary-light `}>
        <CardHeader className="p-0 w-full h-full flex justify-center items-center">
          <CardDescription className="flex flex-col justify-center items-center h-full w-full font-bold font-cairo text-[20px]">
            <Text variant="h4" className="p-[8px] text-white">
              {t('productAds.title')}
            </Text>
            <Text variant="mid" className="p-[8px] text-primary-foreground font-[800] font-cairo text-[14px]">
              {t('productAds.description')}
            </Text>
          </CardDescription>
        </CardHeader>
      </Card>
    </Box>
  );
};

export default CardAds;
