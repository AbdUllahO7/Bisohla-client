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
import { 
    ArrowUpRight, 
    ArrowUpLeft, 
    MapPin, 
    Building2, 
    Car, 
    Navigation,
    Sparkles,
    Eye,
    ChevronRight
} from 'lucide-react';
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
            opts={{ align: "start", loop: true }}
            className={`w-full ${direction === 'rtl' ? 'rtl' : 'ltr'} cursor-pointer`}
            dir="ltr" 
        >
            <CarouselContent className="-ml-2 md:-ml-4">
                {data.map((item, index) => (
                    <CarouselItem
                        key={index}
                        className="2xl:basis-1/8 xl:basis-1/7 lg:basis-1/6 md:basis-1/6 sm:basis-1/4 xs:basis-1/2 pl-2 md:pl-4 flex-shrink-0"
                        onClick={() => handleCityClick(item as CarouselItemData)}
                    >
                        <Box className="overflow-hidden w-full h-full">
                            {/* Enhanced Card with modern styling - Fixed dimensions */}
                            <Card className="relative flex justify-center items-center bg-white border-none p-0 m-0 group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] w-[250px] h-[350px]">
                                <CardContent className="flex items-center justify-center p-0 relative w-full h-full">
                                    {/* Image with overlay gradient - Fixed dimensions */}
                                    <div className="relative w-full h-full overflow-hidden rounded-2xl">
                                        <Image
                                            src={item.image}
                                            alt={`${item.title} image`}
                                            width={250}
                                            height={350}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        
                                        {/* Gradient overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-70 group-hover:opacity-50 transition-opacity duration-500" />
                                        
                                        {/* Top decoration icons */}
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                                <MapPin className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                                                <Eye className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        {/* Floating sparkles for enhanced visual appeal */}
                                        <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                                            <Sparkles className="w-5 h-5 text-white animate-pulse" />
                                        </div>
                                    </div>
                                </CardContent>

                                {/* Enhanced overlay box */}
                                <Box
                                    variant="row"
                                    dir={direction}
                                    className={`
                                        w-[190px] justify-between items-center absolute bottom-4 left-1/2 transform -translate-x-1/2
                                        bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg
                                        transition-all duration-500 group-hover:bg-gradient-to-r group-hover:from-[#198341] group-hover:to-[#2C3C39]
                                        border border-white/20 group-hover:border-white/30
                                        group-hover:scale-105 group-hover:shadow-xl
                                    `}
                                >
                                    <Box
                                        variant="column"
                                        className="text-start gap-1 justify-start items-start flex-1"
                                    >
                                        <Box className="flex items-center gap-2 mb-1">
                                            <Building2 className="w-4 h-4 text-[#198341] group-hover:text-white transition-colors duration-500" />
                                            <Text
                                                variant="h5"
                                                className="font-bold text-[#2C3C39] font-cairo transition-colors duration-500 group-hover:text-white text-sm leading-tight"
                                            >
                                                {item.title}
                                            </Text>
                                        </Box>
                                        
                                        <Box className="flex items-center gap-1">
                                            <Car className="w-3 h-3 text-[#2C3C39]/70 group-hover:text-white/80 transition-colors duration-500" />
                                            <Text
                                                variant="small"
                                                className="text-[#2C3C39]/80 transition-colors duration-500 group-hover:text-white/90 text-xs font-medium"
                                            >
                                                {item.carCount} {direction === "ltr" ? 'Cars' : "سيارة"}
                                            </Text>
                                        </Box>
                                    </Box>

                                    {/* Enhanced arrow with animation */}
                                    <div className="relative">
                                        {direction === "ltr" ? (
                                            <div className="w-8 h-8 bg-[#ABDE3B]/20 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110">
                                                <ArrowUpRight className="w-4 h-4 text-[#198341] group-hover:text-white transition-all duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 bg-[#ABDE3B]/20 group-hover:bg-white/20 rounded-full flex items-center justify-center transition-all duration-500 group-hover:scale-110">
                                                <ArrowUpLeft className="w-4 h-4 text-[#198341] group-hover:text-white transition-all duration-500 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5" />
                                            </div>
                                        )}
                                        
                                        {/* Pulse ring effect on hover */}
                                        <div className="absolute inset-0 rounded-full border-2 border-white opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-opacity duration-500" />
                                    </div>
                                </Box>

                                {/* Additional hover effects */}
                                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-[#ABDE3B]/30 transition-all duration-500" />
                                
                                {/* Corner decoration */}
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#ABDE3B]/10 to-transparent rounded-bl-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            </Card>
                        </Box>
                    </CarouselItem>
                ))}
            </CarouselContent>
        </Carousel>
    );
};

export default CarouselComponent;