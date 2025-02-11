import Image from 'next/image'
import React from 'react'
import { getTranslations } from 'next-intl/server'
import Box from '@/components/box/box';
import Text from '@/components/text/text';

const Hero = async () => {

    const t = await getTranslations('homePage');

    return (
        <div className="w-full h-screen relative bg-cover bg-center" 
            style={{ backgroundImage: `url('/assets/images/HeroBackRound.png')` ,  backgroundSize: 'cover', }} 
            >
                <Box variant="container"  className='flex justify-center items-center flex-col relative'>
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
                        <Text  className=' text-[43px] text-white pb-3 '>{t('hero.title')}</Text>
                        <Text className='text-[30px] text-white '>{t('hero.description')}</Text>
                    </div>
                </Box>
        </div>
    )
}

export default Hero

