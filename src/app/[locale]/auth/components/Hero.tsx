'use client';


import Image from 'next/image'
import React from 'react'
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useLocale, useTranslations } from 'next-intl';

const Hero = () => {

    const t = useTranslations('homePage');
    const locale = useLocale();
    const isRTL = locale === 'ar';
    return (
        <div className="w-full h-screen relative bg-cover bg-center" 
            style={{ backgroundImage: `url('https://img.freepik.com/free-vector/abstract-background-design-emerald-green_53876-43540.jpg?t=st=1739386007~exp=1739389607~hmac=17573bb559eac85370b557df3b362feac3a55b307c5f5c3772943190025d05b2&w=1380` ,  backgroundSize: 'cover', }} 
            >
                <Box variant="container"  className='flex justify-center items-center flex-col relative'>
                    <Image 
                        src="/assets/images/Rectangle.png"
                        alt='Rectangle'
                        width={397}
                        height={350}
                        className='lg:w-[397px] h-[100vh] opacity-30'
                    />
                    <Image  
                        src="/assets/images/carHeader.png"
                        alt='cars'
                        className="lg:w-[788px] lg:h-[327] absolute top-[200px]  xs:w-[500px]"
                        width={788}
                        height={327}
                    /> 
                    <div className='absolute text-center justify-center top-10 pt-5 '>
                        <Image 
                        src="/assets/images/logo/bishola.png"
                        alt='logo'
                        width={100}
                        height={100}
                        className=''
                    />
            <Text className=' text-white'>
                {isRTL 
                ? <span className='text-[15px] '>انطلق بحرية مع أفضل عروض تأجير وبيع السيارات –   <br/> رفاهية وسهولة في كل رحلة! 🚗✨</span>
                : <span className='text-[15px]'>Drive freely with the best car rental and sales deals <br/> – Luxury and ease in every trip! 🚗✨</span>}
            </Text>
                    </div>
                    <div className='absolute text-center bottom-40 pt-5 '>
                    <Text className='text-[30px] text-white '>{t('hero.description')}</Text>
                        <Image 
                            src="/assets/images/logo/bishola.png"
                            alt='logo'
                            width={100}
                            height={100}
                            className='animate-bounce'
                        />
                    </div>
                    
                </Box>
        </div>
    )
}

export default Hero

