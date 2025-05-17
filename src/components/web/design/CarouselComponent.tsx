'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import Image from 'next/image';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { MoveUpLeft, MoveUpRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CarouselComponentProps } from '@/types/homePageTypes';

interface CarouselItemData {
    title: string;
    carCount: string;
    image: string;
    governorateId?: string; // Optional ID for filtering
}

interface ExtendedCarouselComponentProps extends CarouselComponentProps {
    onCityClick?: (cityTitle: string, governorateId?: string) => void;
}

const CarouselComponent: React.FC<ExtendedCarouselComponentProps> = ({ 
    data, 
    direction,
    onCityClick 
}) => {
    const router = useRouter();

    const handleCityClick = (item: CarouselItemData) => {
        if (onCityClick) {
            // If parent provided a callback, use it
            onCityClick(item.title, item.governorateId);
        } else {
            // Default behavior - navigate to products with governorate filter
            const params = new URLSearchParams();
            params.set("governorate", item.governorateId || item.title);
            router.push(`/products?${params.toString()}`);
        }
    };

    return (
        <Carousel
            opts={{ align: "start" }}
            className={`w-full ${direction === 'rtl' ? 'rtl' : 'ltr'} cursor-pointer`}
            dir="ltr" 
        >
            <CarouselContent className="">
                {data.map((item, index) => (
                    <CarouselItem
                        key={index}
                        className="lg:w-full 2xl:basis-1/6 xl:basis-1/5 lg:basis-1/4 md:basis-1/4 sm:basis-1/3 xs:basis-1/2"
                        onClick={() => handleCityClick(item as CarouselItemData)}
                    >
                        <Box className="overflow-hidden">
                            {/* Apply `group` here so hover applies only to this individual Card */}
                            <Card className="relative flex justify-center items-center bg-white border-none p-0 m-0 group">
                                <CardContent className="flex aspect-square items-center justify-center p-0">
                                    <Image
                                        src={item.image}
                                        alt={`${item.title} image`}
                                        width={250}
                                        height={300}
                                        className=" h-[300px] bg-cover"
                                    />
                                </CardContent>

                                {/* Apply hover only inside this specific card */}
                                <Box
                                    variant="row"
                                    dir={direction}
                                    className="w-[190px] justify-around items-center absolute bg-white bottom-5 rounded-xl pb-1 transition-colors duration-500 group-hover:bg-primary-light"
                                >
                                    <Box
                                        variant="column"
                                        className="text-start gap-0 justify-start items-start pl-1 pr-1"
                                    >
                                        <Text
                                            variant="h5"
                                            className="font-bold text-primary font-cairo transition-colors duration-500 group-hover:text-white"
                                        >
                                            {item.title}
                                        </Text>
                                        <Text
                                            variant="mid"
                                            className="text-secondary-text transition-colors duration-500 group-hover:text-white"
                                        >
                                            {item.carCount} {direction === "ltr" ? 'Car' : "سيارة"}
                                        </Text>
                                    </Box>
                                    {direction === "ltr" ? (
                                        <MoveUpRight className="text-secondary-text transition-colors duration-500 group-hover:text-white" />
                                    ) : (
                                        <MoveUpLeft className="text-secondary-text transition-colors duration-500 group-hover:text-white group-hover:animate-pulse" />
                                    )}
                                </Box>
                            </Card>
                        </Box>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
};

export default CarouselComponent;