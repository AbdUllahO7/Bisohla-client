import Box from '@/components/box/box'
import Steps from '@/components/web/ProductsPage/addProducts/Steps'
import React from 'react'

const AddProductsPage = () => {
    
    return (
        <Box variant="column" className="mt-[50px] bg-background ">
            <Box variant="container">
                <Box className="w-full  mt-10 " variant="column">
                    <Steps/>
                </Box>
            </Box>
        </Box>
    )
}

export default AddProductsPage
