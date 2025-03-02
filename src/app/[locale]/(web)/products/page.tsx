import Box from '@/components/box/box';
import Categories from '@/components/web/ProductsPage/Categories';
import Filter from '@/components/web/ProductsPage/Filter';
import Header from '@/components/web/ProductsPage/Header';
import AdsSection from '@/components/web/Home/AdsSection';
import LatestOffers from '@/components/web/Home/LatestOffers';
import React from 'react';

const products = () => {
    return (
        <Box variant="row" className="mt-[30px] bg-background flex-wrap">
            {/* Header Section */}
            <Box className="mt-[50px] w-full" variant="center">
                <Header />
            </Box>

            {/* Main Content Section */}
            <Box 
                variant="container" 
                className="flex flex-col lg:flex-row justify-between items-start gap-6 "
            >
                {/* Filter Section */}
                <Box className="w-full lg:w-[25%] bg-white rounded-lg shadow-md p-4">
                    <Filter />
                </Box>

                {/* Categories and Content Section */}
                <Box className="w-full lg:w-[70%] xs:w-[100%]" variant="column">
                    <Categories />
                    <LatestOffers  showTitle={false} />
                    <AdsSection />
                    <LatestOffers count={3} showTitle={false} />
                </Box>
            </Box>


        </Box>
    );
};

export default products;
