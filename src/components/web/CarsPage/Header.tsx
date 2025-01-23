import Box from '@/components/box/box'
import SelectDropdown from '@/components/SelectDropdown';
import Text from '@/components/text/text';
import { Grid2X2, StretchHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl'
import Link from 'next/link';
import React from 'react'

const Header = () => {
    const t  = useTranslations('carsPage');
    const priceRanges = [
        {
            value: 'high',
            label: t('header.options.priceHigh'),
        },
        {
            value: 'low',
            label: t('header.options.priceLow'),
        },
    ];

    return (
        <Box variant="center" className='w-full shadow-xl pt-3 pb-3  bg-white'>
            <Box variant="container">
                    <Box variant="rowBetween" className='justify-between items-center'>
                        <Box className='justify-center items-center ' variant="center">
                            <Text variant="mid" className='pr-2 pl-2'> {t('header.adCounter')}</Text>
                        </Box>

                        <Box className='justify-center items-center' variant="row">
                                <Text className='w-fit'>{t('header.orderBy')}</Text>
                                <Box className="">
                                    <SelectDropdown
                                    options={priceRanges}
                                    placeholder={t('header.selectPrice')}
                                    SelectTriggerStyle=" shadow-none p-0"
                                    className=' w-[150px] xs:w-[120px]'
                                    />
                                    <Box className='p-2' >
                                        <Link href="#" className='bg-primary-light p-2 rounded-lg'>
                                            <Grid2X2 className=' text-white size-6 xs:size-4' />
                                        </Link>
                                        <Link href="#" className='bg-secondary-text p-2 rounded-lg '>
                                            <StretchHorizontal className=' text-white size-6 xs:size-4' />
                                        </Link>

                                    </Box>
                            </Box>
                        </Box>
                    </Box>
            </Box>
        </Box>
    
    )
}

export default Header
