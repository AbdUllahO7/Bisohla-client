'use client';

import Text from '@/components/text/text';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import AdSpace from '@/components/ads/AdSpace';

const StaticAdsSectionProduct = () => {
  const t = useTranslations('homePage');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <div className="w-full py-6">
      <div
        className="w-full h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] relative overflow-hidden rounded-lg"
        style={{ backgroundColor: '#2A3B36' }}
      >
        {/* Lime green diagonal section */}
        <div className="absolute bottom-0 left-0 w-[60%] h-full">
          <div
            className="absolute bottom-0 left-0 w-full h-full"
            style={{
              backgroundColor: '#B6E253',
              clipPath: 'polygon(0 0, 100% 100%, 0 100%)',
            }}
          />
        </div>

        {/* Cars image section */}
        <div className="absolute bottom-0 left-0 w-[60%] h-full">
          <div className="relative w-full h-full">
            {/* FOR RENT sign */}
            <div
              className="absolute top-[5%] left-[10%] z-20 rotate-[-15deg] bg-yellow-400 px-1.5 py-0.5 text-[8px] sm:text-xs font-bold border border-black"
              style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}
            >
              {isRTL ? 'للإيجار' : 'FOR RENT'}
            </div>

            {/* FOR SALE sign */}
            <div
              className="absolute top-[2%] left-[22%] z-20 rotate-[5deg] bg-yellow-400 px-1.5 py-0.5 text-[8px] sm:text-xs font-bold border border-black"
              style={{ boxShadow: '1px 1px 0 rgba(0,0,0,0.5)' }}
            >
              {isRTL ? 'للبيع' : 'FOR SALE'}
            </div>

            {/* Cars image */}
            <div className="absolute bottom-[-10%] left-[-5%] w-[110%] h-[110%]">
              <Image
                src="/assets/images/3-car.png"
                alt="Cars for rent and sale"
                fill
                style={{ objectFit: 'contain', objectPosition: 'left bottom' }}
                priority
              />
            </div>
          </div>
        </div>

        {/* Text and button section */}
        <div className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 flex flex-col items-end max-w-[40%] space-y-1 sm:space-y-2 md:space-y-3">
          <div className="text-right w-full">
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

const AdsSectionProduct = () => {
  return (
    <AdSpace
      name="sale-page-ads-section"
      className="w-full"
      fallbackContent={<StaticAdsSectionProduct />}
      isClosable={false}
    />
  );
};

export default AdsSectionProduct;
