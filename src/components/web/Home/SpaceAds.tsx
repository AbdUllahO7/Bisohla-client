import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { useTranslations } from 'next-intl';
import React from 'react'

const SpaceAds = () => {
        const t = useTranslations('homePage');
    
        // Determine direction based on the language
    return (
        <Box variant="container" className="mb-[100px] w-[80%]" >
            <Box variant="row" className='justify-evenly flex-wrap'>
                <Box variant="center" className="w-[560px] h-[250px] relative overflow-hidden bg-primary-light rounded-md">
                {/* border-l-t */}
                <Box className='absolute top-0 left-0 bg-transparent w-[100px] h-[100px] border-r-[50px] border-b-[50px] border-primary  rounded-br-[100px] '>
                </Box>
                {/* border-b-r */}
                <Box className='absolute bottom-0 right-0 bg-transparent w-[100px] h-[100px] border-l-[50px] border-t-[50px] border-primary  rounded-tl-[100px]'>
                </Box>
                {/* text */}
                <Box
                    variant="column"
                    className=""
                >
                    <Text
                        variant="h4"
                        className="text-primary-foreground font-bold text-[24px] font-cairo"
                    >
                        {t('spaceAds.box1.title')}
                    </Text>
                    <Text
                        variant="h4"
                        className="font-bold text-[36px] lg:text-[64px] font-cairo text-white"
                    >
                        {t('spaceAds.box1.bishola')}
                    </Text>
                </Box>
                </Box>
                <Box variant="center" className="w-[560px] h-[250px] relative overflow-hidden bg-primary-light rounded-md">
                    {/* border-l-t */}
                    <Box className='absolute top-0 left-0 bg-transparent w-[100px] h-[100px] border-r-[50px] border-b-[50px] border-primary  rounded-br-[100px] '>
                    </Box>
                    {/* border-b-r */}
                    <Box className='absolute bottom-0 right-0 bg-transparent w-[100px] h-[100px] border-l-[50px] border-t-[50px] border-primary  rounded-tl-[100px]'>
                    </Box>
                    {/* text */}
                    <Box
                        variant="column"
                        className=""
                    >
                        <Text
                            variant="h4"
                            className="text-primary-foreground font-bold text-[24px] font-cairo"
                        >
                            {t('spaceAds.box2.title')}
                        </Text>
                        <Text
                            variant="h4"
                            className="font-bold text-[36px] lg:text-[64px] font-cairo text-white"
                        >
                            {t('spaceAds.box2.bishola')}
                        </Text>
                    </Box>
                </Box>

            </Box>
    </Box>
    )
}

export default SpaceAds
