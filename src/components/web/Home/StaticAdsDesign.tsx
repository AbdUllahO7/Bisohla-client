'use client';

import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import Image from 'next/image';
import React from 'react';
import { cn } from '@/lib/utils';

/**
 * StaticAdsDesign — the original Bishola full-width promotional banner.
 * Shown as a fallback whenever no dynamic ad is configured for a slot.
 */
const StaticAdsDesign = () => {
    const t = useTranslations('homePage');
    const locale = useLocale();
    const isRTL = locale === 'ar';

    return (
        <div 
            className="w-full h-[300px] relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#198341] to-[#0d4f24] text-white shadow-xl flex items-center"
            dir={isRTL ? 'rtl' : 'ltr'}
        >
            {/* Background Decorative Elements */}
            <div className={cn(
                "absolute w-72 h-72 rounded-full bg-white/5 blur-3xl",
                isRTL ? "left-12 top-6" : "right-12 top-6"
            )} />
            <div className={cn(
                "absolute w-60 h-60 rounded-full bg-[#B6E253]/10 blur-3xl",
                isRTL ? "left-24 bottom-6" : "right-24 bottom-6"
            )} />

            {/* Content Area */}
            <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center justify-between h-full w-full relative z-10">
                
                {/* Text and Button Section */}
                <div className={cn(
                    "flex flex-col justify-center max-w-full md:max-w-[50%] space-y-4 md:space-y-6 text-center w-full md:w-auto",
                    isRTL ? "md:text-right md:items-start" : "md:text-left md:items-start"
                )}>
                    <div className="space-y-1">
                        <Text
                            variant="h4"
                            className="text-[#B6E253] font-bold text-xl md:text-2xl font-cairo tracking-wide"
                        >
                            {t('adsSection.title')}
                        </Text>
                        <Text
                            variant="h2"
                            className="font-extrabold text-4xl md:text-6xl font-cairo tracking-tight text-white drop-shadow-md"
                        >
                            {t('adsSection.bishola')}
                        </Text>
                    </div>

                    <div>
                        <Link
                            href="https://api.whatsapp.com/send/?phone=905389370863&text&type=phone_number&app_absent=0"
                            target="_blank"
                            className="inline-block bg-[#B6E253] hover:bg-[#a5cd45] text-[#2A3B36] font-extrabold font-cairo text-lg px-8 py-3.5 rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 duration-200"
                        >
                            {t('adsSection.startNow')}
                        </Link>
                    </div>
                </div>

                {/* Image Section */}
                <div className={cn(
                    "hidden md:flex relative h-[90%] w-[45%] items-center select-none",
                    isRTL ? "justify-start" : "justify-end"
                )}>
                    <div className="relative w-full h-full max-w-[450px]">
                        <Image
                            src="/assets/images/3-car.png"
                            alt="Bishola promotional cars"
                            fill
                            className="object-contain object-center drop-shadow-[0_15px_15px_rgba(0,0,0,0.3)]"
                            priority
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaticAdsDesign;
