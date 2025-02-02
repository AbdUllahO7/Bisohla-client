import Box from '@/components/box/box'
import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLocale, useTranslations } from 'next-intl';
import AddProductStepOne from './AddProductStepOne';
import { Button } from '@/components/ui/button';

const Steps = () => {
    const t = useTranslations('addProduct')
    const locale = useLocale(); // Get current locale
    const direction = locale === 'ar' ? 'rtl' : 'ltr'; // Determine direction

    return (
        <Box variant="column" className="w-full flex flex-col justify-start items-start ">
            <Tabs defaultValue="productType" className="w-full flex flex-col justify-start items-start ">
                
                {/* Tabs Navigation */}
                <TabsList 
                    className="bg-transparent flex h-auto  gap-4 md:gap-6 lg:gap-8 flex-wrap w-full justify-start items-center xs:justify-center"
                    dir={direction}
                >
                    {/* Step 1 */}
                    <TabsTrigger 
                        className="group bg-white font-bold px-6 md:px-8 py-4 md:py-5 min-w-[150px] md:min-w-[180px] lg:min-w-[220px] min-h-[110px] md:min-h-[130px] flex-col gap-2 md:gap-4 items-center transition-colors text-primary data-[state=active]:bg-white"
                        value="productType">
                        <span className="min-h-[60px] min-w-[60px] md:min-h-[75px] md:min-w-[75px] rounded-full flex justify-center items-center transition-colors bg-gray-200 group-data-[state=active]:bg-primary-foreground">
                            <span className="text-primary font-bold text-xl md:text-2xl">1</span>
                        </span>
                        <span className="transition-colors text-primary text-sm md:text-base">
                            {t('steps.carType')}
                        </span>
                    </TabsTrigger>

                    {/* Line Separator */}
                    <span className="hidden lg:block text-primary font-bold text-2xl">------</span>

                    {/* Step 2 */}
                    <TabsTrigger 
                        className="group bg-white font-bold px-6 md:px-8 py-4 md:py-5 min-w-[150px] md:min-w-[180px] lg:min-w-[220px] min-h-[110px] md:min-h-[130px] flex-col gap-2 md:gap-4 items-center transition-colors text-primary data-[state=active]:bg-white"
                        value="location">
                        <span className="min-h-[60px] min-w-[60px] md:min-h-[75px] md:min-w-[75px] rounded-full flex justify-center items-center transition-colors bg-gray-200 group-data-[state=active]:bg-primary-foreground">
                            <span className="text-primary font-bold text-xl md:text-2xl">2</span>
                        </span>
                        <span className="transition-colors text-primary text-sm md:text-base">
                            {t('steps.carType')}
                        </span>
                    </TabsTrigger>

                    {/* Line Separator */}
                    <span className="hidden lg:block text-primary font-bold text-2xl">------</span>

                    {/* Step 3 */}
                    <TabsTrigger 
                        className="group bg-white font-bold px-6 md:px-8 py-4 md:py-5 min-w-[150px] md:min-w-[180px] lg:min-w-[220px] min-h-[110px] md:min-h-[130px] flex-col gap-2 md:gap-4 items-center transition-colors text-primary data-[state=active]:bg-white"
                        value="productInfo">
                        <span className="min-h-[60px] min-w-[60px] md:min-h-[75px] md:min-w-[75px] rounded-full flex justify-center items-center transition-colors bg-gray-200 group-data-[state=active]:bg-primary-foreground">
                            <span className="text-primary font-bold text-xl md:text-2xl">3</span>
                        </span>
                        <span className="transition-colors text-primary text-sm md:text-base">
                            {t('steps.carType')}
                        </span>
                    </TabsTrigger>

                    {/* Line Separator */}
                    <span className="hidden lg:block text-primary font-bold text-2xl">------</span>

                    {/* Step 4 */}
                    <TabsTrigger 
                        className="group bg-white font-bold px-6 md:px-8 py-4 md:py-5 min-w-[150px] md:min-w-[180px] lg:min-w-[220px] min-h-[110px] md:min-h-[130px] flex-col gap-2 md:gap-4 items-center transition-colors text-primary data-[state=active]:bg-white"
                        value="adsInfo">
                        <span className="min-h-[60px] min-w-[60px] md:min-h-[75px] md:min-w-[75px] rounded-full flex justify-center items-center transition-colors bg-gray-200 group-data-[state=active]:bg-primary-foreground">
                            <span className="text-primary font-bold text-xl md:text-2xl">4</span>
                        </span>
                        <span className="transition-colors text-primary text-sm md:text-base">
                            {t('steps.carType')}
                        </span>
                    </TabsTrigger>

                </TabsList>

                {/* Tabs Content */}
                <div className="w-full mt-6 h-full"> {/* Added spacing to separate content from tabs */}
                    <TabsContent value="productType" className=''>
                        <AddProductStepOne />
                        <Box variant="row" className='w-full  justify-start items-center bg-white mt-10 px-5 py-5 rounded-lg xs:mb-5' dir={direction} >
                            <Button className='bg-primary text-white font-bold px-7 min-w-[150px]'>
                                {direction === "ltr" ? 'Next' : 'التالي'}
                            </Button>
                            <Button className='bg-gray-200 text-primary font-bold px-7 min-w-[150px]'>
                                {direction === "ltr" ? 'Back' : 'العودة'}
                            </Button>
                        </Box>
                    </TabsContent>
                    <TabsContent value="productInfo">
                        {/* Add product info component here */}
                    </TabsContent>
                    <TabsContent value="location">
                        {/* Add location component here */}
                    </TabsContent>
                    <TabsContent value="adsInfo">
                        {/* Add ads info component here */}
                    </TabsContent>
                </div>
            </Tabs>
        </Box>
    )
}

export default Steps;
