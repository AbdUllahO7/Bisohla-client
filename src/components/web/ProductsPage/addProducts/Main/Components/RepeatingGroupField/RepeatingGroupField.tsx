'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Text from '@/components/ui/text';
import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { AttributeFormValue } from '@/lib/listing-attributes/types/attribute-form.types';
import AttributeField from '../AttributeField/AttributeField';

interface RepeatingGroupFieldProps {
  attribute: FormAttributeDto;
  value: Record<string, AttributeFormValue>[];
  onChange: (value: Record<string, AttributeFormValue>[] | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string | null;
}

/** Generic editor for any `repeating_group`: one card per row, children keyed by slug. */
const RepeatingGroupField: React.FC<RepeatingGroupFieldProps> = ({ attribute, value, onChange, required, disabled, error }) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const t = useTranslations('addProduct.repeatingGroup');
  const tAttr = useTranslations('attributeForm');
  const children = (attribute.childAttributes ?? []).filter((c) => c.isActive !== false);
  const rows = Array.isArray(value) ? value : [];

  const update = (next: Record<string, AttributeFormValue>[]) => onChange(next.length === 0 ? null : next);

  const addRow = () => update([...rows, {}]);
  const removeRow = (index: number) => update(rows.filter((_, i) => i !== index));
  const setCell = (index: number, slug: string, cell: AttributeFormValue) =>
    update(rows.map((row, i) => (i === index ? { ...row, [slug]: cell } : row)));

  return (
    <Card className="border-0 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800" dir={isArabic ? 'rtl' : 'ltr'}>
      <CardHeader className="bg-gray-50/50 dark:bg-zinc-800/50 border-b dark:border-zinc-800 py-5 px-6">
        <div className="flex justify-between items-center">
          <Text className="font-bold text-gray-800 dark:text-white text-lg">
            {attribute.name}
            {required && <span className="text-red-500 ms-1">*</span>}
          </Text>
          <div className="bg-[#1e293b] dark:bg-zinc-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">{rows.length}</div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-gray-100 dark:border-zinc-800 p-4 space-y-4">
            <div className="flex items-center justify-between">
              <Text className="text-sm font-semibold text-gray-600 dark:text-zinc-300">{t('item_title', { index: index + 1 })}</Text>
              <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeRow(index)} className="text-red-500 hover:text-red-600 gap-1">
                <Trash2 className="w-4 h-4" />
                {t('remove')}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map((child) => (
                <AttributeField
                  key={child.id}
                  attribute={child}
                  value={row[child.slug]}
                  required={child.isRequired}
                  disabled={disabled}
                  onChange={(cell) => setCell(index, child.slug, cell)}
                />
              ))}
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" disabled={disabled} onClick={addRow} className="gap-1.5 rounded-xl">
          <Plus className="w-4 h-4" />
          {t('add')}
        </Button>
        {error && <p className="text-xs text-red-500 font-medium">{tAttr(error)}</p>}
      </CardContent>
    </Card>
  );
};

export default RepeatingGroupField;
