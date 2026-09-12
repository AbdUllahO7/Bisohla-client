'use client';

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Text from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import CarBlueprint from '../../../../product/CarBlueprint';
import MotorcycleBlueprint from '../../../../product/MotorcycleBlueprint';
import { DAMAGE_TYPE_SLUG, DAMAGE_ZONE_SLUG, type DamageBlueprintKind } from '@/lib/listing-attributes/presets/listing-type-presets';

export type DamageRow = Record<string, unknown> & { [DAMAGE_ZONE_SLUG]?: string; [DAMAGE_TYPE_SLUG]?: string };

interface DamageMatrixProps {
  attribute: FormAttributeDto;
  value: DamageRow[];
  onChange: (value: DamageRow[]) => void;
  /** Which SVG to draw; `null` renders the zone × type table instead. */
  blueprint: DamageBlueprintKind | null;
}

/** Colours keyed on the damage-type option id (Scratch / paint / replacement …). */
const tableColorFor = (typeId: string): string => {
  const id = typeId.toLowerCase();
  if (id.includes('paint') || id.includes('طلاء')) return 'bg-emerald-500';
  if (id.includes('scratch') || id.includes('خدش')) return 'bg-red-500';
  if (id.includes('replacement') || id.includes('استبدال')) return 'bg-purple-500';
  return 'bg-amber-500';
};

const buttonStyleFor = (typeId: string, isSelected: boolean): string => {
  const id = typeId.toLowerCase();
  if (id.includes('paint') || id.includes('طلاء')) {
    return isSelected
      ? 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-500'
      : 'hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900';
  }
  if (id.includes('scratch') || id.includes('خدش')) {
    return isSelected
      ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
      : 'hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900';
  }
  if (id.includes('replacement') || id.includes('استبدال')) {
    return isSelected
      ? 'bg-purple-500 hover:bg-purple-600 text-white border-purple-500'
      : 'hover:bg-purple-50 dark:hover:bg-purple-950/20 text-purple-600 border-purple-200 dark:border-purple-900';
  }
  return isSelected ? 'bg-amber-500 text-white border-amber-500' : 'hover:bg-amber-50 text-amber-600 border-amber-200';
};

/**
 * Interactive damage map for a `repeating_group` whose children are the
 * `damage_zone` + `damage_type` selects. Rows are keyed by child slug exactly as the
 * generic editor would key them, so the payload is the same either way.
 */
const DamageMatrix: React.FC<DamageMatrixProps> = ({ attribute, value, onChange, blueprint }) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const t = useTranslations('addProduct.damageMatrix');
  const lang = isArabic ? 'ar' : 'en';

  const zoneAttr = attribute.childAttributes?.find((a) => a.slug === DAMAGE_ZONE_SLUG);
  const typeAttr = attribute.childAttributes?.find((a) => a.slug === DAMAGE_TYPE_SLUG);

  const [selectedZoneId, setSelectedZoneId] = React.useState<string | null>(null);
  const [selectedZoneLabel, setSelectedZoneLabel] = React.useState<string>('');

  if (!zoneAttr || !typeAttr) return null;

  const zones = zoneAttr.options ?? [];
  const types = typeAttr.options ?? [];
  const labelOf = (opt: { id: string; label?: { en: string; ar: string } }) => opt.label?.[lang] || opt.label?.en || opt.id;

  const rows = Array.isArray(value) ? value : [];
  const existingDamage = selectedZoneId ? rows.find((v) => v[DAMAGE_ZONE_SLUG] === selectedZoneId) : null;

  const toggle = (zoneId: string, typeId: string) => {
    const existing = rows.find((v) => v[DAMAGE_ZONE_SLUG] === zoneId);
    let next = [...rows];
    if (existing) {
      if (existing[DAMAGE_TYPE_SLUG] === typeId) {
        next = next.filter((v) => v[DAMAGE_ZONE_SLUG] !== zoneId);
      } else {
        next = next.map((v) => (v[DAMAGE_ZONE_SLUG] === zoneId ? { ...v, [DAMAGE_TYPE_SLUG]: typeId } : v));
      }
    } else {
      next.push({ [DAMAGE_ZONE_SLUG]: zoneId, [DAMAGE_TYPE_SLUG]: typeId });
    }
    onChange(next);
  };

  const handleClearDamage = () => {
    if (!selectedZoneId) return;
    onChange(rows.filter((v) => v[DAMAGE_ZONE_SLUG] !== selectedZoneId));
  };

  if (blueprint == null) {
    return (
      <div
        className="w-full overflow-hidden rounded-xl border border-gray-100 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <table className="w-full border-collapse">
          <thead className="bg-gray-100/80 dark:bg-zinc-800/80">
            <tr>
              <th className="py-4 px-4 text-sm font-bold text-gray-500 dark:text-zinc-400 text-center w-1/4 border-b border-gray-200 dark:border-zinc-800">
                {t('section_name')}
              </th>
              {types.map((type) => (
                <th key={type.id} className="py-4 px-2 border-b border-gray-200 dark:border-zinc-800">
                  <div
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-2 rounded-full text-white text-xs font-bold shadow-sm mx-auto',
                      tableColorFor(type.id),
                    )}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-white/50" />
                    {labelOf(type)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {zones.map((zone, idx) => {
              const zoneValue = rows.find((v) => v[DAMAGE_ZONE_SLUG] === zone.id);
              return (
                <tr key={zone.id} className={cn(idx % 2 === 0 ? 'bg-white dark:bg-zinc-900' : 'bg-gray-50/30 dark:bg-zinc-800/20')}>
                  <td
                    className={cn(
                      'py-4 px-6 text-sm font-semibold text-gray-700 dark:text-zinc-300 border-b border-gray-100 dark:border-zinc-800',
                      isArabic ? 'text-right' : 'text-left',
                    )}
                  >
                    {labelOf(zone)}
                  </td>
                  {types.map((type) => {
                    const isSelected = zoneValue?.[DAMAGE_TYPE_SLUG] === type.id;
                    return (
                      <td key={type.id} className="py-4 px-2 text-center border-b border-gray-100 dark:border-zinc-800">
                        <button
                          type="button"
                          onClick={() => toggle(zone.id, type.id)}
                          className={cn(
                            'w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center mx-auto',
                            isSelected
                              ? 'border-[#198341] bg-white dark:bg-zinc-900 scale-110 shadow-sm'
                              : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#198341]/50',
                          )}
                        >
                          {isSelected && <div className="w-3 h-3 rounded-full bg-[#198341]" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const Blueprint = blueprint === 'motorcycle' ? MotorcycleBlueprint : CarBlueprint;
  const hintKey = blueprint === 'motorcycle' ? 'click_motorcycle_panel' : 'click_car_panel';
  const emptyKey = blueprint === 'motorcycle' ? 'empty_motorcycle' : 'empty_car';

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="flex-1 bg-gray-50/50 dark:bg-zinc-950/20 p-6 rounded-2xl border border-slate-100 dark:border-zinc-800 flex flex-col items-center justify-center">
        <Text className="text-sm font-bold text-gray-700 dark:text-zinc-300 mb-4 text-center">{t(hintKey)}</Text>
        <div className="w-full max-w-[280px]">
          <Blueprint
            damages={rows}
            selectedZone={selectedZoneId}
            onZoneSelect={(zoneId: string, label: string) => {
              setSelectedZoneId(zoneId);
              setSelectedZoneLabel(label);
            }}
            isInteractive={true}
          />
        </div>
      </div>

      <div className="w-full lg:w-[350px] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col min-h-[350px]">
        {selectedZoneId ? (
          <div className="flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center gap-2 border-b pb-4 mb-5 dark:border-zinc-800">
                <div className="w-1.5 h-4 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
                <Text className="font-bold text-gray-800 dark:text-white text-lg">{selectedZoneLabel}</Text>
              </div>

              <Text className="text-xs text-gray-400 font-medium mb-3 block">{t('select_type')}</Text>

              <div className="flex flex-col gap-3">
                {types.map((type) => {
                  const isSelected = existingDamage?.[DAMAGE_TYPE_SLUG] === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => toggle(selectedZoneId, type.id)}
                      className={cn(
                        'w-full h-11 border rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200',
                        buttonStyleFor(type.id, isSelected),
                      )}
                    >
                      {labelOf(type)}
                    </button>
                  );
                })}
              </div>
            </div>

            {existingDamage && (
              <button
                type="button"
                onClick={handleClearDamage}
                className="w-full h-11 border border-red-200 dark:border-red-950/50 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-600 font-bold text-sm rounded-xl mt-6 transition-all"
              >
                {t('clear_damage')}
              </button>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-zinc-800 flex items-center justify-center mb-4 border border-dashed border-slate-200 dark:border-zinc-700">
              <span className="text-xl">📍</span>
            </div>
            <Text className="font-bold text-slate-800 dark:text-zinc-200 text-sm mb-1">{t('no_section_selected')}</Text>
            <Text className="text-xs text-slate-400 dark:text-zinc-500 max-w-[200px] leading-relaxed">{t(emptyKey)}</Text>
          </div>
        )}
      </div>
    </div>
  );
};

export default DamageMatrix;
