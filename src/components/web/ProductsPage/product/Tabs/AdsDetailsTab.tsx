import React from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
  } from "@/components/ui/table"
import Box from '@/components/box/box'
  
const AdsDetailsTab = () => {
    return (
        <Box>
            <Table className='bg-white'>
                <TableBody className=''>
                    <TableRow className='hover:bg-primary-light hover:text-white'>
                        <TableHead className="w-[150px] font-bold text-left text-primary ">User</TableHead>
                        <TableCell className="text-left font-bold">aabdullah</TableCell>
                    </TableRow >
                    <TableRow className='hover:bg-primary-light hover:text-white'>
                        <TableHead className="text-left text-primary">Date</TableHead>
                        <TableCell className="text-left font-bold">10-10-2025</TableCell>
                    </TableRow >
                    <TableRow className='hover:bg-primary-light hover:text-white'>
                        <TableHead className="text-left font-bold text-primary">Title</TableHead>
                        <TableCell className="text-left font-bold">Special Discount Ad</TableCell>
                    </TableRow>
                    <TableRow className='hover:bg-primary-light hover:text-white'>
                        <TableHead className="text-left font-bold text-primary">Status</TableHead>
                        <TableCell className="text-left font-bold">Active</TableCell>
                    </TableRow>
                </TableBody>
                </Table>

                
        </Box>
    )
}

export default AdsDetailsTab
