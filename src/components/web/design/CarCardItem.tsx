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

// CardItem Component
interface CarCardItemProps {
    title: string;
    marka: string;
    price: string;
    imageSrc: string;
    priceWord: string;
}

export const CarCardItem: React.FC<CarCardItemProps> = ({ title, marka, price, imageSrc , priceWord }) => {
    return (
        <Card className=" border-none rounded-t-[10px] bg-white ">
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
                <CardDescription>
                    <Text variant="h4" className="text-primary p-[8px]">
                        {title}
                    </Text>
                    <Text variant="mid" className="text-primary p-[8px]">
                        {marka}
                    </Text>
                </CardDescription>
            </CardHeader>

            <CardFooter className="bg-background flex justify-between p-[8px]">
                <Text className="mid text-primary">{priceWord}</Text>
                <Text className="mid text-primary-light font-bold">{price}</Text>
            </CardFooter>
        </Card>
    );
};

interface CarCardGridProps {
    cardsData: Array<{
        title: string;
        marka: string;
        price: string;
        imageSrc: string;
    }>;
}

export const CarCardGrid: React.FC<CarCardGridProps> = ({ cardsData }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-h-[340px] h-[340px] min-h-[340px]">
            {cardsData.map((card, index) => (
                <React.Fragment key={index}>
                    <CarCardItem
                        title={card.title}
                        marka={card.marka}
                        price={card.price}
                        priceWord = {card.price}
                        imageSrc={card.imageSrc}
                    />
                </React.Fragment>
            ))}

        </div>
    );
};

