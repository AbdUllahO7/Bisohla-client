import Box from '@/components/box/box';
import Filter from '@/components/web/Home/Filter';
import Hero from '@/components/web/Home/Hero';
import LatestOffers from '@/components/web/Home/LatestOffers';

const WebPage = async () => {
  return (
    <Box variant="column">
      <Hero />
      <Filter />
      <LatestOffers />
    </Box>
  );
};

export default WebPage;
