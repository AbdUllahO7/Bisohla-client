import Box from '@/components/box/box';
import AdsSection from '@/components/web/Home/AdsSection';
import FAQ from '@/components/web/Home/FAQ';
import Filter from '@/components/web/Home/Filter';
import Footer from '@/components/web/Home/Footer';
import Hero from '@/components/web/Home/Hero';
import LatestOffers from '@/components/web/Home/LatestOffers';
import RentCar from '@/components/web/Home/RentProduct';
import SpaceAds from '@/components/web/Home/SpaceAds';
import WorldOfCar from '@/components/web/Home/WorldOfProduct';

const WebPage = async () => {
  return (
    <Box variant="column">
      <Hero />
      <Filter />
      <LatestOffers />
      <AdsSection />
      <WorldOfCar/>
      <RentCar/>
      <SpaceAds/>
        <FAQ/>
      <Footer/>
    </Box>
  );
};

export default WebPage;
