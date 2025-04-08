'use client'
import React, { useState, useEffect } from 'react';
import Box from '@/components/box/box';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ListingType, RentType } from '@/core/entities/enums/cars.enums';



// Props interface
export interface ProductTypeSelectProps {
    listingType: ListingType | '';
    rentType: RentType | '';
    onListingTypeChange: (value: ListingType | '') => void;
    onRentTypeChange: (value: RentType | '') => void;
    direction: string;
}

// Product Type selection component
const ProductTypeSelect: React.FC<ProductTypeSelectProps> = ({ 
    listingType, 
    rentType, 
    onListingTypeChange, 
    onRentTypeChange, 
    direction 
}) => {
    const [showRentTypes, setShowRentTypes] = useState(listingType === ListingType.FOR_RENT);

    // Update showRentTypes when listingType changes
    useEffect(() => {
        setShowRentTypes(listingType === ListingType.FOR_RENT);
    }, [listingType]);

    // Handle listing type change
    const handleListingTypeChange = (value: string) => {
        const newValue = value as ListingType | '';
        onListingTypeChange(newValue);
        
        // Reset rent type if user switches away from FOR_RENT
        if (newValue !== ListingType.FOR_RENT) {
            onRentTypeChange('');
        }
    };

    return (
        <Box variant="column" className='w-full items-start space-y-4'>
            {/* Listing Type Selection */}
            <Box variant="column" className='w-full items-start'>
                <Label htmlFor="listingTypeSelect">
                    {direction === "ltr" ? 'Product Type' : 'نوع المنتج'}
                    <span className="text-red-500">*</span>
                </Label>
                <Select 
                    value={listingType}
                    onValueChange={handleListingTypeChange}
                >
                    <SelectTrigger className="w-full md:w-[180px]" id="listingTypeSelect">
                        <SelectValue placeholder={direction === "ltr" ? 'Select product type' : 'اختر نوع المنتج'} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem value={ListingType.FOR_SALE}>
                                {direction === "ltr" ? 'For Sale' : 'للبيع'}
                            </SelectItem>
                            <SelectItem value={ListingType.FOR_RENT}>
                                {direction === "ltr" ? 'For Rent' : 'للإيجار'}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </Box>

            {/* Rent Type Selection - Only shown when FOR_RENT is selected */}
            {showRentTypes && (
                <Box variant="column" className='w-full items-start'>
                    <Label htmlFor="rentTypeSelect">
                        {direction === "ltr" ? 'Rent Type' : 'نوع الإيجار'}
                        <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                        value={rentType}
                        onValueChange={(value) => onRentTypeChange(value as RentType)}
                    >
                        <SelectTrigger className="w-full md:w-[180px]" id="rentTypeSelect">
                            <SelectValue placeholder={direction === "ltr" ? 'Select rent type' : 'اختر نوع الإيجار'} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value={RentType.DAILY}>
                                    {direction === "ltr" ? 'Daily' : 'يومي'}
                                </SelectItem>
                                <SelectItem value={RentType.WEEKLY}>
                                    {direction === "ltr" ? 'Weekly' : 'أسبوعي'}
                                </SelectItem>
                                <SelectItem value={RentType.MONTHLY}>
                                    {direction === "ltr" ? 'Monthly' : 'شهري'}
                                </SelectItem>
                                <SelectItem value={RentType.YEARLY}>
                                    {direction === "ltr" ? 'Yearly' : 'سنوي'}
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </Box>
            )}
        </Box>
    );
};

export default ProductTypeSelect;