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

interface SelectDropdownProps {
  label?: string; // Optional label for the dropdown
  options: { value: string; label: string }[]; // Define the structure of the options
  placeholder?: string; // Placeholder text
  className?: string; // Additional class names
  SelectTriggerStyle?: string;
  labelStyle?: string;
}

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
    <div className={`flex flex-col   ${className}`}>
      {label && (
        <label
          className={`mb-1 text-sm  text-gray-700 font-cairo font-[700] ${labelStyle}`}
        >
          {label}
        </label>
      )}
      <Select>
        <SelectTrigger
          className={`w-44   ${SelectTriggerStyle}`}
          dir={`${t('lang') === 'ar' ? 'rtl' : 'ltr'}`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-primary">
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
