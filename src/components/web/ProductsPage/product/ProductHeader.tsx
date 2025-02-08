import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { ArrowLeftRight, Heart, PhoneCall } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import React from 'react'

const ProductHeader = ({productName} :{productName :  string}) => {

    const t = useTranslations('product')

    return (
        <Box variant="rowBetween" className='items-center justify-start  xs:flex-wrap pt-3 pb-3 w-full'>
            <Box className='justify-start items-start' variant="center">
                <Text variant="mid" className='pr-2 pl-2'> {productName}</Text>
            </Box>

            <Box className='justify-end items-center md:flex-nowrap xs:flex-wrap  flex-1' variant="row">
                <Box className='justify-center items-center bg-background p-2 rounded-md' variant="center">
                    <Text variant="mid" className='pr-2 pl-2'><Heart/></Text>
                </Box>
            
                <Box className='justify-center items-center  bg-background p-2 rounded-md' variant="center">
                    <Text variant="mid" className='pr-2 pl-2'><ArrowLeftRight/></Text>
                </Box>
            
                <Box className='justify-center items-center border border-primary rounded-md p-2 ' variant="center">
                    <Link href="#" className='flex items-center gap-2 '>
                        <Text>+90 538 937 08 63</Text>
                        <span className='text-primary'><PhoneCall/></span> 
                    </Link>
                </Box>
                <Box className='justify-center items-center  bg-primary-foreground rounded-md p-2 ' variant="center">
                <Link href="#" className='flex items-center gap-2 '>
                            <Text>{t('header.whatsApp')}</Text>
                            <span className='text-primary'><PhoneCall/></span> 
                    </Link>
                </Box>
            
            </Box>

            </Box>
    )
}

export default ProductHeader
