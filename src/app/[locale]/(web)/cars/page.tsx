import Box from '@/components/box/box'
import Filter from '@/components/web/CarsPage/Filter'
import Header from '@/components/web/CarsPage/Header'
import React from 'react'

const page = () => {
    return (
        <Box variant="column" className='mt-[50px]  bg-background'>
                <Box className='mt-[50px] w-full'>
                    <Header/>
                </Box>
                <Box variant='container' className='flex justify-between mt-10' > 
                    <Box className=' w-[300px] rounded-lg'>
                        <Filter/>
                    </Box>
                    <Box>CarsPage</Box>
                </Box>
        </Box>
    )
}

export default page
