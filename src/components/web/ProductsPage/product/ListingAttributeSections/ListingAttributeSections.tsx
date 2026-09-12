'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import type {
  ChipsDisplayRow,
  DisplaySection,
  RepeatingDisplayRow,
  SimpleDisplayRow,
} from '@/lib/listing-attributes/attribute-sections/attribute-sections';
import { resolvePreset } from '@/lib/listing-attributes/presets/listing-type-presets';
import AttributeGrid from '../AttributeGrid';
import AccordionProductDetails from '../Tabs/AccordionProductDetails';

interface ListingAttributeSectionsProps {
  sections: DisplaySection[];
  listingTypeSlug: string | null | undefined;
}

const SectionCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="shadow-xl bg-white dark:bg-zinc-900 border dark:border-zinc-800 p-4 rounded-lg w-full mb-4">
    <div className="font-cairo font-bold text-primary dark:text-[#ABDE3B] mb-6">
      <span className="border-b-2 pb-1 border-primary-light dark:border-[#ABDE3B]">{title}</span>
    </div>
    {children}
  </div>
);

const ChipsBlock: React.FC<{ row: ChipsDisplayRow }> = ({ row }) => (
  <div className="mb-6 last:mb-0">
    <p className="text-sm font-bold text-[#2C3C39] dark:text-zinc-200 mb-3">{row.label}</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {row.chips.map((chip) => (
        <div key={chip.id} className="relative group/feature">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-xl opacity-0 group-hover/feature:opacity-20 blur transition-opacity duration-300" />
          <div className="relative flex items-center bg-white dark:bg-zinc-900 p-3 rounded-xl shadow-sm border-2 border-slate-200 dark:border-zinc-800 hover:border-[#198341] dark:hover:border-[#ABDE3B] hover:shadow-lg transition-all duration-300 h-12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[#198341]/5 to-[#ABDE3B]/5 dark:from-[#ABDE3B]/5 dark:to-[#ABDE3B]/10 opacity-0 group-hover/feature:opacity-100 transition-opacity duration-300" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 group-hover/feature:h-8 bg-gradient-to-b from-[#198341] to-[#ABDE3B] transition-all duration-300 rounded-r-full" />
            <div className="relative mr-3 ml-1 flex-shrink-0">
              <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover/feature:opacity-30 transition-opacity duration-300" />
              {chip.color ? (
                <span className="block h-5 w-5 rounded-md border border-gray-300 dark:border-zinc-700 shadow-sm" style={{ backgroundColor: chip.color }} />
              ) : (
                <div className="h-5 w-5 rounded-md border-2 border-[#198341] dark:border-[#ABDE3B] bg-gradient-to-br from-[#198341] to-[#198341] dark:from-[#ABDE3B] dark:to-[#ABDE3B] flex items-center justify-center text-white dark:text-zinc-950 shadow-sm transition-all duration-300 group-hover/feature:scale-110">
                  <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
            <span className="relative z-10 text-sm font-medium text-[#2C3C39] dark:text-zinc-300 truncate group-hover/feature:text-[#198341] dark:group-hover/feature:text-[#ABDE3B] group-hover/feature:font-semibold transition-all duration-300">
              {chip.label}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const RepeatingBlock: React.FC<{ row: RepeatingDisplayRow; listingTypeSlug: string | null | undefined }> = ({ row, listingTypeSlug }) => {
  const t = useTranslations('product.sections');
  const preset = resolvePreset(listingTypeSlug, row.attribute);

  if (preset?.kind === 'damage_matrix') {
    return <AccordionProductDetails damages={row.items as { damage_zone?: string; damage_type?: string }[]} blueprint={preset.blueprint} />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {row.rows.map((item) => (
        <div key={item.index} className="rounded-xl border-2 border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
          <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
            {t('item_title', { index: item.index + 1 })}
          </p>
          <div className="space-y-1.5">
            {item.cells.map((cell) => (
              <div key={cell.childId} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-gray-500 dark:text-zinc-400">{cell.label}</span>
                <span className="font-semibold text-[#2C3C39] dark:text-zinc-200 flex items-center gap-1.5">
                  {cell.swatch && <span className="w-3 h-3 rounded-full border border-gray-300 dark:border-zinc-700" style={{ backgroundColor: cell.swatch }} />}
                  {cell.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

/** Schema sections → the existing card / chip / damage-map blocks, one card per section. */
const ListingAttributeSections: React.FC<ListingAttributeSectionsProps> = ({ sections, listingTypeSlug }) => {
  if (sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        const simple = section.rows.filter((r): r is SimpleDisplayRow => r.kind === 'simple');
        const chips = section.rows.filter((r): r is ChipsDisplayRow => r.kind === 'chips');
        const repeating = section.rows.filter((r): r is RepeatingDisplayRow => r.kind === 'repeating');
        return (
          <SectionCard key={section.id} title={section.name}>
            {simple.length > 0 && <AttributeGrid rows={simple} />}
            {chips.length > 0 && <div className={simple.length > 0 ? 'mt-6' : ''}>{chips.map((row) => <ChipsBlock key={row.attributeId} row={row} />)}</div>}
            {repeating.map((row) => (
              <div key={row.attributeId} className="mt-6">
                <p className="text-sm font-bold text-[#2C3C39] dark:text-zinc-200 mb-3">{row.label}</p>
                <RepeatingBlock row={row} listingTypeSlug={listingTypeSlug} />
              </div>
            ))}
          </SectionCard>
        );
      })}
    </>
  );
};

export default ListingAttributeSections;
