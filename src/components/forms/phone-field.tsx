'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { COUNTRY_CODES, CountryCodeItem } from '@/core/lib/phone/country-codes';
import { repairPhone, sanitizePhoneInput } from '@/core/lib/phone/phone.util';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ChevronDown, Search, Check } from 'lucide-react';

export interface PhoneFieldProps {
  dialCode: string;
  onDialCodeChange: (code: string) => void;
  localNumber: string;
  onLocalNumberChange: (value: string) => void;
  onLocalNumberBlur?: () => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  name?: string;
  className?: string;
}

export const PhoneField: React.FC<PhoneFieldProps> = ({
  dialCode,
  onDialCodeChange,
  localNumber,
  onLocalNumberChange,
  onLocalNumberBlur,
  label,
  required = false,
  placeholder = '944 123 456',
  helper,
  error,
  disabled = false,
  name,
  className,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('phone');

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeCountry = useMemo(() => {
    return (
      COUNTRY_CODES.find((c) => c.dial === dialCode) ||
      COUNTRY_CODES.find((c) => c.iso === 'SY') ||
      COUNTRY_CODES[0]
    );
  }, [dialCode]);

  const filteredCountries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return COUNTRY_CODES;
    return COUNTRY_CODES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.nameAr.includes(q) ||
        c.dial.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const sanitized = sanitizePhoneInput(rawVal);
    const isSpecial =
      sanitized.startsWith('+') || sanitized.startsWith('00') || sanitized.length - localNumber.length > 1;

    if (isSpecial) {
      const result = repairPhone(sanitized, dialCode);
      if (result.isValid) {
        onLocalNumberChange(result.localNumber);
        if (result.dialCode !== dialCode) {
          onDialCodeChange(result.dialCode);
        }
        return;
      }
    }
    onLocalNumberChange(sanitized);
  };

  const handleInputBlur = () => {
    const result = repairPhone(localNumber, dialCode);
    if (result.isValid) {
      if (result.localNumber !== localNumber) {
        onLocalNumberChange(result.localNumber);
      }
      if (result.dialCode !== dialCode) {
        onDialCodeChange(result.dialCode);
      }
    }
    onLocalNumberBlur?.();
  };

  const handleSelectCountry = (country: CountryCodeItem) => {
    onDialCodeChange(country.dial);
    setIsOpen(false);
  };

  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      {label && (
        <Label className="text-xs sm:text-sm font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}

      {/* Input Row: Pinned LTR across all locales */}
      <div
        dir="ltr"
        className={cn(
          'flex items-center rounded-xl border bg-white dark:bg-zinc-950 transition-all shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500',
          error
            ? 'border-red-500 dark:border-red-600 focus-within:ring-red-500/20 focus-within:border-red-500'
            : 'border-slate-200 dark:border-zinc-800',
          disabled && 'opacity-60 bg-gray-50 dark:bg-zinc-900 cursor-not-allowed',
        )}
      >
        {/* Country Picker Trigger */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-2.5 h-11 border-r border-slate-200 dark:border-zinc-800 bg-gray-50/70 hover:bg-gray-100 dark:bg-zinc-900/70 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 rounded-l-xl transition-colors select-none text-xs font-semibold flex-shrink-0"
            >
              <span className="text-base leading-none">{activeCountry.flag}</span>
              <span className="font-mono text-xs text-gray-800 dark:text-zinc-200">
                {activeCountry.dial}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </PopoverTrigger>

          <PopoverContent
            align="start"
            sideOffset={4}
            className="w-72 p-0 rounded-2xl shadow-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-[9999]"
          >
            {/* Search Input */}
            <div className="p-2 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400 ms-1 flex-shrink-0" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('country_search')}
                className="h-8 text-xs border-0 shadow-none focus-visible:ring-0 bg-transparent px-1"
              />
            </div>

            {/* Country List */}
            <div className="max-h-56 overflow-y-auto p-1 text-xs">
              {filteredCountries.map((c) => {
                const isSelected = c.dial === dialCode;
                return (
                  <button
                    key={`${c.iso}-${c.dial}`}
                    type="button"
                    onClick={() => handleSelectCountry(c)}
                    className={cn(
                      'w-full flex items-center justify-between p-2 rounded-xl transition-colors text-start',
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-[#ABDE3B] font-semibold'
                        : 'hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200',
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base leading-none">{c.flag}</span>
                      <span className="truncate">
                        {isRTL ? c.nameAr : c.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0 ms-2">
                      <span className="font-mono text-[11px] text-gray-400">
                        {c.dial}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-[#ABDE3B]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Local Number Digits Field */}
        <input
          type="tel"
          name={name}
          disabled={disabled}
          value={localNumber}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          dir="ltr"
          style={{ unicodeBidi: 'isolate', textAlign: 'left' }}
          className="flex-1 h-11 px-3 py-2 bg-transparent text-gray-900 dark:text-zinc-100 placeholder:text-gray-400 text-sm font-medium focus:outline-none disabled:cursor-not-allowed"
        />
      </div>

      {/* Helper text */}
      {helper && !error && (
        <p className="text-[11px] text-gray-500 dark:text-zinc-400 leading-tight">
          {helper}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 font-medium leading-tight">
          {error}
        </p>
      )}
    </div>
  );
};

export default PhoneField;
