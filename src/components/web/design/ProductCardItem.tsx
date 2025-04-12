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
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CarCardItemPropsProfile } from '@/types/homePageTypes';
import { HeartIcon } from 'lucide-react';

// CardItem Component

export const ProductCardItem: React.FC<CarCardItemPropsProfile> = ({ title, marka, imageSrc, ProductId, isFavorites, priceWord, price , type }) => {
    const CardContent = (
        <Card className={` group border-none rounded-lg bg-white  w-full shadow-lg relative ${isFavorites ? 'cursor-pointer' : ''}`}>
            {/* Heart Icon for Favorites */}
            {isFavorites && (
                <Button className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md">
                    <HeartIcon size={24} className='z-10 text-red-500'/>
                </Button>
            )}
            <Text className="absolute bottom-40 left-2 bg-white px-2 py-1 rounded-lg shadow-md text-primary text-sm">
                    {type === "for_sale" ? "Sale" : 'Rent'}
            </Text>
            <CardHeader className="p-0">
                <CardTitle className="w-full">
                    <Image
                        src={imageSrc}
                        alt={title}
                        width={220}
                        height={300}
                        className="w-full h-48 object-cover rounded-t-lg"
                    />
                </CardTitle>
                <CardDescription className="p-4">
                    <Text variant="h4" className="text-primary font-semibold line-clamp-1">
                        {title}
                    </Text>
                    <Text variant="mid" className="text-gray-600">
                        {marka}
                    </Text>
                </CardDescription>
            </CardHeader>

            {/* Conditional Footer */}
            {isFavorites ? (
                <CardFooter className="bg-[#E4E4E4] flex justify-between p-4 rounded-b-lg group-hover:bg-primary-light duration-500">
                    <Text className="text-primary group-hover:text-white duration-500">{priceWord}</Text>
                    <Text className="text-primary-light font-bold group-hover:text-white duration-500">{price.toString()}</Text>
                </CardFooter>
            ) : (
                <CardFooter className="bg-gray-100 w-full flex flex-wrap gap-2 justify-between p-4 rounded-b-lg">
                    <Button className="bg-red-600 text-white flex-1 min-h-[40px]">Delete</Button>
                    <Link href={`/products/product/${ProductId}`} className="bg-primary px-4 py-2 text-white rounded-lg flex-1 text-center">Details</Link>
                    <Link href={`/products/product/${ProductId}`} className="bg-primary-light px-4 py-2 text-white rounded-lg flex-1 text-center">Edit</Link>
                </CardFooter>
            )}
        </Card>
    );

    return isFavorites ?  <Link href={`/products/product/${ProductId}`} >{CardContent}</Link>:CardContent ;
};
