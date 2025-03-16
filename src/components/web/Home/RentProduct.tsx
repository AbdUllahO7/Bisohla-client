import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'
import { RentProductCard } from '../design/RentProductCard'
import CardAds from '../design/CardAds'
import { getProductsRentData } from '@/constants/ProductsData'

const RentProduct = () => {
        const t = useTranslations('homePage');
            const productsData = getProductsRentData(t);
        

    return (
        <Box variant="container" className="">
                <Box variant="column" >
            <Box variant="column" className="">
                <Text variant="h3" className="font-bold text-[20px] font-cairo">
                    {t('rentProduct.title')}
                </Text>
                <Link href="/AllCities">
                    <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                        {t('rentProduct.showMore')}
                    </Text>
                </Link>
            </Box>
            <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[80%] xs:w-[80%] lg:w-full" variant="center">
                        {productsData.map((product, index) => (
                            <React.Fragment key={index}>
                                <RentProductCard
                                    title={product.title}
                                    marka={product.marka}
                                    price={product.price}
                                    imageSrc={product.imageSrc}
                                    priceWord={t('rentProduct.price')}
                                    details={product.details}
                                    ProductId = {product.id}

                                />
                                {index === 3 && <Box variant="center" className='justify-center items-center'> <Box variant="center" className="justify-center items-center">
                                    <CardAds  isRent= {false}/>
                                </Box></Box>}
                            </React.Fragment>
                        ))}
            </Box>
        
                </Box>
        </Box>
    )
}

export default RentProduct
