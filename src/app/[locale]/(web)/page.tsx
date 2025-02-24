import Box from '@/components/box/box';
import AdsSection from '@/components/web/Home/AdsSection';
import FAQ from '@/components/web/Home/FAQ';
import Hero from '@/components/web/Home/Hero';
import LatestOffers from '@/components/web/Home/LatestOffers';
import RentCar from '@/components/web/Home/RentProduct';
import SpaceAds from '@/components/web/Home/SpaceAds';
import WorldOfCar from '@/components/web/Home/WorldOfProduct';

const WebPage = async () => {
  return (
    <Box variant="column" className='gap-10 w-full bg-background'>
        <Hero />
        <LatestOffers />
        <AdsSection />
        <WorldOfCar/>
        <RentCar/>
        <SpaceAds/>
          <FAQ/>
    </Box>
  );
};

export default WebPage;
