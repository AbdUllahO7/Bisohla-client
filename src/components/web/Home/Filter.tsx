'use client'

import React, { useState } from 'react';
import Box from '../../box/box';
import SelectDropdown from '../../SelectDropdown';
import { getTranslations } from 'next-intl/server';
import { Button } from '../../ui/button';
import { SearchIcon } from 'lucide-react';

const Filter =  () => {
    const t =  getTranslations('homePage');


    const [activeButton, setActiveButton] = useState<'buy' | 'hire'>('buy');

    // Define price ranges directly from the translation object
    const priceRanges = [
        { value: '15000_20000', label: t('filter.options.priceRanges.15000_20000') },
        { value: '20000_30000', label: t('filter.options.priceRanges.20000_30000') },
        { value: '30000_40000', label: t('filter.options.priceRanges.30000_40000') },
    ];
   // Handle button click to toggle active state
        const handleButtonClick = (button: 'buy' | 'hire') => {
    setActiveButton(button);
};
    return (
        <Box variant="container">
       {/* TOP */}
        <Box variant='row' className='gap-0'>
                <Button 
                    className={`w-[155px] h-[50px] ${activeButton === 'buy' ? 'bg-primary-foreground' : 'bg-transparent'} rounded-none`}
                    onClick={() => handleButtonClick('buy')}
                >
                    <span className='text-[20px] text-primary'>{t('filter.Buy')}</span>
                </Button>
                <Button 
                    className={`w-[155px] h-[50px] ${activeButton === 'hire' ? 'bg-primary-foreground' : 'bg-transparent'} rounded-none`}
                    onClick={() => handleButtonClick('hire')}
                >
                    <span className='text-[20px] text-primary'>{t('filter.Hire')}</span>
                </Button>
            </Box>
            <Box variant="row" className="pb-10 pt-10 shadow-2xl rounded-xl justify-between">
                {/* Right */}
                <Box className="justify-start flex-row gap-10 flex pl-5 pr-5">
                    {/* Car Type */}
                    <Box>
                        <SelectDropdown
                            label={t('filter.cartype')}
                            options={[
                                { value: 'sedan', label: t('filter.options.cartype.sedan') },
                                { value: 'suv', label: t('filter.options.cartype.suv') },
                                { value: 'truck', label: t('filter.options.cartype.truck') },
                                { value: 'coupe', label: t('filter.options.cartype.coupe') },
                            ]}
                            placeholder={t('filter.selectCarType')}
                            SelectTriggerStyle="border-0 outline-none shadow-none p-0 "
                        />
                    </Box>
                    {/* State */}
                    <Box>
                        <SelectDropdown
                            label={t('filter.state')}
                            options={[
                                { value: 'new', label: t('filter.options.state.new') },
                                { value: 'used', label: t('filter.options.state.used') },
                                { value: 'certified', label: t('filter.options.state.certified') },
                            ]}
                            placeholder={t('filter.selectState')}
                            SelectTriggerStyle="border-0 outline-none shadow-none p-0"
                        />
                    </Box>
                    {/* Control Type */}
                    <Box>
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
                    <Box>
                        <SelectDropdown
                            label={t('filter.selectPrice')}
                            options={priceRanges}
                            placeholder={t('filter.selectPrice')}
                            SelectTriggerStyle="border-0 outline-none shadow-none p-0"
                        />
                    </Box>
                </Box>

                {/* Left */}
                <Box className="pl-10 pr-10">
                    <Button className='bg-primary-foreground w-[127px] h-[55px]'>
                        <span className='text-primary'>{t('filter.search')}</span>
                        <SearchIcon className='text-primary'/>
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default Filter;
