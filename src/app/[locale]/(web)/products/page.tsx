import Box from '@/components/box/box';
import Categories from '@/components/web/ProductsPage/Categories';
import Filter from '@/components/web/ProductsPage/Filter';
import Header from '@/components/web/ProductsPage/Header';
import AdsSection from '@/components/web/Home/AdsSection';
import React from 'react';
import AllCarListings from './AllCarListings';

const Products = () => {
    return (
        <Box variant="row" className="mt-[30px] bg-background flex-wrap">
            {/* Header Section */}
            <Box className="mt-[50px] w-full" variant="center">
                <Header />
            </Box>

            {/* Main Content Section */}
            <Box 
                variant="container" 
                className="flex flex-col lg:flex-row justify-between items-start gap-6"
            >
                {/* Filter Section */}
                <div className="w-full lg:w-[300px] lg:flex-shrink-0">
                    <Filter />
                </div>

                {/* Categories and Content Section */}
                <Box className="w-full lg:w-[70%] xs:w-[100%]" variant="column">
                    <Categories />
                    {/* Use the new AllCarListings component instead */}
                    <AllCarListings showTitle={false} pageSize={8} />
                    <AdsSection />
                </Box>
            </Box>
        </Box>
    );
};

export default Products;