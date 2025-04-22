'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Box from '../../box/box';
import SelectDropdown from '../../SelectDropdown';
import { Button } from '../../ui/button';
import { SearchIcon, ListRestart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import { getPriceRanges } from '@/constants/filterData';
import { useAddProductStepTwo } from '../ProductsPage/addProducts/stepTow/hooks';
import { useProductStepOne } from '../ProductsPage/addProducts/StepOne/hooks';
import Text from '@/components/text/text';

// Types for filtering
interface FilterState {
  productType?: string;
  state?: string;
  controltype?: string;
  minPrice?: string;
  maxPrice?: string;
  currency?: string;
  [key: string]: string | undefined;
}

const Filter = () => {
  const t = useTranslations('homePage');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeButton, setActiveButton] = useState<'buy' | 'hire'>('buy');
  const [filterState, setFilterState] = useState<FilterState>({});
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [currency, setCurrency] = useState<string>("");
  
  const priceRanges = getPriceRanges;
  const handleValidationChangeStepOne = (isValid: boolean) => {}
  const handleValidationChangeStepTwo = (isValid: boolean) => {}

  // Hooks data for filter options
  const {
    governorateOptions,
    carModel,
    madeYear,
    handleSelectChange: handleStepOneSelectChange,
    titles: stepOneTitles,
  } = useProductStepOne(handleValidationChangeStepOne);

  const {
    carInfo,
    options: stepTwoOptions,
    labels: stepTwoLabels,
    handleSelectChange: handleStepTwoSelectChange,
  } = useAddProductStepTwo(handleValidationChangeStepTwo);

  // Create memoized year options for the dropdown
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 30; i--) {
      years.push({ value: i.toString(), label: i.toString() });
    }
    return years;
  }, []);

  // Initialize filter from URL parameters
  useEffect(() => {
    if (searchParams) {
      const productType = searchParams.get("productType");
      const state = searchParams.get("state");
      const controltype = searchParams.get("controltype");
      const minPrice = searchParams.get("minPrice");
      const maxPrice = searchParams.get("maxPrice");
      const currency = searchParams.get("currency");
      const listingType = searchParams.get("listingType");

      // Set state based on URL parameters
      const initialState: FilterState = {};
      if (productType) initialState.productType = productType;
      if (state) initialState.state = state;
      if (controltype) initialState.controltype = controltype;
      if (minPrice) initialState.minPrice = minPrice;
      if (maxPrice) initialState.maxPrice = maxPrice;
      if (currency) initialState.currency = currency;
      
      setFilterState(initialState);
      if (minPrice) setMinPrice(minPrice);
      if (maxPrice) setMaxPrice(maxPrice);
      if (currency) setCurrency(currency);
      
      // Set active button based on listingType in URL
      if (listingType === 'for_rent') {
        setActiveButton('hire');
      } else if (listingType === 'for_sale') {
        setActiveButton('buy');
      }
    }
  }, [searchParams]);

  // Handle button click to toggle active state
  const handleButtonClick = (button: 'buy' | 'hire') => {
    setActiveButton(button);
  };

  // Handle filter change
  const handleFilterChange = (name: string, value: string) => {
    const newFilterState = { ...filterState, [name]: value };
    setFilterState(newFilterState);
    
    // Sync with the appropriate hook if needed
    if (name === 'state') {
      handleStepOneSelectChange('governorate', value);
    } else if (name === 'productType') {
      handleStepTwoSelectChange('bodyType', value);
    } else if (name === 'controltype') {
      handleStepTwoSelectChange('transmission', value);
    }
  };

  // Handle price change
  const handlePriceChange = (type: "min" | "max", value: string) => {
    if (type === "min") {
      setMinPrice(value);
      setFilterState(prev => ({ ...prev, minPrice: value }));
    } else {
      setMaxPrice(value);
      setFilterState(prev => ({ ...prev, maxPrice: value }));
    }
  };
  
  // Handle currency change
  const handleCurrencyChange = (name: string, value: string) => {
    setCurrency(value);
    setFilterState(prev => ({ ...prev, currency: value }));
    handleStepTwoSelectChange('currency', value);
  };

  // Build query params for navigation
  const buildQueryParams = () => {
    // Check if max price is less than min price, if so, swap them
    let finalMinPrice = minPrice;
    let finalMaxPrice = maxPrice;
    
    if (minPrice && maxPrice && parseInt(minPrice) > parseInt(maxPrice)) {
      finalMinPrice = maxPrice;
      finalMaxPrice = minPrice;
      setMinPrice(finalMinPrice);
      setMaxPrice(finalMaxPrice);
      setFilterState(prev => ({ 
        ...prev, 
        minPrice: finalMinPrice, 
        maxPrice: finalMaxPrice 
      }));
    }
    
    // Create URL search params
    const params = new URLSearchParams();
    
    // Set listing type based on active button
    const listingType = activeButton === 'hire' ? 'for_rent' : 'for_sale';
    params.set("listingType", listingType);
    
    // Add filter parameters
    if (filterState.productType) params.set("bodyType", filterState.productType);
    if (filterState.state) params.set("governorate", filterState.state);
    if (filterState.controltype) params.set("transmission", filterState.controltype);
    if (finalMinPrice) params.set("minPrice", finalMinPrice);
    if (finalMaxPrice) params.set("maxPrice", finalMaxPrice);
    if (currency) params.set("currency", currency);
    
    return params;
  };

  // Apply filters and navigate to products page
  const applyFilters = () => {
    const params = buildQueryParams();
    
    // Navigate to products page with the filter parameters
    router.push(`/products?${params.toString()}`);
  };
  
  // Reset filters
  const resetFilters = () => {
    // Reset all state variables
    setFilterState({});
    setMinPrice("");
    setMaxPrice("");
    setCurrency("");
    
    // Reset hook state to ensure dropdowns reset properly
    handleStepOneSelectChange("governorate", "");
    handleStepTwoSelectChange("bodyType", "");
    handleStepTwoSelectChange("transmission", "");
    handleStepTwoSelectChange("currency", "");
    
    // Reset URL - force removal of all query parameters
    // Get just the base path without query parameters
    const currentPath = window.location.pathname;
    router.push(currentPath);
  };
  
  // Additional effect to handle resetting
  useEffect(() => {
    // Only run this effect for resetting (when filterState is empty)
    if (Object.keys(filterState).length === 0) {
      // Synchronize hook state with filter state
      handleStepOneSelectChange("governorate", "");
      handleStepTwoSelectChange("bodyType", "");
      handleStepTwoSelectChange("transmission", "");
      handleStepTwoSelectChange("currency", "");
      
      // Reset price state
      setMinPrice("");
      setMaxPrice("");
      setCurrency("");
    }
  }, [filterState, handleStepOneSelectChange, handleStepTwoSelectChange]);
  
  return (
    <Box variant="column" className='mx-auto container absolute bottom-[-100px] xs:mt-10 xs:mb-10 z-10 w-full justify-center items-center gap-0'>
      {/* TOP */}
      <Box variant="row" className="gap-0 w-full mx-auto">
          <Button
            className={`h-[50px] ${
              activeButton === 'hire' ? 'bg-primary-foreground' : 'bg-background'
            } rounded-none w-full sm:w-[155px]`}
            onClick={() => handleButtonClick('hire')}
          >
            <span className="text-[20px] text-primary font-cairo font-[800]">
              {t('filter.Hire')}
            </span>
          </Button>
          <Button
            className={`h-[50px] ${
              activeButton === 'buy' ? 'bg-primary-foreground' : 'bg-background'
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
            className="pb-10 w-full bg-background pt-10 shadow-2xl rounded-b-md flex 2xs:flex-wrap sm:flex-wrap lg:flex-nowrap mx-auto"
          >
            {/* Right */}
            <Box
              className="grid gap-5 pl-5 pr-5 md:grid-cols-1 lg:grid-cols-4 "
            >
              {/* Body Type */}
              <Box className="w-full">
                <SelectDropdown
                  label={t('filter.productType')}
                  options={stepTwoOptions.bodyType}
                  placeholder={stepTwoLabels.selectBodyType}
                  SelectTriggerStyle="border-0 outline-none shadow-none"
                  onChange={(name, value) => handleFilterChange('productType', value)}
                  value={filterState.productType || ""}
                  name="productType"
                  disabled={false}
                />
              </Box>
              {/* Governorate */}
              <Box className="w-full">
                <SelectDropdown
                  label={t('filter.state')}
                  options={governorateOptions}
                  placeholder={stepOneTitles.governorate}
                  SelectTriggerStyle="border-0 outline-none shadow-none"
                  onChange={(name, value) => handleFilterChange('state', value)}
                  value={filterState.state || ""}
                  name="state"
                  disabled={false}
                />
              </Box>
              {/* Transmission Type */}
              <Box className="w-full">
                <SelectDropdown
                  label={t('filter.controltype')}
                  options={stepTwoOptions.transmission}
                  placeholder={stepTwoLabels.selectTransmission}
                  SelectTriggerStyle="border-0 outline-none shadow-none"
                  onChange={(name, value) => handleFilterChange('controltype', value)}
                  value={filterState.controltype || ""}
                  name="controltype"
                  disabled={false}
                />
              </Box>
              {/* Price Range */}
              <Box variant="column" className="w-full text-start justify-between items-start gap-0">
                    <Text className='mb-1 text-sm text-gray-700 font-cairo font-[700]'>
                      {t('filter.selectPrice')}
                    </Text>
                    <Box className="grid grid-cols-2 gap-2 mb-2 justify-center items-center w-[300px]">
                  <SelectDropdown
                    options={priceRanges}
                    placeholder={t('filter.productPrice.lessPrice') || "Min Price"}
                    SelectTriggerStyle="border-0 outline-none shadow-none"
                    onChange={(name, value) => handlePriceChange("min", value)}
                    value={minPrice || ""}
                    name="minPrice"
                    disabled={false}
                  />
                  <SelectDropdown
                    options={priceRanges}
                    placeholder={t('filter.productPrice.highestPrice') || "Max Price"}
                    SelectTriggerStyle="border-0 outline-none shadow-none"
                    onChange={(name, value) => handlePriceChange("max", value)}
                    value={maxPrice || ""}
                    name="maxPrice"
                    disabled={false}
                  />
                </Box>
                {/* Currency dropdown is commented out as in your reference code */}
                {/* <SelectDropdown
                  options={stepTwoOptions.currency}
                  placeholder={stepTwoLabels.selectCurrency}
                  SelectTriggerStyle="border-0 outline-none shadow-none"
                  onChange={handleCurrencyChange}
                  value={currency || ""}
                  name="currency"
                  disabled={false}
                /> */}
              </Box>
            </Box>

            {/* Left */}
            <Box
              className="flex justify-center items-center gap-3 pt-5 md:pt-0 xs:w-full sm:w-full w-full"
            >
              <Button 
                className="bg-primary-foreground w-full md:w-[127px] h-[55px]"
                onClick={applyFilters}
              >
                <span className="text-primary">{t('filter.search')}</span>
                <SearchIcon className="text-primary ml-2" />
              </Button>
              
              <Button
                variant="outline"
                className="w-full md:w-[127px] h-[55px] border border-primary hover:bg-primary-foreground"
                onClick={resetFilters}
              >
                <span className="text-primary">{t('filter.reset') || "Reset"}</span>
                <ListRestart className="text-primary ml-2 h-4 w-4" />
              </Button>
            </Box>
        </Box>
    </Box>
  );
};

export default Filter;