import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'
import { RentProductCard } from '../design/RentProductCard'
import CardAds from '../design/CardAds'

const RentProduct = () => {
        const t = useTranslations('homePage');
        const productsData = [
            { 
                title: t('rentProduct.products.product1.title'), 
                marka: t('rentProduct.products.product1.marka'),  
                price: t('rentProduct.products.product1.price'),     
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                    gaz: t('rentProduct.products.product1.details.basic.gaz'),
                    type: t('rentProduct.products.product1.details.basic.type'),
                    }, 
            },
            { title: t('rentProduct.products.product2.title'), 
                marka: t('rentProduct.products.product2.marka'), 
                price: t('rentProduct.products.product2.price'),   
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                    gaz: t('rentProduct.products.product1.details.basic.gaz'),
                    type: t('rentProduct.products.product1.details.basic.type'),
                    },
            },
            { title: t('rentProduct.products.product3.title'), 
                marka: t('rentProduct.products.product3.marka'), 
                price: t('rentProduct.products.product3.price'),
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                gaz: t('rentProduct.products.product1.details.basic.gaz'),
                type: t('rentProduct.products.product1.details.basic.type'),
                }, 
            },
            { title: t('rentProduct.products.product4.title'), 
                marka: t('rentProduct.products.product4.marka'), 
                price: t('rentProduct.products.product4.price'), 
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                gaz: t('rentProduct.products.product1.details.basic.gaz'),
                type: t('rentProduct.products.product1.details.basic.type'),
                }, 
            },
            { title: t('rentProduct.products.product5.title'), 
                marka: t('rentProduct.products.product5.marka'), 
                price: t('rentProduct.products.product5.price'),   
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                gaz: t('rentProduct.products.product1.details.basic.gaz'),
                type: t('rentProduct.products.product1.details.basic.type'),
                }, 
            },
            { title: t('rentProduct.products.product6.title'), 
                marka: t('rentProduct.products.product6.marka'), 
                price: t('rentProduct.products.product6.price'),  
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                gaz: t('rentProduct.products.product1.details.basic.gaz'),
                type: t('rentProduct.products.product1.details.basic.type'),
                }, 
            },
            { title: t('rentProduct.products.product7.title'),
                marka: t('rentProduct.products.product7.marka'), 
                price: t('rentProduct.products.product7.price'), 
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                gaz: t('rentProduct.products.product1.details.basic.gaz'),
                type: t('rentProduct.products.product1.details.basic.type'),
                }, 
            },
            { title: t('rentProduct.products.product8.title'), 
                marka: t('rentProduct.products.product8.marka'), 
                price: t('rentProduct.products.product8.price'),
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                gaz: t('rentProduct.products.product1.details.basic.gaz'),
                type: t('rentProduct.products.product1.details.basic.type'),
                }, 
            },
            { title: t('rentProduct.products.product9.title'), 
                marka: t('rentProduct.products.product9.marka'), 
                price: t('rentProduct.products.product9.price'),  
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                gaz: t('rentProduct.products.product1.details.basic.gaz'),
                type: t('rentProduct.products.product1.details.basic.type'),
                }, 
            },
    
        ];

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
            <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[80%] xs:w-[80%] lg:w-full " variant="center">
                        {productsData.map((product, index) => (
                            <React.Fragment key={index}>
                                <RentProductCard
                                    title={product.title}
                                    marka={product.marka}
                                    price={product.price}
                                    imageSrc={product.imageSrc}
                                    priceWord={t('rentProduct.price')}
                                    details={product.details}
                                />
                                {index === 3 && <Box variant="center" className='justify-center items-center'><CardAds /></Box>} {/* Render productdAds only after the first two productds */}
                            </React.Fragment>
                        ))}
            </Box>
        
                </Box>
        </Box>
    )
}

export default RentProduct
