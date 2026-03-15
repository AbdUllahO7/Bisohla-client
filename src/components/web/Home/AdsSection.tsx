'use client';

import Box from '@/components/box/box';
import AdSpace from '@/components/ads/AdSpace';
import StaticAdsDesign from './StaticAdsDesign';

const AdsSection = () => {
    return (
        <Box variant="container" className="flex justify-center p-0" dir="rtl">
            <AdSpace
                name="home-page-ads-section-full-width"
                className="w-full min-h-[300px]"
                fallbackContent={<StaticAdsDesign />}
                isClosable={false}
            />
        </Box>
    );
};

export default AdsSection;
