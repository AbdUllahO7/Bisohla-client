'use client';
import Box from '@/components/box/box';
import ProductBasicInfo from '@/components/web/ProductsPage/product/ProductBasicInfo';
import ProductHeader from '@/components/web/ProductsPage/product/ProductHeader';
import ProductImages from '@/components/web/ProductsPage/product/ProductImages';
import ProductInfo from '@/components/web/ProductsPage/product/ProductInfo';
import { useParams } from 'next/navigation';
import React from 'react';
import TabsSection from '@/components/web/ProductsPage/product/TabsSection';
import { useCarListingById } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';

const Product = () => {
    const { id } = useParams(); // Get the product ID from the URL params


    // Fetch all car listings with pagination
    const { data, isLoading, error } = useCarListingById(Number(id));


    

    return (
        <div  className="mt-[50px]  bg-background  w-full">
            {/* Header Section */}
                <div className='w-full mt-[50px] mb-3  bg-white' >
                    <Box variant="container">
                        <ProductHeader  productName={data?.data?.title}  ContactNumber = {data?.data?.contactNumber?.toString()}/>
                    </Box>
                </div>

            <Box variant="container">
                  {/* Product Details Section */}
            <Box className="mt-1 w-full mb-3">
                    <ProductBasicInfo 
                    carType={data?.data?.make?.name || ''}
                    model={data?.data?.model?.name || ''}
                    controlType={data?.data?.details?.transmission || ''}
                    distance={data?.data?.details?.mileage?.toString() || ''}
                    modelYear={data?.data?.details?.year?.toString() || ''}
                    gaz={data?.data?.details?.fuelType || ''}
                    bodyType = {data?.data?.details?.bodyType || ''}
                    />
            </Box>

            {/* images  */}
            <Box className='w-full'>
            <Box variant="row" className='w-full gap-4 items-start justify-start md:flex-wrap xs:flex-wrap xs:justify-center' >
                <Box className='xs:w-[90%] lg:w-fit' >
                <ProductInfo
                    carType={data?.data?.make?.name || ''}
                    model={data?.data?.model?.name || ''}
                    controlType={data?.data?.details?.transmission || ''}
                    distance={data?.data?.details?.mileage?.toString() || ''}
                    modelYear={data?.data?.details?.year?.toString() || ''}
                    gaz={data?.data?.details?.fuelType || ''}
                    price={data?.data?.price?.toString() || ''}
                    adsNumber={data?.data?.id?.toString() || ''}
                    adsDate={data?.data?.publishedAt?.toString() || ''}
                />
                    </Box>

                    <Box className='lg:flex-1 xs:w-full'>
                            <ProductImages images={data?.data?.images || []} />
                    </Box>
                
        </Box>

            </Box>
            {/* Tabs */}
            <Box  className='lg:w-full xs:w-[90%] mt-5'>
                <TabsSection data = {data}/>
            </Box>
            </Box>

        </div>
    );
};

export default Product;
