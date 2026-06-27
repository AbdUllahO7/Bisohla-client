import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';

const CardAds = ({ isRent }: { isRent?: boolean }) => {
  const t = useTranslations('homePage');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <Box variant="column" className="w-full h-full flex flex-col justify-stretch items-stretch">
      <Card className="w-full h-full min-h-[395px] border-none rounded-3xl bg-white dark:bg-zinc-900 shadow-md hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 ease-out overflow-hidden flex flex-col">
        
        {/* Top Half: Promotional Banner Graphic */}
        <div 
          className="relative w-full h-48 flex-shrink-0 overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: '#2A3B36' }}
        >
          {/* Decorative Lime Diagonal */}
          <div 
            className="absolute bottom-0 right-0 h-full w-[50%]"
            style={{
              backgroundColor: '#B6E253',
              clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            }}
          />

          {/* Cars Image */}
          <div className="absolute bottom-[-10%] left-4 w-[75%] h-[95%]">
            <Image
              src="/assets/images/3-car.png"
              alt="Bishola Ads"
              fill
              className="object-contain object-left-bottom"
              sizes="(max-width: 768px) 100vw, 30vw"
            />
          </div>

          {/* Sponsored Tag */}
          <div className={cn(
            "absolute top-4 bg-white/20 dark:bg-black/20 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white rounded-full uppercase tracking-wider",
            isRTL ? "right-4" : "left-4"
          )}>
            {isRTL ? 'إعلان ممول' : 'Sponsored'}
          </div>
        </div>

        {/* Bottom Half: Content and CTA button */}
        <div className="p-5 flex-1 flex flex-col justify-between items-stretch">
          
          <div className={cn("space-y-2 flex-1 flex flex-col justify-center", isRTL ? "text-right" : "text-left")}>
            <Text 
              variant="p" 
              className="text-xs font-semibold text-primary dark:text-[#ABDE3B] uppercase tracking-wider"
            >
              {isRTL ? 'مساحة إعلانية' : 'ADVERTISEMENT'}
            </Text>
            
            <Text 
              variant="h4" 
              className="font-bold font-cairo text-lg leading-snug text-gray-800 dark:text-zinc-100 line-clamp-3"
            >
              {t('productAds.title')}
            </Text>
          </div>

          <a 
            href="mailto:bishola4h@gmail.com" 
            className="w-full mt-6 py-3 bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-extrabold font-cairo text-sm text-center rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95 cursor-pointer block"
          >
            {t('productAds.description')}
          </a>

        </div>
      </Card>
    </Box>
  );
};

export default CardAds;