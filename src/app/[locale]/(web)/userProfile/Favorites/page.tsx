import Box from '@/components/box/box'
import { ProductCardItem } from '@/components/web/design/ProductCardItem';
import { getProductsData } from '@/constants/ProductsData';
import { useTranslations } from 'next-intl';
import React from 'react'

const UserFavorites= () => {
        const t = useTranslations('homePage');
        const ProductsData = getProductsData(t);
    return (
        <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[80%] xs:w-[100%] lg:w-full" variant="center">
                    {ProductsData.map((card, index) => (
                        <React.Fragment key={index}>
                            <ProductCardItem
                                title={card.title}
                                marka={card.marka}
                                price={card.price}
                                imageSrc={card.imageSrc}
                                ProductId = {card.id}
                                priceWord={t('latestOffers.price')}
                            />
                        </React.Fragment>
                    ))}
                </Box>
    )
}

export default UserFavorites
