'use client';

import Box from '@/components/ui/box';
import AdSpace from '@/components/ads/AdSpace';
import StaticAdsDesign from './StaticAdsDesign';
import { useAdSlot } from '@/hooks/use-ad-slot';
import { useLocale } from 'next-intl';

const AdsSection = () => {
    const locale = useLocale();
    const { adsData, isLoadingAds, allowPlaceholders, dismissable, rotationStrategy } = useAdSlot('home-page-ads-section-full-width');

    return (
        <Box variant="container" className="flex justify-center p-0" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <AdSpace
                name="home-page-ads-section-full-width"
                className="w-full"
                wrapperClassName="w-full min-h-[380px]"
                fallbackContent={<StaticAdsDesign />}
                isClosable={false}
                adsData={adsData}
                isLoadingAds={isLoadingAds}
                allowPlaceholders={allowPlaceholders}
                dismissable={dismissable}
                rotationStrategy={rotationStrategy}
                layout="banner"
                style={{ minHeight: '500px' }}
            />
        </Box>
    );
};

export default AdsSection;
