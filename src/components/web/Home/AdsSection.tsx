import Box from '@/components/box/box';
import AdSpace from '@/components/ads/AdSpace';

const AdsSection = () => {
    return (
        <Box variant="container" className="flex justify-center p-0">
            <AdSpace name="home-page-ads-section-full-width" className="w-full min-h-[300px]" />
        </Box>
    );
};

export default AdsSection;
