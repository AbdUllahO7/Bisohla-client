'use client';

import Text from '@/components/ui/text';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import AdSpace from '@/components/ads/AdSpace';
import { AdContentDto } from '@/core/entities/models/ads/ads.dto';
import { useAdSlot } from '@/hooks/use-ad-slot';
import { cn } from '@/lib/utils';

const StaticAdsSectionProduct = () => {
  const t = useTranslations('homePage');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="w-full py-2">
      <div
        className="w-full h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] relative overflow-hidden rounded-lg"
        style={{ backgroundColor: '#2A3B36' }}
      >
        {/* Lime green diagonal section (Flipped based on locale) */}
        <div className={cn(
          "absolute bottom-0 h-full w-[60%]",
          isRTL ? "left-0" : "right-0"
        )}>
          <div
            className="absolute bottom-0 left-0 w-full h-full"
            style={{
              backgroundColor: '#B6E253',
              clipPath: isRTL 
                ? 'polygon(0 0, 100% 100%, 0 100%)' 
                : 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
          />
        </div>

        {/* Cars image section (Flipped based on locale) */}
        <div className={cn(
          "absolute bottom-0 h-full w-[60%]",
          isRTL ? "left-0" : "right-0"
        )}>
          <div className="relative w-full h-full">
            {/* FOR RENT sign */}
            <div
              className={cn(
                "absolute top-[5%] z-20 rotate-[-15deg] bg-yellow-400 px-1.5 py-0.5 text-[8px] sm:text-xs font-bold border border-black",
                isRTL ? "left-[10%]" : "right-[25%]"
              )}
              style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}
            >
              {isRTL ? 'للإيجار' : 'FOR RENT'}
            </div>

            {/* FOR SALE sign */}
            <div
              className={cn(
                "absolute top-[2%] z-20 rotate-[5deg] bg-yellow-400 px-1.5 py-0.5 text-[8px] sm:text-xs font-bold border border-black",
                isRTL ? "left-[22%]" : "right-[13%]"
              )}
              style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}
            >
              {isRTL ? 'للبيع' : 'FOR SALE'}
            </div>

            {/* Cars image */}
            <div className={cn(
              "absolute bottom-[-10%] w-[110%] h-[110%]",
              isRTL ? "left-[-5%]" : "right-[-5%]"
            )}>
              <Image
                src="/assets/images/3-car.png"
                alt="Cars for rent and sale"
                fill
                style={{ 
                  objectFit: 'contain', 
                  objectPosition: isRTL ? 'left bottom' : 'right bottom' 
                }}
                priority
              />
            </div>
          </div>
        </div>

        {/* Text and button section (Flipped based on locale) */}
        <div className={cn(
          "absolute top-1/2 transform -translate-y-1/2 flex flex-col max-w-[45%] space-y-1 sm:space-y-2 md:space-y-3",
          isRTL 
            ? "right-4 md:right-8 items-end text-right" 
            : "left-4 md:left-8 items-start text-left"
        )}>
          <div className={isRTL ? "text-right w-full" : "text-left w-full"}>
            <Text
              variant="p"
              className="text-[#B6E253] font-bold text-[10px] sm:text-xs md:text-sm lg:text-base font-cairo"
            >
              {isRTL ? 'أنشئ إعلانك معنا' : 'Create your ad with us'}
            </Text>
            <Text
              variant="h2"
              className="text-white font-bold text-lg sm:text-xl md:text-2xl lg:text-4xl font-cairo"
            >
              {isRTL ? 'بسهولة' : 'EASILY'}
            </Text>
          </div>

          <Link
            href="https://api.whatsapp.com/send/?phone=905389370863&text&type=phone_number&app_absent=0"
            target="_blank"
            className="bg-[#B6E253] px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-md text-center inline-block mt-1 sm:mt-2"
          >
            <Text className="text-[#2A3B36] font-bold font-cairo text-[10px] sm:text-xs md:text-sm lg:text-base whitespace-nowrap">
              {isRTL ? 'ابدأ الآن' : 'Start Now'}
            </Text>
          </Link>
        </div>
      </div>
    </div>
  );
};

const AdsSectionProduct = ({ 
  name = 'sale-page-ads-section',
  adIndex,
  adsData: externalAdsData,
  isLoadingAds: externalIsLoadingAds,
  allowPlaceholders: externalAllowPlaceholders,
  dismissable: externalDismissable,
  rotationStrategy: externalRotationStrategy,
  className = 'mt-10',
  layout = 'banner',
}: { 
  name?: string;
  adIndex?: number;
  adsData?: AdContentDto[];
  isLoadingAds?: boolean;
  allowPlaceholders?: boolean;
  dismissable?: boolean;
  rotationStrategy?: 'priority' | 'round_robin' | 'random';
  className?: string;
  layout?: 'card' | 'banner';
}) => {
  // Use the hook internally when no external data is provided
  const hookResult = useAdSlot(externalAdsData !== undefined ? '' : name);

  const adsData = externalAdsData !== undefined ? externalAdsData : hookResult.adsData;
  const isLoadingAds = externalIsLoadingAds !== undefined ? externalIsLoadingAds : hookResult.isLoadingAds;
  const allowPlaceholders = externalAllowPlaceholders !== undefined ? externalAllowPlaceholders : hookResult.allowPlaceholders;
  const dismissable = externalDismissable !== undefined ? externalDismissable : hookResult.dismissable;
  const rotationStrategy = externalRotationStrategy !== undefined ? externalRotationStrategy : hookResult.rotationStrategy;

  return (
    <AdSpace
      name={name}
      className={`w-full ${className}`}
      fallbackContent={<StaticAdsSectionProduct />}
      isClosable={false}
      adIndex={adIndex}
      adsData={adsData}
      isLoadingAds={isLoadingAds}
      allowPlaceholders={allowPlaceholders}
      dismissable={dismissable}
      rotationStrategy={rotationStrategy}
      layout={layout}
    />
  );
};

export default AdsSectionProduct;
