import Box from '@/components/box/box';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import CategoryCarousel from '../design/CategoryCarousel';

const Categories = () => {
    const t = useTranslations('productsPage');
    const locale = useLocale(); // Get current locale
    const direction = locale === 'ar' ? 'rtl' : 'ltr'; // Determine direction

    const categories = [
        { title: t('categories.cat_name_one'), carCount: '1', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_tow'), carCount: '2', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_three'), carCount: '3', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_four'), carCount: '4', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_five'), carCount: '5', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_six'), carCount: '6', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_one'), carCount: '1', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_tow'), carCount: '2', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_three'), carCount: '3', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_four'), carCount: '4', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_five'), carCount: '5', image: '/assets/icons/001-car.png' },
        { title: t('categories.cat_name_six'), carCount: '6', image: '/assets/icons/001-car.png' },
    ];

    return (
        <Box className="xs:w-[300px] md:w-[600px]  lg:w-full xs:mt-10 lg:m-0">
                <CategoryCarousel data={categories} direction={direction} />
        </Box>
    );
};

export default Categories;
