import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTranslations } from 'next-intl';
import Box from '@/components/box/box';
import {  CarFront, Info, LayoutGridIcon, MapPinIcon } from 'lucide-react';

const TabsSection = () => {
        const t = useTranslations('product');
    
    return (
        <Box className='' >
                <Tabs defaultValue="account" className="w-full " >
                <TabsList className='bg-transparent gap-8'>


                <TabsTrigger 
                    className="bg-white font-bold px-10 py-2 flex gap-8 transition-colors text-primary-light data-[state=active]:bg-primary-light data-[state=active]:text-white"
                    value="productDetails"  >
                        {t('tabs.productDetails')}
                        <span className=" transition-colors data-[state=active]:text-white">
                                    <LayoutGridIcon />
                        </span>
                </TabsTrigger>
            
                <TabsTrigger                     
                    className="bg-white font-bold px-10 py-2 flex gap-8 transition-colors text-primary-light data-[state=active]:bg-primary-light data-[state=active]:text-white"
                    value="productInfo"  >
                        {t('tabs.productInfo')}
                        <span className=" transition-colors data-[state=active]:text-white">
                                <CarFront />
                        </span>
                </TabsTrigger>
            
                <TabsTrigger
                    className="bg-white font-bold px-10 py-2 flex gap-8 transition-colors text-primary-light data-[state=active]:bg-primary-light data-[state=active]:text-white"
                    value="location"
                    >
                    {t('tabs.location')}
                    <span className=" transition-colors data-[state=active]:text-white">
                        <MapPinIcon />
                    </span>
                </TabsTrigger>

                <TabsTrigger                     
                className="bg-white font-bold px-10 py-2 flex gap-8 transition-colors text-primary-light data-[state=active]:bg-primary-light data-[state=active]:text-white"
                        value="adsInfo"  >
                            {t('tabs.adsInfo')}
                            <span className=" transition-colors data-[state=active]:text-white">
                                <Info />
                            </span>
                </TabsTrigger>


                </TabsList>
                <TabsContent value="location">Make changes to your account here.</TabsContent>
                <TabsContent value="adsInfo">Change your password here.</TabsContent>
                <TabsContent value="productInfo">Change your password here.</TabsContent>
                <TabsContent value="productDetails">Change your password here.</TabsContent>

                </Tabs>

    </Box>
    )
}

export default TabsSection
