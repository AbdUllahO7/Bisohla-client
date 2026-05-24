'use client';

import Box from '@/components/ui/box';
import AdSpace from '@/components/ads/AdSpace';
import StaticAdsDesign from './StaticAdsDesign';
import { useAdSlot } from '@/hooks/use-ad-slot';

const AdsSection = () => {
    console.log("AdsSection");
    const { adsData, isLoadingAds, allowPlaceholders, dismissable, rotationStrategy } = useAdSlot('home-page-ads-section-full-width');

    return (
        <Box variant="container" className="flex justify-center p-0" dir="rtl">
            <AdSpace
                name="home-page-ads-section-full-width"
                className="w-full min-h-[300px]"
                fallbackContent={<StaticAdsDesign />}
                isClosable={false}
                adsData={adsData}
                isLoadingAds={isLoadingAds}
                allowPlaceholders={allowPlaceholders}
                dismissable={dismissable}
                rotationStrategy={rotationStrategy}
            />
        </Box>
    );
};

export default AdsSection;
