'use client';
import Box from '@/components/box/box'
import SelectDropdown from '@/components/SelectDropdown';
import Text from '@/components/text/text';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import { Grid2X2, StretchHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl'
import Link from 'next/link';
import React from 'react'

// Sort options type
interface SortOption {
  value: string;
  label: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

// Props interface for the Header component to receive the sort handler
interface HeaderProps {
  onSortChange?: (sortBy: string, sortDirection: 'asc' | 'desc') => void;
  totalItems?: number;
  currentSort?: {
    sortBy: string;
    sortDirection: 'asc' | 'desc';
  };
}

const Header: React.FC<HeaderProps> = ({ 
  onSortChange,
  totalItems = 0,
  currentSort = { sortBy: 'createdAt', sortDirection: 'desc' } 
}) => {
  const t = useTranslations('productsPage');
  
  // Define sort options with both label and actual sort parameters
  const sortOptions: SortOption[] = [
    {
      value: 'newest',
      label: t('header.options.newest'),
      sortBy: 'createdAt',
      sortDirection: 'desc'
    },
    {
      value: 'price-high',
      label: t('header.options.priceHigh'),
      sortBy: 'price',
      sortDirection: 'desc'
    },
    {
      value: 'price-low',
      label: t('header.options.priceLow'),
      sortBy: 'price',
      sortDirection: 'asc'
    },
  ];

  // Get the current selected value based on sortBy and sortDirection
  const getCurrentSortValue = () => {
    const match = sortOptions.find(option => 
      option.sortBy === currentSort.sortBy && 
      option.sortDirection === currentSort.sortDirection
    );
    return match ? match.value : 'newest'; // Default to newest if no match
  };

  // Handle sort change
  const handleSortChange = (name: string, value: string) => {
    const selectedOption = sortOptions.find(option => option.value === value);
    if (selectedOption && onSortChange) {
      onSortChange(selectedOption.sortBy, selectedOption.sortDirection);
    }
  };

  // For view toggle (grid/list)
  const [activeView, setActiveView] = React.useState('grid'); // 'grid' or 'list'

  return (
    <Box variant="center" className='w-full shadow-xl pt-3 pb-3 bg-white'>
      <Box variant="container">
        <Box variant="rowBetween" className='justify-between items-center'>
          <Box className='justify-center items-center' variant="center">
            <Text variant="mid" className='pr-2 pl-2 font-bold text-primary text-xl'>
              {totalItems} {t('header.adCounter')}
            </Text>
          </Box>

          <Box className='justify-center items-center' variant="row">
            <Text className='w-fit'>{t('header.orderBy')}</Text>
            <Box className="">
              <SelectDropdown
                options={sortOptions}
                placeholder={t('header.selectPrice')}
                SelectTriggerStyle="shadow-none p-0"
                className='w-[150px] xs:w-[120px]'
                disabled={false}
                onChange={handleSortChange}
                value={getCurrentSortValue()}
              />
              <Box className='p-2'>
                <Link 
                  href="#" 
                  className={`${activeView === 'grid' ? 'bg-primary-light' : 'bg-secondary-text'} p-2 rounded-lg transition-colors duration-200`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('grid');
                  }}
                >
                  <Grid2X2 className='text-white size-6 xs:size-4' />
                </Link>
                <Link 
                  href="#" 
                  className={`${activeView === 'list' ? 'bg-primary-light' : 'bg-secondary-text'} p-2 rounded-lg transition-colors duration-200`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveView('list');
                  }}
                >
                  <StretchHorizontal className='text-white size-6 xs:size-4' />
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