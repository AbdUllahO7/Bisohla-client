import React from 'react';
import Text from '@/components/text/text';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { CarCardItemProps } from '@/types/homePageTypes';
import Box from '@/components/box/box';
import { Fuel, LifeBuoy } from 'lucide-react';

// CardItem Component

export const RentProductCard: React.FC<CarCardItemProps> = ({ title, marka, price, imageSrc, priceWord, details }) => {
    return (
        <Card className="border-none bg-white">
            <Box className="flex justify-between p-[8px] rounded-t-[10px] bg-primary-light">
                <Text className="mid font-cairo text-[500] text-[#EFEFEF] text-[14px]">{priceWord}</Text>
                <Text className="mid font-cairo text-white-light font-bold">{price}</Text>
            </Box>
            <CardHeader className="p-0">
                <CardTitle className="w-full">
                    <Image
                        src={imageSrc}
                        alt="car"
                        width={220}
                        height={300}
                        className="w-full h-full"
                    />
                </CardTitle>
                <CardDescription className='p-[8px]'>
                    <Text variant="h4" className="text-primary pr-2 pl-2">
                        {title}
                    </Text>
                    <Text variant="mid" className="text-primary pr-2 pl-2">
                        {marka}
                    </Text>
                </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-start p-[8px] gap-4">
                   {/* Display details */}
                    <Text variant="small" className="text-gray-500 pr-2 pl-2 flex justify-center items-center gap-2">
                        <Fuel/>
                        {details?.gaz}
                    </Text>
                    <Text variant="small" className="text-gray-500 pr-2 pl-2 flex justify-center items-center gap-2">
                        <LifeBuoy/>
                        {details?.type}
                    </Text>
            </CardFooter>
        </Card>
    );
};


