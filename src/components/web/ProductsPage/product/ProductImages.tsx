import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import React from 'react';

const ProductImages = () => {
    const locale = useLocale();
    const thumbnails = Array(5).fill('/assets/images/car-card.png');

    return (
        <Box variant="center" className="w-full">
            <Box variant="container">
                <Box variant="row" className="w-full items-start justify-center gap-2 lg:flex-nowrap xs:flex-wrap">
                    {/* Main Image */}
                    <Box className="xs:w-[90%] xl:w-[80%]">
                        <Image 
                            src="/assets/images/car-large.png"
                            alt="Car"
                            width={400}
                            height={500}
                            className="w-full h-full rounded-md cursor-pointer"
                        />
                    </Box>
                    {/* Video Thumbnail */}
                    <Box variant="center" className="relative lg:w-[40%] ">
                        <Box variant="column" className="items-center xs:w-[90%]">
                        <Box className="relative w-full">
                            <Image 
                                src="/assets/images/car-card.png"
                                alt="Car Video Thumbnail"
                                width={200}
                                height={200}
                                className="rounded-md cursor-pointer"
                            />
                            
                            {/* Overlay */}
                            <Box className="absolute inset-0 bg-black opacity-50 z-0 w-[200px] rounded-md cursor-pointer"></Box>

                            {/* Play Icon & Text */}
                            <Box className={`absolute inset-0 flex flex-col items-center justify-center text-white text-2xl font-bold gap-2 z-10 ${locale === 'en' ? 'right-[100px]' : 'left-[100px]'}`}>
                                <Image 
                                    src="/assets/icons/play-video.png"
                                    alt="Play Video"
                                    width={40}
                                    height={40}
                                    className="cursor-pointer"
                                />
                                <span>{locale === 'en' ? 'Play video' : 'مشاهدة الفيديو'}</span>
                            </Box>
                        </Box>


                            {/* Thumbnails */}
                            <Box variant="row" className="flex-wrap lg:justify-start xs:justify-center w-full">
                                {thumbnails.map((src, index) => (
                                    <Image 
                                        key={index}
                                        src={src}
                                        alt="Car Thumbnail"
                                        width={100}
                                        height={100}
                                        className="rounded-md cursor-pointer"
                                    />
                                ))}
                                {/* More Images Indicator */}
                                <Box className="relative">
                                    <Image 
                                        src="/assets/images/car-card.png"
                                        alt="More Cars"
                                        width={100}
                                        height={100}
                                        className="rounded-md cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-black opacity-50 rounded-md"></div>
                                    <Text className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                                        15
                                    </Text>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default ProductImages;
