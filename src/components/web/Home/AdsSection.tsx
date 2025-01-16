import Box from '@/components/box/box';
import Text from '@/components/text/text';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

const AdsSection = () => {
    return (
        <Box variant="container" className="mb-[100px] w-[80%] lg:w-[65%]">
            <Box variant="center" className="bg-primary h-[300px] text-white relative overflow-hidden rounded-lg">
                {/* Green Circular Background Design */}
                <Box className="hidden lg:block">
                    <Box className="absolute top-0 left-[807px]">
                        {/* Foreground Box */}
                        <Box
                            className="absolute top-0 h-[1000px] w-[440px] bg-transparent border-dotted border-r-[809px] border-primary-foreground rounded-br-3xl"
                            style={{ zIndex: 1 }}
                        ></Box>
                        <Box
                            className="absolute top-[-100px] w-[500px] h-[324px] right-[242px] bg-transparent border-dotted border-r-[809px] border-primary rounded-br-3xl"
                            style={{ zIndex: 99 }}
                        ></Box>
                        {/* Image */}
                        <Box
                            className="absolute top-[50px] left-[-800px] w-[500px] z-50"
                            style={{ zIndex: 100 }}
                        >
                            <Image
                                src="/assets/images/3-car.png"
                                alt="cars"
                                width={1000}
                                height={1000}
                            />
                        </Box>
                    </Box>
                </Box>

                {/* Text and Button Section */}
                <Box
                    className="absolute right-4 lg:right-6 flex flex-col lg:flex-row justify-center lg:justify-between items-center w-full lg:w-[600px] space-y-4 lg:space-y-0 "
                    variant="row"
                >
                    <Box
                        variant="column"
                        className="z-[200] text-center lg:text-start justify-center lg:gap-0 lg:justify-start items-center lg:items-start w-full lg:w-[300px]"
                    >
                        <Text
                            variant="h4"
                            className="text-primary-foreground font-bold text-[24px] font-cairo"
                        >
                            أنشىء أعلانك معنا
                        </Text>
                        <Text
                            variant="h4"
                            className="font-bold text-[36px] lg:text-[64px] font-cairo"
                        >
                            بسـهولـــة
                        </Text>
                    </Box>
                    <Box
                        variant="row"
                        className="z-[200] flex justify-center items-center w-full lg:w-auto"
                    >
                        <Link
                            href="#"
                            className="bg-primary-foreground px-6 py-3 rounded-lg text-center"
                        >
                            <Text className="text-primary font-bold font-cairo text-[15px]">
                                Start Now
                            </Text>
                        </Link>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AdsSection;
