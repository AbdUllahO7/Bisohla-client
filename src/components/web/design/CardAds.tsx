import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { getTranslations } from 'next-intl/server';
import React from 'react'

const CardAds = async() => {
    const t = await getTranslations('homePage');

  return (
    <div>
       <Box variant="column">
            <Text variant="h3">
                {t("cardAds.title")}
                sss
            </Text>
            <Text variant="mid">
                {t("cardAds.description")}
            </Text>
        </Box>
    </div>
  )
}

export default CardAds
