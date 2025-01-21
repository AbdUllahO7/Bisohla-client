import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'
import { RentCarCard } from '../design/RentCarCard'
import CardAds from '../design/CardAds'

const RentCar = () => {
        const t = useTranslations('homePage');
        const cardsData = [
            { 
                title: t('rentCar.cars.car1.title'), 
                marka: t('rentCar.cars.car1.marka'),  
                price: t('rentCar.cars.car1.price'),     
                imageSrc: '/assets/images/car-card.png',
                details: {
                    gaz: t('rentCar.cars.car1.details.basic.gaz'),
                    type: t('rentCar.cars.car1.details.basic.type'),
                    }, 
            },
            { title: t('rentCar.cars.car2.title'), 
                marka: t('rentCar.cars.car2.marka'), 
                price: t('rentCar.cars.car2.price'),   
                imageSrc: '/assets/images/car-card.png', 
                details: {
                    gaz: t('rentCar.cars.car1.details.basic.gaz'),
                    type: t('rentCar.cars.car1.details.basic.type'),
                    },
            },
            { title: t('rentCar.cars.car3.title'), 
                marka: t('rentCar.cars.car3.marka'), 
                price: t('rentCar.cars.car3.price'),
                imageSrc: '/assets/images/car-card.png',   
                details: {
                gaz: t('rentCar.cars.car1.details.basic.gaz'),
                type: t('rentCar.cars.car1.details.basic.type'),
                }, 
            },
            { title: t('rentCar.cars.car4.title'), 
                marka: t('rentCar.cars.car4.marka'), 
                price: t('rentCar.cars.car4.price'), 
                imageSrc: '/assets/images/car-card.png',   
                details: {
                gaz: t('rentCar.cars.car1.details.basic.gaz'),
                type: t('rentCar.cars.car1.details.basic.type'),
                }, 
            },
            { title: t('rentCar.cars.car5.title'), 
                marka: t('rentCar.cars.car5.marka'), 
                price: t('rentCar.cars.car5.price'),   
                imageSrc: '/assets/images/car-card.png',
                details: {
                gaz: t('rentCar.cars.car1.details.basic.gaz'),
                type: t('rentCar.cars.car1.details.basic.type'),
                }, 
            },
            { title: t('rentCar.cars.car6.title'), 
                marka: t('rentCar.cars.car6.marka'), 
                price: t('rentCar.cars.car6.price'),  
                imageSrc: '/assets/images/car-card.png' , 
                details: {
                gaz: t('rentCar.cars.car1.details.basic.gaz'),
                type: t('rentCar.cars.car1.details.basic.type'),
                }, 
            },
            { title: t('rentCar.cars.car7.title'),
                marka: t('rentCar.cars.car7.marka'), 
                price: t('rentCar.cars.car7.price'), 
                imageSrc: '/assets/images/car-card.png', 
                details: {
                gaz: t('rentCar.cars.car1.details.basic.gaz'),
                type: t('rentCar.cars.car1.details.basic.type'),
                }, 
            },
            { title: t('rentCar.cars.car8.title'), 
                marka: t('rentCar.cars.car8.marka'), 
                price: t('rentCar.cars.car8.price'),
                imageSrc: '/assets/images/car-card.png',   
                details: {
                gaz: t('rentCar.cars.car1.details.basic.gaz'),
                type: t('rentCar.cars.car1.details.basic.type'),
                }, 
            },
            { title: t('rentCar.cars.car9.title'), 
                marka: t('rentCar.cars.car9.marka'), 
                price: t('rentCar.cars.car9.price'),  
                imageSrc: '/assets/images/car-card.png' ,
                details: {
                gaz: t('rentCar.cars.car1.details.basic.gaz'),
                type: t('rentCar.cars.car1.details.basic.type'),
                }, 
            },
    
        ];

    return (
        <Box variant="container" className="mb-[100px]">
                <Box variant="column" >
            <Box variant="column" className="mb-10">
                <Text variant="h3" className="font-bold text-[20px] font-cairo">
                    {t('rentCar.title')}
                </Text>
                <Link href="/AllCities">
                    <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                        {t('rentCar.showMore')}
                    </Text>
                </Link>
            </Box>
            <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[80%] xs:w-[80%] " variant="center">
                        {cardsData.map((card, index) => (
                            <React.Fragment key={index}>
                                <RentCarCard
                                    title={card.title}
                                    marka={card.marka}
                                    price={card.price}
                                    imageSrc={card.imageSrc}
                                    priceWord={t('rentCar.price')}
                                    details={card.details}
                                />
                                {index === 3 && <Box variant="center" className='justify-center items-center'><CardAds /></Box>} {/* Render CardAds only after the first two cards */}
                            </React.Fragment>
                        ))}
            </Box>
        
                </Box>
        </Box>
    )
}

export default RentCar
