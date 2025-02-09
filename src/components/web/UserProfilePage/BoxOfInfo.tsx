'use client';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Car, ChevronUp } from 'lucide-react';
import { ReactNode } from 'react';

interface CarsRentBoxProps {
    icon?: ReactNode;
    title: string;
    count: number;
    percentage: number;
}

const BoxOfInfo: React.FC<CarsRentBoxProps> = ({ icon = <Car size={40} className='text-white' />, title, count, percentage }) => {
    return (
        <Box className='bg-primary-light shadow-lg rounded-lg hover:bg-primary duration-500 justify-start items-start' variant='row'>
            <Box className='justify-start items-start px-5 py-5' variant='column'>
                {icon}
                <Text className='text-white text-xl font-bold'>{title}</Text>
                <Text className='text-white text-xl font-bold'>{count}</Text>
            </Box>
            <Box className='px-5 py-5'>
                <Text className='text-white flex justify-center items-center'>
                    <span><ChevronUp /></span> {percentage} %
                </Text>
            </Box>
        </Box>
    );
};

export default BoxOfInfo;
