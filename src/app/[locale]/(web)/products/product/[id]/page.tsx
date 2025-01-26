'use client';
import Box from '@/components/box/box';
import Footer from '@/components/web/Home/Footer';
import ProductBasicInfo from '@/components/web/ProductsPage/product/ProductBasicInfo';
import ProductHeader from '@/components/web/ProductsPage/product/ProductHeader';
import ProductImages from '@/components/web/ProductsPage/product/ProductImages';
import ProductInfo from '@/components/web/ProductsPage/product/ProductInfo';
import { getProductsData } from '@/constants/ProductsData';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import React from 'react';

const Product = () => {
    const { id } = useParams(); // Get the product ID from the URL params
    const t = useTranslations('homePage');

    // Fetch all products data
    const productData = getProductsData(t);

    // Find the product that matches the ID
    const product = productData.find((item) => item.id === parseInt(id, 10));

    // Handle the case where the product is not found
    if (!product) {
        return (
            <Box className="mt-[50px] bg-background text-center text-red-500">
                Product not found.
            </Box>
        );
    }

    return (
        <Box variant="column" className="mt-[50px] bg-background">
            {/* Header Section */}
            <Box className="mt-[50px] w-full">
                <ProductHeader  productName={product.title}/>
            </Box>

            {/* Product Details Section */}
            <Box className="mt-10 w-full ">
                <ProductBasicInfo 
                    carType = {product.carType}
                    model = {product.model}
                    controlType = {product.controlType}
                    distance = {product.distance}
                    passengers = {product.passengers}
                    gaz ={product.gaz}
                />
            </Box>

            <Box variant="row" className='w-full gap-4 justify-evenly md:flex-wrap xs:flex-wrap' >
                <Box className='xs:w-[90%] lg:w-fit'>
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

                <Box className='lg:w-[60%]  xs:w-full'>
                        <ProductImages/>
                </Box>
                
            </Box>

            {/* Footer Section */}
            <Footer />
        </Box>
    );
};

export default Product;
