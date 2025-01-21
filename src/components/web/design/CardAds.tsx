import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Card, CardDescription, CardHeader } from '@/components/ui/card';
import { useTranslations } from 'next-intl';
import React from 'react';

const CardAds = () => {
  const t = useTranslations('homePage');

  return (
    <Box variant="column" className="flex-col justify-center items-center ">
      <Card className="max-h-[340px] h-[340px] min-h-[340px] border-none rounded-t-[10px]  text-center flex-col justify-center items-center bg-primary-light">

        <CardHeader className="p-0 w-full h-full flex justify-center items-center">
          <CardDescription className="flex flex-col justify-center items-center h-full w-full font-bold font-cairo text-[20px]">
            <Text variant="h4" className=" p-[8px] text-white">
              {t('cardAds.title')}
            </Text>
            <Text variant="mid" className="y p-[8px] text-primary-foreground font-[800] font-cairo text-[14px]">
              {t('cardAds.description')}
            </Text>
          </CardDescription>
        </CardHeader>
      </Card>
    </Box>
  );
};

export default CardAds;
