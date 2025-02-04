import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { useLocale } from 'next-intl'
import Image from 'next/image'
import React from 'react'

const ProductImages = () => {
    const local = useLocale()
    return (
        <Box variant="center" className="w-full">
            <Box variant="container">
                <Box variant="row" className='w-full items-start xs:justify-center  justify-center gap-2 lg:flex-nowrap xs:flex-wrap'>
                    <Box className='xs:w-[90%] xl:w-[80%]'>
                        <Image 
                            src="/assets/images/car-large.png"
                            alt="car1"
                            width={400}
                            height={500}
                            className='w-full h-full rounded-md'
                        />
                    </Box>
                    <Box variant="center" className='relative lg:w-[40%]' >
                        <Box variant="column" className="items-start xs:w-[90%] ">
                    <Box className='relative  gap-0 xs:w-full'>
                            {/* Image */}
                            <Image 
                            src="/assets/images/car-large.png"
                            alt="car2"
                            width={150}
                            height={150}
                            className=" rounded-md  xs:w-full xs:h-full "
                        />
                        
                        {/* Overlay */}
                        <div className="absolute  xs:w-full  h-full bg-black opacity-50 rounded-md"></div>
                        
                    <Box variant="column" className=' '>
                        <Box  className='flex flex-col items-center  w-full text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold'>
                            <Image 
                                src="/assets/icons/play-video.png"
                                alt='play'
                                width={40}
                                height={40}
                                className=''
                            />
                            {
                                local === 'en' ? 'Play video' : 'مشاهدة الفيديو'
                            }
                        </Box>
                    
                    </Box>


                    </Box>
                    <Box variant="row" className='flex-wrap lg:justify-start xs:justify-center  w-full  xs:w-[100%]'>
                        {/* Image */}
                            <Image 
                                src="/assets/images/car-card.png"
                                alt="car2"
                                width={100}
                                height={100}
                                className=" rounded-md"
                            />
                            <Image 
                                src="/assets/images/car-card.png"
                                alt="car2"
                                width={100}
                                height={100}
                                className=" rounded-md"
                            />
                               <Image 
                                src="/assets/images/car-card.png"
                                alt="car2"
                                width={100}
                                height={100}
                                className=" rounded-md"
                            />
                               <Image 
                                src="/assets/images/car-card.png"
                                alt="car2"
                                width={100}
                                height={100}
                                className=" rounded-md"
                            />
                            
                            <Image 
                                src="/assets/images/car-card.png"
                                alt="car2"
                                width={100}
                                height={100}
                                className=" rounded-md"
                            />
                            
                        <Box className='relative  gap-0 '>
                                    {/* Image */}
                                    <Image 
                                    src="/assets/images/car-card.png"
                                    alt="car2"
                                    width={100}
                                    height={100}
                                    className=" rounded-md"
                                />
                                
                                {/* Overlay */}
                                <div className="absolute top-0 left-0 w-[100px]   h-full bg-black opacity-50 rounded-md"></div>
                                
                            <Box variant="column" className=''>
                                <Text variant="mid" className=' flex flex-col items-center w-full text-center absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-2xl font-bold'>
                                    
                                    {
                                        15
                                    }
                                </Text>
                            
                            </Box>


                            </Box>
                    </Box>

                </Box>


                    </Box>
                </Box>
            </Box>
        
        </Box>
    )
}

export default ProductImages
