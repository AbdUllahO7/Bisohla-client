import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from 'next-intl';
import Box from '@/components/box/box';
import { CarFront, Info, LayoutGridIcon, MapPinIcon } from 'lucide-react';
import AccordionDetails from './AccordionDetails';
import AccordionProductDetails from './Tabs/AccordionProductDetails';
import AccordionProductSafety from './Tabs/AccordionProductSafety';
import LatestOffers from '../../Home/LatestOffers';
import CarDetailsContent from './Tabs/CarDetailsContent';

interface Damage {
  id: number;
  carListingId: number;
  damageType: string;
  damageZone: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

interface TabsSectionProps {
  data?: {
    data?: any;
    damages?: Damage[];
  };
}

const TabsSection: React.FC<TabsSectionProps> = ({ data }) => {
    const t = useTranslations('product');
    
 
    
    // Ensure damages is always an array, even if undefined or null
    const damages = Array.isArray(data?.data?.damages) ? data.data?.damages : [];
    
    return (
        <Box variant='column' className='justify-start items-start w-full'>
            <Tabs defaultValue="account" className="flex-wrap">
                {/* Tab Content */}
                <TabsContent value="productDetails"></TabsContent>
                <TabsContent value="productInfo"></TabsContent>
                <TabsContent value="location"></TabsContent>
                <TabsContent value="adsInfo" className=''>
                </TabsContent>
            </Tabs>

            {/* Ads Details Section */}
            <div className='shadow-xl bg-white p-2 rounded-lg w-full mb-4'>
                <div className='font-cairo font-bold text-primary'>
                    <span className='border-b-2 pb-1 border-primary-light'>
                        {t('accordionDetails.details.adsDetails.question')}
                    </span>
                </div>
                <div className='font-cairo text-[400] text-secondary-text mt-4'>
                    {/* Display the ads details here with enhanced styling */}
                    {data?.data && <CarDetailsContent data={data.data} type="ads" />}
                </div>
            </div>

            {/* Car Details Section */}
            <div className='shadow-xl bg-white p-2 rounded-lg w-full mb-4'>
                <div className='font-cairo font-bold text-primary'>
                    <span className='border-b-2 pb-1 border-primary-light'>
                        {t('accordionDetails.details.carDetails.question')}
                    </span>
                </div>
                <div className='font-cairo text-[400] text-secondary-text mt-4'>
                    {/* Display the car details here with enhanced styling */}
                    {data?.data && <CarDetailsContent data={data.data} type="car" />}
                </div>
            </div>

            {/* Product Info Section */}
            <div className='shadow-xl bg-white p-2 rounded-lg w-full mb-4'>
                <div className='font-cairo font-bold text-primary'>
                    <span className='border-b-2 pb-1 border-primary-light'>
                        {t('tabs.productInfo')}
                    </span>
                </div>
                <div className='font-cairo text-[400] text-secondary-text mt-4'>

                    <AccordionProductDetails damages={damages} />
                </div>
            </div>

            {/* product Features Section */}
            <div className='shadow-xl bg-white p-2 rounded-lg w-full mb-4'>
                <div className='font-cairo font-bold text-primary'>
                    <span className='border-b-2 pb-1 border-primary-light'>
                        {t('tabs.productFeatures')}
                    </span>
                </div>
                <div className='font-cairo text-[400] text-secondary-text mt-4'>
                    <AccordionProductSafety  features = {data?.data.features}/>
                </div>
            </div>

            {/* Ads */}
            <LatestOffers count={4} container={false}/>
        </Box>
    );
};

export default TabsSection;