"use client"

import Box from "@/components/box/box"
import Text from "@/components/text/text"
import { useTranslations } from "next-intl"
import AdSpace from "@/components/ads/AdSpace"

const SpaceAds = () => {
  return (
    <Box variant="container" className="w-full mx-auto p-0">
      <Box variant="row" className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
        <AdSpace name="web-home-page-ads-section-left-side" className="w-full md:w-[48%] min-h-[200px] sm:h-[220px] md:h-[250px]" />
        <AdSpace name="web-home-page-ads-section-right-side" className="w-full md:w-[48%] min-h-[200px] sm:h-[220px] md:h-[250px]" />
      </Box>
    </Box>
  );
};

export default SpaceAds
