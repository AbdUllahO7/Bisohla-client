'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { format } from 'date-fns';
import { CalendarIcon, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import SelectFieldWithSearch from '@/components/web/design/SelectFieldWithSearch';
import { cn } from '@/lib/utils';
import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { AttributeFormValue } from '@/lib/listing-attributes/types/attribute-form.types';
import { useAttributeFieldLogic } from './useAttributeFieldLogic';

export interface AttributeFieldProps {
  attribute: FormAttributeDto;
  value: AttributeFormValue | undefined;
  onChange: (value: AttributeFormValue) => void;
  required?: boolean;
  disabled?: boolean;
  /** i18n key under `attributeForm` — shown as a caption once validation ran. */
  error?: string | null;
  /** Full-width label style used for long text fields. */
  className?: string;
}

const INPUT_CLASS = 'h-11 border-gray-300 dark:border-zinc-800 focus:border-[#198341] transition-all';
const TRIGGER_CLASS = 'h-11 border-gray-300 dark:border-zinc-800 focus:border-[#198341]';

/**
 * Generic per-type control for one scalar attribute (label + input). Reference
 * attributes, multi-select cards, boolean cards and repeating groups have their own
 * layouts in `DynamicFormStep`; repeating-group children reuse this component.
 */
const AttributeField: React.FC<AttributeFieldProps> = ({
  attribute,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  className,
}) => {
  const locale = useLocale() as 'en' | 'ar';
  const isArabic = locale === 'ar';
  const tAttr = useTranslations('attributeForm');
  const logic = useAttributeFieldLogic({ attribute, value, locale, onChange });
  const placeholder = attribute.hint || attribute.name;
  const type = attribute.type;
  const isWide = type === 'textarea' || (type === 'text' && attribute.isTranslatable);

  const renderLabel = () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5 pb-1">
        {attribute.iconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={attribute.iconUrl} alt="" className="w-5 h-5 rounded-sm object-contain" />
        )}
        <Label className="text-[#1a2b28] dark:text-white font-bold tracking-tight text-base">
          {attribute.name}
          {required && <span className={cn('text-red-500', isArabic ? 'mr-1' : 'ml-1')}>*</span>}
        </Label>
        {attribute.hint && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={14} className="text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">{attribute.hint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );

  const renderControl = () => {
    switch (type) {
      case 'color_picker':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={logic.stringValue || '#000000'}
              disabled={disabled}
              onChange={(e) => logic.handleText(e.target.value)}
              className="w-12 h-11 border border-gray-300 dark:border-zinc-800 rounded-xl cursor-pointer p-1 bg-white dark:bg-zinc-900 shadow-sm"
            />
            <Input
              type="text"
              placeholder="#000000"
              value={logic.stringValue}
              disabled={disabled}
              onChange={(e) => logic.handleText(e.target.value)}
              className={cn(INPUT_CLASS, 'font-mono', isArabic && 'text-right')}
              dir="ltr"
            />
          </div>
        );

      case 'year':
        return (
          <SelectFieldWithSearch
            name={attribute.slug}
            options={logic.yearOptions}
            value={logic.stringValue}
            onChange={(_, val) => logic.handleYear(String(val ?? ''))}
            placeholder={placeholder}
            searchPlaceholder={tAttr('search_in_attribute', { attribute: attribute.name })}
            emptyMessage={tAttr('options_empty_title')}
            isRtl={isArabic}
            disabled={disabled}
            SelectTriggerStyle={TRIGGER_CLASS}
          />
        );

      case 'select':
      case 'color_selection':
        return (
          <SelectFieldWithSearch
            name={attribute.slug}
            options={logic.options}
            value={logic.stringValue}
            onChange={(_, val) => logic.handleSelect(String(val ?? ''))}
            placeholder={placeholder}
            searchPlaceholder={tAttr('search_in_attribute', { attribute: attribute.name })}
            emptyMessage={tAttr('options_empty_title')}
            isRtl={isArabic}
            disabled={disabled}
            SelectTriggerStyle={TRIGGER_CLASS}
          />
        );

      case 'multi_select':
      case 'color_multi_selection':
        return (
          <SelectFieldWithSearch
            name={attribute.slug}
            options={logic.options}
            value={logic.selectedIds}
            onChange={(_, val) => logic.handleMulti(Array.isArray(val) ? val : val ? [String(val)] : [])}
            placeholder={placeholder}
            searchPlaceholder={tAttr('search_in_attribute', { attribute: attribute.name })}
            emptyMessage={tAttr('options_empty_title')}
            isRtl={isArabic}
            disabled={disabled}
            isMulti
            SelectTriggerStyle={TRIGGER_CLASS}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={placeholder}
            value={logic.stringValue}
            min={attribute.validationRules?.min}
            max={attribute.validationRules?.max}
            disabled={disabled}
            onChange={(e) => logic.handleNumber(e.target.value)}
            className={cn(INPUT_CLASS, isArabic && 'text-right')}
            dir={isArabic ? 'rtl' : 'ltr'}
          />
        );

      case 'range':
        return (
          <div className="flex items-center gap-3">
            <Input
              type="number"
              placeholder={tAttr('range_min')}
              value={logic.range.min ?? ''}
              disabled={disabled}
              onChange={(e) => logic.handleRange('min', e.target.value)}
              className={cn(INPUT_CLASS, isArabic && 'text-right')}
            />
            <span className="text-gray-400">–</span>
            <Input
              type="number"
              placeholder={tAttr('range_max')}
              value={logic.range.max ?? ''}
              disabled={disabled}
              onChange={(e) => logic.handleRange('max', e.target.value)}
              className={cn(INPUT_CLASS, isArabic && 'text-right')}
            />
          </div>
        );

      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            value={logic.stringValue}
            disabled={disabled}
            onChange={(e) => logic.handleText(e.target.value)}
            className={cn('min-h-[120px] border-gray-300 dark:border-zinc-800 focus:border-[#198341] transition-all', isArabic && 'text-right')}
            dir={isArabic ? 'rtl' : 'ltr'}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center gap-2 h-11">
            <Checkbox
              id={`attr-${attribute.id}`}
              checked={logic.booleanValue}
              disabled={disabled}
              onCheckedChange={(checked) => logic.handleBoolean(checked === true)}
              className="data-[state=checked]:bg-[#198341] data-[state=checked]:border-[#198341]"
            />
            <Label htmlFor={`attr-${attribute.id}`} className="text-sm text-gray-500 dark:text-zinc-400 cursor-pointer">
              {attribute.hint || attribute.name}
            </Label>
          </div>
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                disabled={disabled}
                className={cn(
                  'w-full h-11 px-3 text-left font-normal border-gray-300 dark:border-zinc-800 focus:border-[#198341] justify-between rounded-xl shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-zinc-800',
                  !logic.dateValue && 'text-muted-foreground',
                  isArabic && 'text-right',
                )}
                dir={isArabic ? 'rtl' : 'ltr'}
              >
                {logic.dateValue ? format(logic.dateValue, 'PPP') : <span>{placeholder}</span>}
                <CalendarIcon className="h-4 w-4 opacity-50 text-[#198341]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-white dark:bg-zinc-900 border dark:border-zinc-800" align="start" dir={isArabic ? 'rtl' : 'ltr'}>
              <Calendar mode="single" selected={logic.dateValue} onSelect={(d) => logic.handleDate(d ?? undefined)} initialFocus />
            </PopoverContent>
          </Popover>
        );

      case 'text':
      default:
        if (attribute.isTranslatable) {
          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['ar', 'en'] as const).map((lang) => (
                <Input
                  key={lang}
                  placeholder={`${placeholder} (${tAttr(`locale_${lang}`)})`}
                  value={logic.translatable[lang] ?? ''}
                  disabled={disabled}
                  onChange={(e) => logic.handleTranslatable(lang, e.target.value)}
                  className={cn(INPUT_CLASS, lang === 'ar' && 'text-right')}
                  dir={lang === 'ar' ? 'rtl' : 'ltr'}
                />
              ))}
            </div>
          );
        }
        return (
          <Input
            type="text"
            placeholder={placeholder}
            value={logic.stringValue}
            disabled={disabled}
            onChange={(e) => logic.handleText(e.target.value)}
            className={cn(INPUT_CLASS, isArabic && 'text-right')}
            dir={isArabic ? 'rtl' : 'ltr'}
          />
        );
    }
  };

  return (
    <div className={cn('space-y-4', isWide && 'md:col-span-2 lg:col-span-4', className)}>
      {renderLabel()}
      {renderControl()}
      {error && <p className="text-xs text-red-500 font-medium">{tAttr(error)}</p>}
    </div>
  );
};

export default AttributeField;
