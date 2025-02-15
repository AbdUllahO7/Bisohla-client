'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useTranslations } from 'next-intl';
import { SelectDropdownProps } from '@/types/homePageTypes';

const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  options,
  placeholder = 'Select an option',
  className = '',
  SelectTriggerStyle,
  labelStyle,
}) => {
  const t = useTranslations('homePage');

  return (
    <div className={`flex flex-col w-full    ${className}`}>
      {label && (
        <label
          className={`mb-1 text-sm  text-gray-700 font-cairo font-[700] ${labelStyle}`}
        >
          {label}
        </label>
      )}
      <Select>
        <SelectTrigger
          className={`w-50   ${SelectTriggerStyle} p-1`}
          dir={`${t('lang') === 'ar' ? 'rtl' : 'ltr'}`}
        >
          <SelectValue placeholder={placeholder}  />
        </SelectTrigger>
        <SelectContent className="bg-primary  " dir={`${t('lang') === 'ar' ? 'rtl' : 'ltr'}`} >
          {options.map((option) => (
            <SelectItem
              className=" focus:bg-primary-light hover:text-white transition-all duration-200 font-cairo font-[700]"
              key={option.value}
              value={option.value}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default SelectDropdown;
