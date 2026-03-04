"use client"

import Box from "@/components/box/box"
import AdSpace from "@/components/ads/AdSpace"
import { useTranslations } from "next-intl"

const SpaceAds = () => {
  const t = useTranslations('homePage');

  const FallbackBanner = ({ icon }: { icon: string }) => (
    <div
      className="w-full h-full flex flex-col items-center justify-center rounded-xl text-white text-center p-6 gap-3"
      style={{
        background: 'linear-gradient(135deg, #198341 0%, #0f5c2e 50%, #1a6b39 100%)',
      }}
    >
      <div className="text-5xl mb-2">{icon}</div>
      <h3 className="text-lg font-bold leading-tight">{t('ads.advertiseTitle')}</h3>
      <p className="text-sm opacity-80 max-w-[180px]">{t('ads.advertiseSubtitle')}</p>
      <span className="mt-2 px-4 py-1.5 bg-white text-primary font-semibold rounded-full text-sm">
        {t('ads.advertiseButton')}
      </span>
    </div>
  );

  return (
    <Box variant="container" className="w-full mx-auto p-0">
      <Box variant="row" className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
        <div className="w-full md:w-[48%] min-h-[200px] sm:h-[220px] md:h-[250px]">
          <AdSpace
            name="web-home-page-ads-section-left-side"
            className="w-full h-full"
            fallbackContent={<FallbackBanner icon="🚗" />}
          />
        </div>
        <div className="w-full md:w-[48%] min-h-[200px] sm:h-[220px] md:h-[250px]">
          <AdSpace
            name="web-home-page-ads-section-right-side"
            className="w-full h-full"
            fallbackContent={<FallbackBanner icon="💰" />}
          />
        </div>
      </Box>
    </Box>
  );
};

export default SpaceAds
