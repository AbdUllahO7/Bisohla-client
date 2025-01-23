import Box from '@/components/box/box';
import Categories from '@/components/web/CarsPage/Categories';
import Filter from '@/components/web/CarsPage/Filter';
import Header from '@/components/web/CarsPage/Header';
import AdsSection from '@/components/web/Home/AdsSection';
import Footer from '@/components/web/Home/Footer';
import LatestOffers from '@/components/web/Home/LatestOffers';
import React from 'react';

const Page = () => {
    return (
        <Box variant="column" className="mt-[50px] bg-background">
            <Box className="mt-[50px] w-full">
                <Header />
            </Box>
            <Box variant="container" className="flex justify-between items-start mt-10 flex-wrap">
                {/* Filter Section */}
                <Box className="w-[300px] rounded-lg">
                    <Filter />
                </Box>

                {/* Categories Section */}
                <Box className="w-full lg:w-[1100px]" variant="column">
                    <Categories />
                    <LatestOffers showTitle={false}/>
                    <AdsSection/>
                    <LatestOffers count={4} showTitle={false}/>
                </Box>

            </Box>
            <Footer />

        </Box>
    );
};

export default Page;
