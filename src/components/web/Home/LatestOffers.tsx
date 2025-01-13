import React from 'react';
import Link from 'next/link';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { CarCardItem } from '../design/CarCardItem';
import { getTranslations } from 'next-intl/server';

const LatestOffers = async () => {
    const t = await getTranslations('homePage');

    console.log(t('latestOffers.cars.car1.title'));

    const cardsData = [
        { title: t('latestOffers.cars.car1.title'), marka: t('latestOffers.cars.car1.marka'), price: t('latestOffers.cars.car1.price'), imageSrc: '/assets/images/car-card.png' },
        { title: t('latestOffers.cars.car2.title'), marka: t('latestOffers.cars.car2.marka'), price: t('latestOffers.cars.car2.price'), imageSrc: '/assets/images/car-card.png' },
        { title: t('latestOffers.cars.car3.title'), marka: t('latestOffers.cars.car3.marka'), price: t('latestOffers.cars.car3.price'), imageSrc: '/assets/images/car-card.png' },
        { title: t('latestOffers.cars.car4.title'), marka: t('latestOffers.cars.car4.marka'), price: t('latestOffers.cars.car4.price'), imageSrc: '/assets/images/car-card.png' },
        { title: t('latestOffers.cars.car5.title'), marka: t('latestOffers.cars.car5.marka'), price: t('latestOffers.cars.car5.price'), imageSrc: '/assets/images/car-card.png' },
        { title: t('latestOffers.cars.car6.title'), marka: t('latestOffers.cars.car6.marka'), price: t('latestOffers.cars.car6.price'), imageSrc: '/assets/images/car-card.png' },
        { title: t('latestOffers.cars.car7.title'), marka: t('latestOffers.cars.car7.marka'), price: t('latestOffers.cars.car7.price'), imageSrc: '/assets/images/car-card.png' },
        { title: t('latestOffers.cars.car8.title'), marka: t('latestOffers.cars.car8.marka'), price: t('latestOffers.cars.car8.price'), imageSrc: '/assets/images/car-card.png' },
        { title: t('latestOffers.cars.car9.title'), marka: t('latestOffers.cars.car9.marka'), price: t('latestOffers.cars.car9.price'), imageSrc: '/assets/images/car-card.png' },
    ];

    return (
        <Box variant="container" className='mt-20'>
            <Box variant="column">
                <Box variant="column">
                    <Text variant="h3" className="font-bold">
                        {t('latestOffers.title')}
                    </Text>
                    <Link href="/AllLatestOffers">
                        <Text variant="mid">{t('latestOffers.showMore')}</Text>
                    </Link>
                </Box>
                <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 ">
                    {cardsData.map((card, index) => (
                        <CarCardItem
                            key={index}
                            title={card.title}
                            marka={card.marka}
                            price={card.price}
                            imageSrc={card.imageSrc}
                        />
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default LatestOffers;
