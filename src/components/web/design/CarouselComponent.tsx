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
import { CarouselComponentProps } from '@/types/homePageTypes';



const CarouselComponent: React.FC<CarouselComponentProps> = ({ data, direction }) => {
    return (
        <Carousel
            opts={{ align: "start" }}
            className={` bg-white w-full ${direction === 'rtl' ? 'rtl' : 'ltr'}`}
            dir="ltr" 
        >
            <CarouselContent className="bg-white">
                {data.map((item, index) => (
                    <CarouselItem
                        key={index}
                        className="lg:w-full xl:basis-1/6 lg:basis-1/4 md:basis-1/4 sm:basis-1/3 xs:basis-1/2"
                    >
                        <Box className='overflow-hidden'>
                            <Card className="relative flex justify-center items-center bg-white border-none p-0 m-0">
                                <CardContent className="flex aspect-square items-center justify-center p-0">
                                    <Image
                                        src={item.image}
                                        alt={`${item.title} image`}
                                        width={220}
                                        height={300}
                                        className="w-full h-[300px] bg-cover"
                                    />
                                </CardContent>
                                <Box
                                    variant="row"
                                    dir={direction}
                                    className="w-[190px] justify-around items-center absolute bg-white bottom-5 rounded-xl pb-1"
                                >
                                    <Box
                                        variant="column"
                                        className="text-start gap-0 justify-start items-start pl-1 pr-1"
                                    >
                                        <Text
                                            variant="h5"
                                            className="font-bold text-primary font-cairo"
                                        >
                                            {item.title}
                                        </Text>
                                        <Text
                                            variant="mid"
                                            className="text-secondary-text"
                                        >
                                            {item.carCount} {direction === "ltr" ? 'Car' : "سيارة"}
                                        </Text>
                                    </Box>
                                    {
                                        direction === "ltr" ?  <MoveUpRight className="text-secondary-text" /> :  <MoveUpLeft className="text-secondary-text" />
                                    }
                                </Box>
                            </Card>
                        </Box>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {/* <CarouselPrevious />
            <CarouselNext /> */}
        </Carousel>
    );
};

export default CarouselComponent;
