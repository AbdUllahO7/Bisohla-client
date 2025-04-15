import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';
import Box from '@/components/box/box';
import { CarFront, Info, LayoutGridIcon, MapPinIcon } from 'lucide-react';
import AccordionDetails from './AccordionDetails';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import AccordionProductDetails from './Tabs/AccordionProductDetails';
import AccordionProductSafety from './Tabs/AccordionProductSafety';
import LatestOffers from '../../Home/LatestOffers';
import CarDetailsContent from './Tabs/CarDetailsContent';

const TabsSection = ( {data}) => {
    const t = useTranslations('product');
    // Hardcoded data (using translations for dynamic content)
    // const data = [
    //     { question: t('accordionDetails.questions.question1.question'), answer: t('accordionDetails.questions.question1.answer') },
    //     { question: t('accordionDetails.questions.question2.question'), answer: t('accordionDetails.questions.question2.answer') },
    // ];

    return (
        <Box variant='column' className='justify-start items-start w-full'>
        <Tabs defaultValue="account" className="flex-wrap mb-10">
            <TabsList className='bg-transparent gap-8 flex-wrap lg:min-h-[100%] md:min-h-[200px] xs:min-h-[400px]'>
                <TabsTrigger 
                    className="bg-white hover:bg-primary group duration-500 font-bold px-10 py-5 min-w-[225px] flex gap-4 items-center transition-colors text-primary-light data-[state=active]:bg-primary-light data-[state=active]:text-white"
                    value="productDetails">
                <LayoutGridIcon />
                <span className="transition-colors data-[state=active]:text-white group-hover:text-white duration-500">
                    {t('tabs.productDetails')}
                </span>
                </TabsTrigger>

                <TabsTrigger 
                className="bg-white hover:bg-primary group duration-500 font-bold  px-10 py-5 min-w-[225px] flex gap-4 items-center transition-colors text-primary-light data-[state=active]:bg-primary-light data-[state=active]:text-white"
                value="productInfo">
                <CarFront />
                <span className="transition-colors data-[state=active]:text-white group-hover:text-white duration-500">
                    {t('tabs.productInfo')}
                </span>
                </TabsTrigger>

                <TabsTrigger
                className="bg-white hover:bg-primary group duration-500 min-w-[225px] font-bold px-10 py-5 flex gap-4 items-center transition-colors text-primary-light data-[state=active]:bg-primary-light data-[state=active]:text-white"
                value="location">
                <MapPinIcon />
                <span className="transition-colors data-[state=active]:text-white group-hover:text-white duration-500">
                    {t('tabs.location')}
                </span>
                </TabsTrigger>

                <TabsTrigger 
                className="bg-white hover:bg-primary group duration-500 min-w-[225px] font-bold px-10 py-5 flex gap-4 items-center transition-colors text-primary-light data-[state=active]:bg-primary-light data-[state=active]:text-white"
                value="adsInfo">
                <Info />
                <span className="transition-colors data-[state=active]:text-white group-hover:text-white duration-500" >
                    {t('tabs.adsInfo')}
                </span>
                </TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            <TabsContent value="productDetails"></TabsContent>
            <TabsContent value="productInfo"></TabsContent>
            <TabsContent value="location"></TabsContent>
            <TabsContent value="adsInfo" className=''>
            </TabsContent>
        </Tabs>

                <Accordion  type="single" collapsible className='shadow-xl bg-white p-2 rounded-lg w-full '>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='hover:no-underline font-cairo font-bold text-primary'>
                    <span className='border-b-2  pb-1 border-primary-light'>
                            {t('accordionDetails.questions.question2.question')}
                        </span> 
                    </AccordionTrigger>
                    <AccordionContent className='font-cairo text-[400] text-secondary-text'>
                        {/* Display the car details here */}
                        {data?.data && <CarDetailsContent data={data.data} />}
                    </AccordionContent>
                </AccordionItem>
                </Accordion>


                <Accordion  type="single" collapsible className='shadow-xl bg-white p-2 rounded-lg w-full '>
                <AccordionItem value="item-1" className='border-none'>
                    <AccordionTrigger className='hover:no-underline font-cairo font-bold text-primary'>
                    <span className='border-b-2  pb-1 border-primary-light'>
                            {t('accordionDetails.questions.question1.question')}
                        </span> 
                    </AccordionTrigger>
                    <AccordionContent className='font-cairo text-[400] text-secondary-text'>
                            
                    </AccordionContent>
                </AccordionItem>
                </Accordion>

            {/* Product Details Accordion */}
            <Accordion type="single" collapsible className='shadow-xl bg-white p-2 rounded-lg w-full ' value="item-3">
                <AccordionItem value="item-3" className='border-none'>
                    <AccordionTrigger className='hover:no-underline font-cairo font-bold text-primary'>
                        <span className='border-b-2  pb-1 border-primary-light'>
                            {t('tabs.productInfo')}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className='font-cairo text-[400] text-secondary-text'>
                        {/*  */}
                        <AccordionProductDetails />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Safety Accordion */}
            <Accordion type="single" collapsible className='shadow-xl bg-white p-2 rounded-lg w-full' value="item-2">
                <AccordionItem value="item-2" className='border-none'>
                    <AccordionTrigger className='hover:no-underline font-cairo font-bold text-primary'>
                        <span className='border-b-2  pb-1 border-primary-light'>
                            {t('tabs.productSafety')}
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className='font-cairo text-[400] text-secondary-text'>
                        <AccordionProductSafety />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* Ads */}
            <LatestOffers count={4} container = {false}/>
        </Box>
    );
};

export default TabsSection;
