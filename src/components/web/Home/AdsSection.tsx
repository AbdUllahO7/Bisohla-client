import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl'; // Import useLocale
import Image from 'next/image';
import React from 'react';

const AdsSection = () => {
    const t = useTranslations('homePage');
    const locale = useLocale(); // Get the current language

    // Determine direction based on the language
    const isRTL = locale === 'ar';

    return (
        <Box variant="container" className="flex justify-center p-0" dir="rtl">
            <Box variant="center" className="bg-primary w-[100%] lg:w-full  h-[300px]  text-white relative overflow-hidden rounded-lg">
                {/* Green Circular Background Design */}
                <Box className="hidden lg:block">
                    <Box className="absolute top-0 left-[807px]">
                        {/* Foreground Box */}
                        <Box
                            className="absolute top-0 h-[350px] w-[440px] bg-transparent border-dotted border-r-[809px] border-primary-foreground rounded-br-3xl"
                            style={{ zIndex: 1 }}
                        ></Box>
                        <Box
                            className="absolute top-[-100px] w-[500px] h-[324px] right-[242px] bg-transparent border-dotted border-r-[809px] border-primary rounded-br-3xl"
                            style={{ zIndex: 10 }}
                        ></Box>
                        {/* Image */}
                        <Box
                            className="absolute top-[50px] left-[-800px] w-[600px] z-[10]"
                            style={{ zIndex: 10 }}
                        >
                            <Image
                                src="/assets/images/3-car.png"
                                alt="cars"
                                width={1200}
                                height={1200}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Text and Button Section */}
                <Box
                    className="absolute  lg:right-6 flex flex-col lg:flex-row justify-center lg:justify-between items-center w-full lg:w-[600px] space-y-4 lg:space-y-0"
                    variant="row"
                >
                    <Box
                        variant="column"
                        className="z-[10] text-center lg:text-start justify-center lg:gap-0 lg:justify-start items-center lg:items-start w-full lg:w-[400px]"
                    >
                        <Text
                            variant="h4"
                            className="text-primary-foreground font-bold text-[30px] font-cairo"
                        >
                            {t('adsSection.title')}
                        </Text>
                        <Text
                            variant="h4"
                            className="font-bold text-[36px] lg:text-[70px] font-cairo"
                        >
                            {t('adsSection.bishola')}
                        </Text>
                    </Box>
                    <Box
                        variant="row"
                        className="z-[10] flex justify-center items-center w-full lg:w-auto"
                    >
                        <Link
                            href="https://api.whatsapp.com/send/?phone=905389370863&text&type=phone_number&app_absent=0" target='_blank'
                            className="bg-primary-foreground px-6 py-3 rounded-lg text-center"
                        >
                            <Text className="text-primary font-bold font-cairo text-[20px]">
                                {t('adsSection.startNow')}
                            </Text>
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AdsSection;
