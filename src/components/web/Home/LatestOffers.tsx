import React from 'react';
import Link from 'next/link';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { CarCardItem } from '../design/CarCardItem';
import { useTranslations } from 'next-intl';
import CardAds from '../design/CardAds';

interface LatestOffersProps {
    count?: number; // Optional count of cards to display
    showTitle?: boolean; // Control the visibility of the title and "Show More" link
}

const LatestOffers: React.FC<LatestOffersProps> = ({ count, showTitle = true }) => {
    const t = useTranslations('homePage');

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

    // Slice cardsData based on count or display all cards
    const displayedCards = count ? cardsData.slice(0, count) : cardsData;

    return (
        <Box variant="container" className="mt-20 mb-[100px]">
            <Box variant="column">
                {showTitle && (
                    <Box variant="column" className="mb-10">
                        <Text variant="h3" className="font-bold text-[20px] font-cairo">
                            {t('latestOffers.title')}
                        </Text>
                        <Link href="/cars">
                            <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                                {t('latestOffers.showMore')}
                            </Text>
                        </Link>
                    </Box>
                )}

                {/* Display Cards */}
                <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[80%] xs:w-[80%] lg:w-full" variant="center">
                    {displayedCards.map((card, index) => (
                        <React.Fragment key={index}>
                            <CarCardItem
                                title={card.title}
                                marka={card.marka}
                                price={card.price}
                                imageSrc={card.imageSrc}
                                priceWord={t('latestOffers.price')}
                            />
                            {/* Render CardAds only after the first two cards */}
                            {index === 1 && (
                                <Box variant="center" className="justify-center items-center">
                                    <CardAds />
                                </Box>
                            )}
                        </React.Fragment>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default LatestOffers;
