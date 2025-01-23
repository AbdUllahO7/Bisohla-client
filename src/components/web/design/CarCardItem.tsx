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

// CardItem Component

export const CarCardItem: React.FC<CarCardItemProps> = ({ title, marka, price, imageSrc , priceWord }) => {
    return (
        <Card className="border-none rounded-lg bg-white ">
            <CardHeader className="p-0">
                <CardTitle className="w-full">
                    <Image
                        src={imageSrc}
                        alt="car"
                        width={220}
                        height={300}
                        className="w-full h-full rounded-t-[10px]"
                    />
                </CardTitle>
                <CardDescription>
                    <Text variant="h4" className="text-primary p-[8px]">
                        {title}
                    </Text>
                    <Text variant="mid" className="text-primary p-[8px]">
                        {marka}
                    </Text>
                </CardDescription>
            </CardHeader>

            <CardFooter className="bg-[#E4E4E4] flex justify-between p-[8px] rounded-lg">
                <Text className="mid text-primary">{priceWord}</Text>
                <Text className="mid text-primary-light font-bold">{price}</Text>
            </CardFooter>
        </Card>
    );
};



