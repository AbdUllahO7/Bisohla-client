import Image from 'next/image'
import React from 'react'
import { getTranslations } from 'next-intl/server'
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import Filter from './Filter';

const Hero = async () => {

    const t = await getTranslations('homePage');

    return (
        <div className="w-full relative bg-cover bg-center h-[100vh]" 
            style={{ backgroundImage: `url('/assets/images/HeroBackRound.png')` ,  backgroundSize: 'cover', }} 
            >
                <Box variant="container"  className='flex justify-center items-center flex-col relative h-screen'>
                    <Image 
                        src="/assets/images/Rectangle.png"
                        alt='Rectangle'
                        width={397}
                        height={350}
                        className='lg:w-[397px] h-[350px]'
                    />
                    <Image  
                        src="/assets/images/carHeader.png"
                        alt='cars'
                        className="lg:w-[788px] lg:h-[327] absolute top-[200px]  xs:w-[500px]"
                        width={788}
                        height={327}
                    /> 
                    <div className='absolute text-center top-10 pt-5 '>
                            <Image 
                                src="/assets/images/logo/bishola.png"
                                alt='logo'
                                width={100}
                                height={100}
                                className='mx-auto animate-bounce mt-5 mb-5'
                            />
                        <Text className='text-[30px] text-white '>{t('hero.description')}</Text>
                    </div>
                    <Filter />

                </Box>
        </div>
    )
}

export default Hero

