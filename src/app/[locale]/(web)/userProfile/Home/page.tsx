import Box from '@/components/box/box'
import BoxOfInfo from '@/components/web/UserProfilePage/BoxOfInfo'
import { useLocale } from 'next-intl'
import React from 'react'


const UserHomePage = () => {

    const locale = useLocale();
        const isRTL = locale === 'ar';

    return (
        <Box variant="row" className='flex-wrap w-full xs:justify-center xs:items-center'>
            <BoxOfInfo title={isRTL? 'سيارات للإيجار' : 'Cars For Rent'} count={12} percentage={65} />
            <BoxOfInfo title={isRTL? 'سيارات للإيجار' : 'Cars For Rent'} count={12} percentage={65} />
            <BoxOfInfo title={isRTL? 'سيارات للإيجار' : 'Cars For Rent'} count={12} percentage={65} />
            <BoxOfInfo title={isRTL? 'سيارات للإيجار' : 'Cars For Rent'} count={12} percentage={65} />

        </Box>
    )
}

export default UserHomePage
