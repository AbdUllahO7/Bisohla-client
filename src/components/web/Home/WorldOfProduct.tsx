'use client';

import React, { useMemo } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import {Link} from "@/i18n/routing"
import { useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import CarouselComponent from '../design/CarouselComponent';
import { useProductStepOne } from '@/components/web/ProductsPage/addProducts/StepOne/hooks';

const WorldOfProduct = () => {
    const t = useTranslations('homePage');
    const locale = useLocale(); // Get current locale
    const direction = locale === 'ar' ? 'rtl' : 'ltr'; // Determine direction
    const router = useRouter();

    // Initialize the hook with a dummy validation handler
    const handleValidationChange = (isValid: boolean) => {};
    
    // Use the hook to get governorate options
    const { governorateOptions } = useProductStepOne(handleValidationChange);

    // Create an enhanced data array with governorate IDs
    const carouselData = useMemo(() => {
        const citiesData = [
        
            { 
                title: t('worldOfProducts.cities.aleppo.title'), 
                carCount: t('worldOfProducts.cities.aleppo.productCount'), 
                image: '/assets/images/aleppo.png' 
            },
            { 
                title: t('worldOfProducts.cities.damascus.title'), 
                carCount: t('worldOfProducts.cities.damascus.productCount'), 
                image: '/assets/images/damascus.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.hama.title'), 
                carCount: t('worldOfProducts.cities.hama.productCount'), 
                image: '/assets/images/hama.png' 
            },
            { 
                title: t('worldOfProducts.cities.idlib.title'), 
                carCount: t('worldOfProducts.cities.idlib.productCount'), 
                image: '/assets/images/idlib.png' 
            },
            { 
                title: t('worldOfProducts.cities.homs.title'), 
                carCount: t('worldOfProducts.cities.homs.productCount'), 
                image: '/assets/images/homs.png' 
            },
            { 
                title: t('worldOfProducts.cities.latakia.title'), 
                carCount: t('worldOfProducts.cities.latakia.productCount'), 
                image: '/assets/images/latakia.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.tartus.title'), 
                carCount: t('worldOfProducts.cities.tartus.productCount'), 
                image: '/assets/images/tartus.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.daraa.title'), 
                carCount: t('worldOfProducts.cities.daraa.productCount'), 
                image: '/assets/images/draa.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.quneitra.title'), 
                carCount: t('worldOfProducts.cities.quneitra.productCount'), 
                image: '/assets/images/quneitra.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.as_suwayda.title'), 
                carCount: t('worldOfProducts.cities.as_suwayda.productCount'), 
                image: '/assets/images/as_suwayda.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.deir_ez_zor.title'), 
                carCount: t('worldOfProducts.cities.deir_ez_zor.productCount'), 
                image: '/assets/images/deir_ez_zor.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.raqqa.title'), 
                carCount: t('worldOfProducts.cities.raqqa.productCount'), 
                image: '/assets/images/raqqa.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.al_hasakah.title'), 
                carCount: t('worldOfProducts.cities.al_hasakah.productCount'), 
                image: '/assets/images/al_hasakah.jpg' 
            },
            { 
                title: t('worldOfProducts.cities.rif_dimashq.title'), 
                carCount: t('worldOfProducts.cities.rif_dimashq.productCount'), 
                image: '/assets/images/rif_dimashq.jpg' 
            },
        ];

        // Match the city names with governorate options to get the IDs
        return citiesData.map(city => {
            // Find matching governorate by name
            const matchingGov = governorateOptions.find(gov => 
                gov.label.toLowerCase() === city.title.toLowerCase()
            );
            
            return {
                ...city,
                governorateId: matchingGov ? matchingGov.value : undefined
            };
        });
    }, [t, governorateOptions]);

    // Handle city click to navigate to products page with filter
    const handleCityClick = (cityTitle: string, governorateId?: string) => {
        // If we have a governorate ID, use it; otherwise, try to match by name
        const govId = governorateId || 
            governorateOptions.find(gov => gov.label.toLowerCase() === cityTitle.toLowerCase())?.value;
            
        if (govId) {
            // Create URL parameters
            const params = new URLSearchParams();
            params.set("governorate", govId);
            
            // Navigate to products page with filter
            router.push(`/products?${params.toString()}`);
        }
    };

    return (
        <Box variant="column" className="w-full">
            <Box variant="column" className="">
                <Text variant="h3" className="font-bold text-[20px] font-cairo mb-5">
                    {t('worldOfProducts.title')}
                </Text>
                {/* <Link href="/AllCities">
                    <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                        {t('worldOfProducts.showMore')}
                    </Text>
                </Link> */}
            </Box>
            <Box className="w-full overflow-hidden">
                <CarouselComponent 
                    data={carouselData} 
                    direction={direction} 
                    onCityClick={handleCityClick}
                />
            </Box>
        </Box>
    );
};

export default WorldOfProduct;