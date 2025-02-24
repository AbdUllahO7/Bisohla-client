'use client';
import Box from '@/components/box/box';
import ProductBasicInfo from '@/components/web/ProductsPage/product/ProductBasicInfo';
import ProductHeader from '@/components/web/ProductsPage/product/ProductHeader';
import ProductImages from '@/components/web/ProductsPage/product/ProductImages';
import ProductInfo from '@/components/web/ProductsPage/product/ProductInfo';
import { getProductsData } from '@/constants/ProductsData';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React from 'react';
import TabsSection from '@/components/web/ProductsPage/product/TabsSection';

const Product = () => {
    const { id } = useParams(); // Get the product ID from the URL params
    const t = useTranslations('homePage');

    // Fetch all products data
    const productData = getProductsData(t);

    // Find the product that matches the ID
    const product = productData.find((item) => item.id === parseInt(id as string, 10));

    // Handle the case where the product is not found
    if (!product) {
        return (
            <Box className="mt-[50px] bg-background text-center text-red-500">
                Product not found.
            </Box>
        );
    }

    return (
        <Box variant="column" className="mt-[50px] bg-background ">
            {/* Header Section */}
                <Box className='w-full mt-[50px]  bg-white' >
                    <Box variant="container">
                        <ProductHeader  productName={product.title}/>
                    </Box>
                </Box>

            {/* Product Details Section */}
            <Box className="mt-1 w-full ">
                <Box variant='container' >
                <ProductBasicInfo 
                    carType = {product.carType}
                    model = {product.model}
                    controlType = {product.controlType}
                    distance = {product.distance}
                    passengers = {product.passengers}
                    gaz ={product.gaz}
                />
                </Box>
            </Box>

            {/* images  */}
            <Box className='w-full'>
            <Box variant='container'>
            <Box variant="row" className='w-full gap-4 items-start justify-start md:flex-wrap xs:flex-wrap xs:justify-center' >
                <Box className='xs:w-[90%] lg:w-fit' >
                        <ProductInfo
                            carType = {product.carType}
                            model = {product.model}
                            controlType = {product.controlType}
                            distance = {product.distance}
                            passengers = {product.passengers}
                            gaz ={product.gaz}
                            price={product.price}
                            adsNumber={product.adsNumber}
                            adsDate={product.dateOfAds}
                        />
                    </Box>

                    <Box className='lg:flex-1 xs:w-full'>
                            <ProductImages/>
                    </Box>
            </Box>
                
        </Box>

            </Box>
            {/* Tabs */}
            <Box  className='lg:w-full xs:w-[90%] mt-5'>
                <Box variant='container'>
                        <TabsSection />
                </Box>

            </Box>

        </Box>
    );
};

export default Product;
