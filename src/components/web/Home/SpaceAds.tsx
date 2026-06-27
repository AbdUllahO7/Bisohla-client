'use client';

import Box from "@/components/ui/box"
import Text from "@/components/ui/text"
import AdSpace from "@/components/ads/AdSpace"
import { useTranslations } from "next-intl"
import { useAdSlot } from "@/hooks/use-ad-slot"

const SpaceAds = () => {
  const t = useTranslations('homePage');

  const {
    adsData: leftAds,
    isLoadingAds: leftLoading,
    allowPlaceholders: leftAllowPlaceholders,
    dismissable: leftDismissable,
    rotationStrategy: leftRotationStrategy
  } = useAdSlot('web-home-page-ads-section-left-side');

  const {
    adsData: rightAds,
    isLoadingAds: rightLoading,
    allowPlaceholders: rightAllowPlaceholders,
    dismissable: rightDismissable,
    rotationStrategy: rightRotationStrategy
  } = useAdSlot('web home page ads section right side');

  const FallbackBanner = ({ title, bishola }: { title: string; bishola: string }) => (
    <Box
      variant="center"
      className="w-full h-full relative overflow-hidden bg-primary-light rounded-md"
    >
      {/* border-l-t */}
      <Box className="absolute top-0 left-0 bg-transparent w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] border-r-[40px] sm:border-r-[50px] border-b-[40px] sm:border-b-[50px] border-primary rounded-br-[80px] sm:rounded-br-[100px]"></Box>
      {/* border-b-r */}
      <Box className="absolute bottom-0 right-0 bg-transparent w-[80px] sm:w-[100px] h-[80px] sm:h-[100px] border-l-[40px] sm:border-l-[50px] border-t-[40px] sm:border-t-[50px] border-primary rounded-tl-[80px] sm:rounded-tl-[100px]"></Box>
      {/* text */}
      <Box variant="column" className="text-center">
        <Text
          variant="h4"
          className="text-primary-foreground font-bold text-[18px] sm:text-[20px] md:text-[24px] font-cairo"
        >
          {title}
        </Text>
        <Text
          variant="h4"
          className="font-bold text-[28px] sm:text-[32px] md:text-[36px] lg:text-[64px] font-cairo text-white"
        >
          {bishola}
        </Text>
      </Box>
    </Box>
  );

  return (
    <Box variant="container" className="w-full mx-auto p-0">
      <Box variant="row" className="flex flex-col md:flex-row gap-4 md:gap-6 lg:gap-8">
        <div className="w-full md:w-[48%] min-h-[200px] sm:h-[220px] md:h-[250px] mb-4 md:mb-0">
          <AdSpace
            name="web-home-page-ads-section-left-side"
            className="w-full h-full"
            fallbackContent={<FallbackBanner title={t("spaceAds.box1.title")} bishola={t("spaceAds.box1.bishola")} />}
            isClosable={false}
            adsData={leftAds}
            isLoadingAds={leftLoading}
            allowPlaceholders={leftAllowPlaceholders}
            dismissable={leftDismissable}
            rotationStrategy={leftRotationStrategy}
            layout="banner"
          />
        </div>
        <div className="w-full md:w-[48%] min-h-[200px] sm:h-[220px] md:h-[250px]">
          <AdSpace
            name="web home page ads section right side"
            className="w-full h-full"
            fallbackContent={<FallbackBanner title={t("spaceAds.box2.title")} bishola={t("spaceAds.box2.bishola")} />}
            isClosable={false}
            adsData={rightAds}
            isLoadingAds={rightLoading}
            allowPlaceholders={rightAllowPlaceholders}
            dismissable={rightDismissable}
            rotationStrategy={rightRotationStrategy}
            layout="banner"
          />
        </div>
      </Box>
    </Box>
  );
};

export default SpaceAds;
