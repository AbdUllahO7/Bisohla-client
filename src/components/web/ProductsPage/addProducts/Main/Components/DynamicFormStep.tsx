'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Text from '@/components/ui/text';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { SectionDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { ProposeReferenceResult } from '@/core/entities/models/listings/reference-proposal.dto';
import { useReferenceProposalGate } from '@/hooks/useReferenceProposalGate';
import { readSelectedOptionIds, resolveOptionLabel } from '@/lib/listing-attributes/attribute-format/attribute-format';
import type { AttributeFormValue, AttributeWithDisplay } from '@/lib/listing-attributes/types/attribute-form.types';
import ProposeReferenceDialog from '../../ProposeReferenceDialog';
import { useListingWizard } from '../context/listing-wizard.context';
import { useWizardAttributeForm } from '../hooks/useWizardAttributeForm';
import AttributeField from './AttributeField/AttributeField';
import DamageMatrix, { type DamageRow } from './DamageMatrix/DamageMatrix';
import DynamicSectionHeader from './DynamicSectionHeader';
import { resolvePreset } from '@/lib/listing-attributes/presets/listing-type-presets';
import ReferenceAttributeField from './ReferenceAttributeField/ReferenceAttributeField';
import RepeatingGroupField from './RepeatingGroupField/RepeatingGroupField';

interface DynamicFormStepProps {
  section: SectionDto;
  onValidationChange: (isValid: boolean) => void;
  /** Show inline errors (after the seller tried to advance). */
  showErrors?: boolean;
}

const CARD_TYPES = new Set(['multi_select', 'boolean']);
const OWN_LAYOUT_TYPES = new Set(['reference', 'repeating_group', ...CARD_TYPES]);

/**
 * One schema section, rendered purely from attribute `type` + the display flags
 * computed by the attribute engine. Visual groups are unchanged from the old step:
 * reference pickers → scalar grid → repeating groups → multi_select / boolean cards.
 */
const DynamicFormStep: React.FC<DynamicFormStepProps> = ({ section, onValidationChange, showErrors = false }) => {
  const locale = useLocale() as 'en' | 'ar';
  const isArabic = locale === 'ar';
  const tAttr = useTranslations('attributeForm');
  const { state } = useListingWizard();
  const form = useWizardAttributeForm();

  const displaySection = useMemo(() => form.sections.find((s) => s.id === section.id), [form.sections, section.id]);
  const attributes = useMemo(
    () => (displaySection?.attributes ?? []).filter((a) => !a.hidden).sort((a, b) => a.order - b.order),
    [displaySection],
  );

  const sectionErrorCount = useMemo(
    () => attributes.filter((a) => form.errors[a.id] != null).length,
    [attributes, form.errors],
  );
  useEffect(() => {
    onValidationChange(sectionErrorCount === 0);
  }, [sectionErrorCount, onValidationChange]);

  const { minNameLength, maxNameLength, canProposeFor } = useReferenceProposalGate(form.proposals);
  const [proposeDialog, setProposeDialog] = useState<{ open: boolean; attr: AttributeWithDisplay | null; initialSearch: string }>({
    open: false,
    attr: null,
    initialSearch: '',
  });

  const parentRefId = (attr: AttributeWithDisplay): number | null => {
    if (attr.dependsOnAttributeId == null) return null;
    const v = form.attributeValues[attr.dependsOnAttributeId];
    return typeof v === 'number' ? v : null;
  };
  const parentName = (attr: AttributeWithDisplay): string | null =>
    attr.dependsOnAttributeId == null ? null : form.allAttributes.find((a) => a.id === attr.dependsOnAttributeId)?.name ?? null;
  const parentProposed = (attr: AttributeWithDisplay): boolean =>
    attr.dependsOnAttributeId != null && form.proposals[attr.dependsOnAttributeId] != null;

  const handleResolveProposal = (result: ProposeReferenceResult) => {
    const attr = proposeDialog.attr;
    if (!attr) return;
    if (result.kind === 'propose') form.setProposal(attr.id, result.name);
    else form.pickCandidate(attr.id, result);
  };

  const errorFor = (id: number) => (showErrors ? form.errors[id] ?? null : null);

  const references = attributes.filter((a) => a.type === 'reference');
  const scalars = attributes.filter((a) => !OWN_LAYOUT_TYPES.has(a.type));
  const repeating = attributes.filter((a) => a.type === 'repeating_group');
  const multiSelects = attributes.filter((a) => a.type === 'multi_select');
  const booleans = attributes.filter((a) => a.type === 'boolean');

  const booleanGroups = useMemo(() => {
    const groups: Record<string, AttributeWithDisplay[]> = {};
    for (const b of booleans) {
      const gName = b.referenceGroup?.name || section.name;
      (groups[gName] ??= []).push(b);
    }
    return groups;
  }, [booleans, section.name]);

  return (
    <div className="space-y-8" dir={isArabic ? 'rtl' : 'ltr'}>
      <DynamicSectionHeader title={section.name} />

      <div className="space-y-10">
        {references.length > 0 && (
          <div className="flex flex-wrap justify-center gap-10 pb-10 border-b border-gray-100 dark:border-zinc-800 mb-6">
            {references.map((attr) => {
              const pRefId = parentRefId(attr);
              const value = form.attributeValues[attr.id];
              return (
                <ReferenceAttributeField
                  key={attr.id}
                  attribute={attr}
                  value={typeof value === 'number' ? value : null}
                  snapshot={form.referenceSnapshots[attr.id] ?? null}
                  parentReferenceItemId={pRefId}
                  parentAttributeName={parentName(attr)}
                  parentHasProposal={parentProposed(attr)}
                  required={attr.effectiveRequired}
                  disabled={attr.disabled}
                  pendingProposalName={form.proposals[attr.id]?.name ?? null}
                  onChange={(id, snapshot) => {
                    form.setValue(attr.id, id);
                    form.setSnapshot(attr.id, snapshot);
                  }}
                  onClearProposal={() => form.clearProposal(attr.id)}
                  onProposeClick={
                    canProposeFor(attr, pRefId) && !parentProposed(attr)
                      ? (currentSearch) => setProposeDialog({ open: true, attr, initialSearch: currentSearch })
                      : undefined
                  }
                  error={errorFor(attr.id)}
                />
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {scalars.map((attr) => (
            <AttributeField
              key={attr.id}
              attribute={attr}
              value={form.attributeValues[attr.id]}
              required={attr.effectiveRequired}
              disabled={attr.disabled}
              onChange={(v: AttributeFormValue) => form.setValue(attr.id, v)}
              error={errorFor(attr.id)}
            />
          ))}

          {repeating.map((attr) => {
            const preset = resolvePreset(state.listingType?.slug, attr);
            const rows = (form.attributeValues[attr.id] as Record<string, AttributeFormValue>[] | null | undefined) ?? [];
            return (
              <div key={attr.id} className="col-span-1 md:col-span-2 lg:col-span-4 mt-4">
                {preset?.kind === 'damage_matrix' ? (
                  <DamageMatrix
                    attribute={attr}
                    value={rows as DamageRow[]}
                    onChange={(val) => form.setValue(attr.id, val.length === 0 ? null : val)}
                    blueprint={preset.blueprint}
                  />
                ) : (
                  <RepeatingGroupField
                    attribute={attr}
                    value={rows}
                    required={attr.effectiveRequired}
                    disabled={attr.disabled}
                    onChange={(val) => form.setValue(attr.id, val)}
                    error={errorFor(attr.id)}
                  />
                )}
              </div>
            );
          })}
        </div>

        {(multiSelects.length > 0 || booleans.length > 0) && (
          <div className="mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {multiSelects.map((attr) => {
                const options = attr.options ?? [];
                const selected = readSelectedOptionIds(form.attributeValues[attr.id]);
                const progress = options.length > 0 ? (selected.length / options.length) * 100 : 0;
                return (
                  <Card key={attr.id} className="border-0 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <CardHeader className="bg-gray-50/50 dark:bg-zinc-800/50 border-b dark:border-zinc-800 py-5 px-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <Text className="font-bold text-gray-800 dark:text-white text-lg">
                          {attr.name}
                          {attr.effectiveRequired && <span className="text-red-500 ms-1">*</span>}
                        </Text>
                        <div className="bg-[#1e293b] dark:bg-zinc-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {selected.length}/{options.length}
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#198341] transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {options.map((option) => {
                        const isChecked = selected.includes(option.id);
                        return (
                          <div
                            key={option.id}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-xl transition-all duration-200 border border-transparent',
                              isChecked ? 'bg-gray-50 dark:bg-zinc-800/30 border-gray-200 dark:border-zinc-800 shadow-sm' : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/20',
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                id={`attr-${attr.id}-${option.id}`}
                                checked={isChecked}
                                disabled={attr.disabled}
                                onCheckedChange={(checked) => {
                                  const next = checked ? [...selected, option.id] : selected.filter((v) => v !== option.id);
                                  form.setValue(attr.id, next.length === 0 ? null : next);
                                }}
                                className="data-[state=checked]:bg-[#198341] data-[state=checked]:border-[#198341] w-5 h-5 rounded"
                              />
                              <Label htmlFor={`attr-${attr.id}-${option.id}`} className="text-sm font-medium text-gray-600 dark:text-zinc-300 cursor-pointer flex items-center gap-2">
                                {option.color && (
                                  <span className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-zinc-700 shadow-sm" style={{ backgroundColor: option.color }} />
                                )}
                                {resolveOptionLabel(options, option.id, locale)}
                              </Label>
                            </div>
                            {isChecked && <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-zinc-600" />}
                          </div>
                        );
                      })}
                      {errorFor(attr.id) && <p className="text-xs text-red-500 font-medium px-3">{tAttr(errorFor(attr.id)!)}</p>}
                    </CardContent>
                  </Card>
                );
              })}

              {Object.entries(booleanGroups).map(([gName, attrs]) => {
                const selectedCount = attrs.filter((a) => form.attributeValues[a.id] === true).length;
                const progress = (selectedCount / attrs.length) * 100;
                return (
                  <Card key={gName} className="border-0 shadow-sm bg-white dark:bg-zinc-900 overflow-hidden rounded-2xl border border-gray-100 dark:border-zinc-800">
                    <CardHeader className="bg-gray-50/50 dark:bg-zinc-800/50 border-b dark:border-zinc-800 py-5 px-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <Text className="font-bold text-gray-800 dark:text-white text-lg">{gName}</Text>
                        <div className="bg-[#1e293b] dark:bg-zinc-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                          {selectedCount}/{attrs.length}
                        </div>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#198341] transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }} />
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-2">
                      {attrs.map((attr) => {
                        const isChecked = form.attributeValues[attr.id] === true;
                        return (
                          <div
                            key={attr.id}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-xl transition-all duration-200 border border-transparent',
                              isChecked ? 'bg-gray-50 dark:bg-zinc-800/30 border-gray-200 dark:border-zinc-800 shadow-sm' : 'hover:bg-gray-50/50 dark:hover:bg-zinc-800/20',
                            )}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <Checkbox
                                id={`attr-${attr.id}`}
                                checked={isChecked}
                                disabled={attr.disabled}
                                onCheckedChange={(checked) => form.setValue(attr.id, checked === true)}
                                className="data-[state=checked]:bg-[#198341] data-[state=checked]:border-[#198341] w-5 h-5 rounded"
                              />
                              <Label htmlFor={`attr-${attr.id}`} className="text-sm font-medium text-gray-600 dark:text-zinc-300 cursor-pointer flex items-center gap-2">
                                {attr.iconUrl && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={attr.iconUrl} alt="" className="w-4 h-4 object-contain" />
                                )}
                                {attr.name}
                              </Label>
                            </div>
                            {isChecked && <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-zinc-600" />}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {proposeDialog.attr && (
        <ProposeReferenceDialog
          open={proposeDialog.open}
          onOpenChange={(open: boolean) => setProposeDialog((prev) => ({ ...prev, open }))}
          attributeName={proposeDialog.attr.name}
          groupId={proposeDialog.attr.referenceGroupId!}
          parentItemId={parentRefId(proposeDialog.attr)}
          initialName={proposeDialog.initialSearch}
          minNameLength={minNameLength}
          maxNameLength={maxNameLength}
          onResolve={handleResolveProposal}
        />
      )}
    </div>
  );
};

export default DynamicFormStep;
