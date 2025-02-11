import React from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import CarouselComponent from '../design/CarouselComponent';

const WorldOfProduct = () => {
    const t = useTranslations('homePage');
    const locale = useLocale(); // Get current locale
    const direction = locale === 'ar' ? 'rtl' : 'ltr'; // Determine direction

    const data = [
        { title: t('worldOfProducts.cities.city1.title'), carCount: t('worldOfProducts.cities.city1.productCount'), image: '/assets/images/idlib.png' },
        { title: t('worldOfProducts.cities.city2.title'), carCount: t('worldOfProducts.cities.city2.productCount'), image: '/assets/images/aleppo.png' },
        { title: t('worldOfProducts.cities.city3.title'), carCount: t('worldOfProducts.cities.city3.productCount'), image: '/assets/images/damascus.png' },
        { title: t('worldOfProducts.cities.city4.title'), carCount: t('worldOfProducts.cities.city4.productCount'), image: '/assets/images/hama.png' },
        { title: t('worldOfProducts.cities.city5.title'), carCount: t('worldOfProducts.cities.city5.productCount'), image: '/assets/images/homs.png' },
        { title: t('worldOfProducts.cities.city1.title'), carCount: t('worldOfProducts.cities.city1.productCount'), image: '/assets/images/idlib.png' },
        { title: t('worldOfProducts.cities.city2.title'), carCount: t('worldOfProducts.cities.city2.productCount'), image: '/assets/images/aleppo.png' },
    ];

    return (
        <Box variant="column" className="">
            <Box variant="column" className="">
                <Text variant="h3" className="font-bold text-[20px] font-cairo">
                    {t('worldOfProducts.title')}
                </Text>
                <Link href="/AllCities">
                    <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                        {t('worldOfProducts.showMore')}
                    </Text>
                </Link>
            </Box>
            <Box className="w-full overflow-hidden">
                <CarouselComponent data={data} direction={direction} />
            </Box>
        </Box>
    );
};

export default WorldOfProduct;
