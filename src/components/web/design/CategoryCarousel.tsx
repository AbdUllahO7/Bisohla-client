'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Image from 'next/image';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useSearchParams } from 'next/navigation';

// Update the props interface to include the loading state
interface CategoryItem {
    title: string;
    carCount: string;
    image: string;
    value: string;
}

interface CarouselComponentProps {
    data: CategoryItem[];
    direction: string;
    isLoading?: boolean;
}

const CategoryCarousel: React.FC<CarouselComponentProps> = ({ data, direction, isLoading = false }) => {
    // Get current URL parameters to detect active category
    const searchParams = useSearchParams();
    const activeBodyType = searchParams.get('bodyType');
    
    return (
        <Carousel
            opts={{
                align: "center",
            }}
            dir='ltr'
            className='xs:w-[100%] lg:w-full'
        >
            <CarouselContent>
                {isLoading ? (
                    // Display loading skeletons when data is loading
                    Array(6).fill(0).map((_, index) => (
                        <CarouselItem key={`skeleton-${index}`} className="xs:basis-1/2 md:basis-1/4 lg:basis-1/6">
                            <div className="p-1">
                                <Card className='bg-white border-none rounded-3xl'>
                                    <CardContent className="flex items-start justify-center p-0 flex-wrap gap-0 md:w-[90%] h-[120px]">
                                        <Skeleton className="w-16 h-16 rounded-full" />
                                        <Box variant="column" className='w-full gap-0'>
                                            <Skeleton className="h-4 w-20 mt-2" />
                                            <Skeleton className="h-3 w-16 mt-1" />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))
                ) : (
                    // Display actual data when loaded
                    data.map((item, index) => {
                        // Check if this category is active
                        const isActive = activeBodyType === item.value;
                        
                        return (
                            <CarouselItem key={index} className="xs:basis-1/2 md:basis-1/4 lg:basis-1/6">
                                <Link href={`/products?bodyType=${item.value}`}>
                                    <div className="p-1">
                                        <Card 
                                            className={`
                                                border-none rounded-3xl hover:shadow-md transition-all cursor-pointer
                                                ${isActive 
                                                    ? 'bg-primary-foreground text-white  border-primary' 
                                                    : 'bg-white'}
                                            `}
                                        >
                                            <CardContent className="flex items-start justify-center p-0 flex-wrap gap-0 md:w-[90%] h-fit">
                                                <Image
                                                    src={item.image}
                                                    alt={`${item.title} image`}
                                                    width={80}
                                                    height={80}
                                                />
                                                <Box variant="column" className='w-full gap-0'>
                                                    <Text 
                                                        variant="mid" 
                                                        className={`font-cairo font-bold ${isActive ? 'text-primary' : 'text-primary-light'}`}
                                                    >
                                                        {item.title}
                                                    </Text>
                                                    <Text variant="mid" className='text-primary' dir={direction}>
                                                        {item.carCount} {direction === "ltr" ? 'Car' : 'مركبة'} 
                                                    </Text>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </Link>
                            </CarouselItem>
                        );
                    })
                )}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
};

export default CategoryCarousel;