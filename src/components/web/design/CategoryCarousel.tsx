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
import { CarouselComponentProps } from '@/types/homePageTypes';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import Link from 'next/link';

const CategoryCarousel: React.FC<CarouselComponentProps> = ({ data, direction }) => {
    return (
        <Carousel
            opts={{
                align: "center",
            }}
            dir='ltr'
            className='xs:w-[100%] lg:w-full'
        >
            <CarouselContent>
                {data.map((item, index) => (
                    <CarouselItem key={index} className="xs:basis-1/2 md:basis-1/4 lg:basis-1/6">
                        <Link href={`/products?bodyType=${item.value}`}>
                            <div className="p-1">
                                <Card className='bg-white border-none rounded-3xl hover:shadow-md transition-shadow cursor-pointer'>
                                    <CardContent className="flex items-start justify-center p-0 flex-wrap gap-0 md:w-[90%] h-fit">
                                        <Image
                                            src={item.image}
                                            alt={`${item.title} image`}
                                            width={80}
                                            height={80}
                                            onError={(e) => {
                                                // Fallback image if the specific body type image isn't available
                                                e.currentTarget.src = '/assets/icons/001-car.png';
                                            }}
                                        />
                                        <Box variant="column" className='w-full gap-0'>
                                            <Text variant="mid" className='text-primary-light font-cairo font-bold'>{item.title}</Text>
                                            <Text variant="mid" className='text-primary' dir={direction}>
                                                {item.carCount} {direction === "ltr" ? 'Car' : 'مركبة'} 
                                            </Text>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </div>
                        </Link>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
        </Carousel>
    );
};

export default CategoryCarousel;