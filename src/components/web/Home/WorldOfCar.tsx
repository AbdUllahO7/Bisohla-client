import React from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import CarouselComponent from '../design/CarouselComponent';

const WorldOfCar = () => {
    const t = useTranslations('homePage');
    const locale = useLocale(); // Get current locale
    const direction = locale === 'ar' ? 'rtl' : 'ltr'; // Determine direction

    const data = [
        { title: t('worldOfCars.cities.city1.title'), carCount: t('worldOfCars.cities.city1.carCount'), image: '/assets/images/idlib.png' },
        { title: t('worldOfCars.cities.city2.title'), carCount: t('worldOfCars.cities.city2.carCount'), image: '/assets/images/aleppo.png' },
        { title: t('worldOfCars.cities.city3.title'), carCount: t('worldOfCars.cities.city3.carCount'), image: '/assets/images/damascus.png' },
        { title: t('worldOfCars.cities.city4.title'), carCount: t('worldOfCars.cities.city4.carCount'), image: '/assets/images/hama.png' },
        { title: t('worldOfCars.cities.city5.title'), carCount: t('worldOfCars.cities.city5.carCount'), image: '/assets/images/homs.png' },
        { title: t('worldOfCars.cities.city1.title'), carCount: t('worldOfCars.cities.city1.carCount'), image: '/assets/images/idlib.png' },
        { title: t('worldOfCars.cities.city2.title'), carCount: t('worldOfCars.cities.city2.carCount'), image: '/assets/images/aleppo.png' },
    ];

    return (
        <Box variant="column" className="mb-[100px]">
            <Box variant="column" className="mb-10">
                <Text variant="h3" className="font-bold text-[20px] font-cairo">
                    {t('worldOfCars.title')}
                </Text>
                <Link href="/AllCities">
                    <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                        {t('worldOfCars.showMore')}
                    </Text>
                </Link>
            </Box>
            <Box className="w-full overflow-hidden">
                <CarouselComponent data={data} direction={direction} />
            </Box>
        </Box>
    );
};

export default WorldOfCar;
