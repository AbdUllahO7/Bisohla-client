import React from 'react';
import Link from 'next/link';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import CardAds from '../design/CardAds';
import { ProductCardItem } from '../design/ProductCardItem';
import { getProductsData } from '@/constants/ProductsData';
import { LatestOffersProps } from '@/types/homePageTypes';



const LatestOffers: React.FC<LatestOffersProps> = ({ count, showTitle = true }) => {
    const t = useTranslations('homePage');

    const ProductsData = getProductsData(t);


    // Slice cardsData based on count or display all cards
    const displayedCards = count ? ProductsData.slice(0, count) : ProductsData;

    return (
        <Box variant="container" className="mt-2 mb-[10px]">
            <Box variant="column">
                {showTitle && (
                    <Box variant="column" className="mb-10">
                        <Text variant="h3" className="font-bold text-[20px] font-cairo">
                            {t('latestOffers.title')}
                        </Text>
                        <Link href="/products">
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
                            <ProductCardItem
                                title={card.title}
                                marka={card.marka}
                                price={card.price}
                                imageSrc={card.imageSrc}
                                ProductId = {card.id}
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
