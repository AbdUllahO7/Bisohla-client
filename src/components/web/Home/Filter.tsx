'use client';

import React, { useState } from 'react';
import Box from '../../box/box';
import SelectDropdown from '../../SelectDropdown';
import { Button } from '../../ui/button';
import { SearchIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

const Filter = () => {
  const t = useTranslations('homePage');

  const [activeButton, setActiveButton] = useState<'buy' | 'hire'>('buy');

  // Define price ranges directly from the translation object
  const priceRanges = [
    {
      value: '15000_20000',
      label: t('filter.options.priceRanges.15000_20000'),
    },
    {
      value: '20000_30000',
      label: t('filter.options.priceRanges.20000_30000'),
    },
    {
      value: '30000_40000',
      label: t('filter.options.priceRanges.30000_40000'),
    },
  ];
  // Handle button click to toggle active state
  const handleButtonClick = (button: 'buy' | 'hire') => {
    setActiveButton(button);
  };

  
  return (
    <Box variant="column" className='mx-auto container relative w-full m-0  h-full justify-center items-center gap-0'>
      {/* TOP */}
      <Box variant="row" className="gap-0 w-full mx-auto bg-background ">
          <Button
            className={`h-[50px] ${
              activeButton === 'hire' ? 'bg-primary-foreground' : 'bg-transparent'
            } rounded-none w-full sm:w-[155px]`}
            onClick={() => handleButtonClick('hire')}
          >
            <span className="text-[20px] text-primary font-cairo font-[800]">
              {t('filter.Hire')}
            </span>
          </Button>
          <Button
            className={`h-[50px] ${
              activeButton === 'buy' ? 'bg-primary-foreground' : 'bg-transparent'
            } rounded-none w-full sm:w-[155px]`}
            onClick={() => handleButtonClick('buy')}
          >
            <span className="text-[20px] text-primary font-cairo font-[800]">
              {t('filter.Buy')}
            </span>
          </Button>
        </Box>

        <Box
            variant="rowBetween"
            className="pb-10 w-full  bg-background pt-10 shadow-2xl rounded-b-md flex 2xs:flex-wrap sm:flex-wrap lg:flex-nowrap  mx-auto"

          >
            {/* Right */}
            <Box
              className="grid   gap-5 pl-5 pr-5 md:grid-cols-1 lg:grid-cols-4 w-full"
            >
              {/* Car Type */}
              <Box className="w-full">
                <SelectDropdown
                  label={t('filter.productType')}
                  options={[
                    { value: 'sedan', label: t('filter.options.productType.sedan') },
                    { value: 'suv', label: t('filter.options.productType.suv') },
                    { value: 'truck', label: t('filter.options.productType.truck') },
                    { value: 'coupe', label: t('filter.options.productType.coupe') },
                  ]}
                  placeholder={t('filter.selectproductType')}
                  SelectTriggerStyle="border-0 outline-none shadow-none p-0"
                />
              </Box>
              {/* State */}
              <Box className="w-full">
                <SelectDropdown
                  label={t('filter.state')}
                  options={[
                    { value: 'new', label: t('filter.options.state.new') },
                    { value: 'used', label: t('filter.options.state.used') },
                    {
                      value: 'certified',
                      label: t('filter.options.state.certified'),
                    },
                  ]}
                  placeholder={t('filter.selectState')}
                  SelectTriggerStyle="border-0 outline-none shadow-none p-0"
                />
              </Box>
              {/* Control Type */}
              <Box className="w-full">
                <SelectDropdown
                  label={t('filter.controltype')}
                  options={[
                    { value: 'manual', label: t('filter.options.controltype.manual') },
                    { value: 'automatic', label: t('filter.options.controltype.automatic') },
                  ]}
                  placeholder={t('filter.selectControlType')}
                  SelectTriggerStyle="border-0 outline-none shadow-none p-0"
                />
              </Box>
              {/* Price Range */}
              <Box className="w-full">
                <SelectDropdown
                  label={t('filter.selectPrice')}
                  options={priceRanges}
                  placeholder={t('filter.selectPrice')}
                  SelectTriggerStyle="border-0 outline-none shadow-none p-0"
                />
              </Box>
            </Box>

            {/* Left */}
            <Box
              className="flex justify-center items-center pt-5 md:pt-0 xs:w-full sm:w-full w-full "
            >
              <Button className="bg-primary-foreground w-full md:w-[127px] h-[55px]">
                <span className="text-primary">{t('filter.search')}</span>
                <SearchIcon className="text-primary ml-2" />
              </Button>
            </Box>
        </Box>

    </Box>
  );
};

export default Filter;
