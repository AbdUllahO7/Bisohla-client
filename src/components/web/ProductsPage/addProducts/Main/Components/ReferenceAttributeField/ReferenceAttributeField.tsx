'use client';

import React, { useCallback, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { getInjection } from '@/di/container';
import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';
import type { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import type { ReferenceSnapshot } from '@/lib/listing-attributes/types/attribute-form.types';
import SelectableList, { type Option } from '../../../StepOne/SelectableList';

const PAGE_SIZE = 30;

export interface ReferenceAttributeFieldProps {
  attribute: FormAttributeDto;
  value: number | null;
  snapshot: ReferenceSnapshot | null;
  /** Parent's selected ref item id; `null` when unset or only proposed. */
  parentReferenceItemId: number | null;
  parentAttributeName: string | null;
  parentHasProposal: boolean;
  required: boolean;
  disabled: boolean;
  pendingProposalName: string | null;
  onChange: (id: number | null, snapshot: ReferenceSnapshot | null) => void;
  onClearProposal: () => void;
  /** Absent when proposing is gated off for this attribute. */
  onProposeClick?: (currentSearch: string) => void;
  error?: string | null;
}

const itemName = (item: ListingTypeRefItemDto, locale: string): string => {
  const tr = item.translations as Record<string, { name?: string }> | undefined;
  return tr?.[locale]?.name || item.name || '';
};

const toOption = (item: ListingTypeRefItemDto, locale: string): Option => ({
  value: String(item.id),
  label: itemName(item, locale),
  logoUrl: item.logoUrl || item.iconUrl,
  metadata: item.metadata ?? null,
  keywords: [item.name, item.slug, ...Object.values((item.translations as Record<string, { name?: string }>) ?? {}).map((t) => t?.name ?? '')].filter(Boolean),
});

/**
 * Reference picker: server-side search, paginated, scoped to the parent item.
 * The selected item is captured as a snapshot (id + name + metadata) because the
 * metadata is what decides whether a `conditionallyRequiredWhen` child is shown.
 */
const ReferenceAttributeField: React.FC<ReferenceAttributeFieldProps> = ({
  attribute,
  value,
  snapshot,
  parentReferenceItemId,
  parentAttributeName,
  parentHasProposal,
  required,
  disabled,
  pendingProposalName,
  onChange,
  onClearProposal,
  onProposeClick,
  error,
}) => {
  const locale = useLocale();
  const isArabic = locale === 'ar';
  const tProp = useTranslations('referenceProposal');
  const tAttr = useTranslations('attributeForm');

  const hasParent = attribute.dependsOnAttributeId != null;
  // `null` parentItemId means "whole group", not "root" — never browse unscoped.
  const blocked = hasParent && (parentReferenceItemId == null || parentHasProposal);

  const fetchOptions = useCallback(
    async (params: { searchTerm?: string; page: number; pageSize?: number }) => {
      if (blocked || attribute.referenceGroupId == null) return { options: [], hasMore: false, total: 0 };
      const controller = getInjection('IListingTypeRefsRepoController');
      const res = await controller.getItemsByGroupId(
        attribute.referenceGroupId,
        parentReferenceItemId ?? undefined,
        params.pageSize || PAGE_SIZE,
        params.searchTerm?.trim() || undefined,
        params.page || 1,
      );
      const items = res.success && res.data?.data ? res.data.data : [];
      return {
        options: items.map((item) => toOption(item, locale)),
        hasMore: Boolean(res.data?.hasNextPage),
        total: res.data?.totalItems ?? items.length,
      };
    },
    [attribute.referenceGroupId, blocked, locale, parentReferenceItemId],
  );

  const selectedOption = useMemo<Option | null>(() => {
    if (value == null) return null;
    return { value: String(value), label: snapshot?.name || '', metadata: snapshot?.metadata ?? null };
  }, [snapshot, value]);

  const emptyDescription = useMemo(() => {
    if (!hasParent) return undefined;
    if (parentHasProposal) return tAttr('parent_pending_description', { parent: parentAttributeName ?? '' });
    if (parentReferenceItemId == null) return tAttr('parent_unset_description', { parent: parentAttributeName ?? '' });
    return undefined;
  }, [hasParent, parentAttributeName, parentHasProposal, parentReferenceItemId, tAttr]);

  return (
    <div className="space-y-2">
      <SelectableList
        title={attribute.name}
        type={attribute.slug}
        selectedValue={value != null ? String(value) : ''}
        selectedOption={selectedOption}
        direction={isArabic ? 'rtl' : 'ltr'}
        required={required}
        onSelect={(_, val, option) => {
          const id = Number(val);
          if (disabled || Number.isNaN(id)) return;
          if (value === id) return onChange(null, null);
          onChange(id, { id, name: String(option?.label ?? ''), metadata: option?.metadata ?? null });
        }}
        pendingProposalName={pendingProposalName}
        onClearProposal={onClearProposal}
        onProposeClick={onProposeClick}
        proposeCtaLabel={tProp('propose_cta', { attribute: attribute.name })}
        emptyDescription={emptyDescription}
        fetchOptions={fetchOptions}
        dependencyKey={`${attribute.referenceGroupId}_${parentReferenceItemId}_${parentHasProposal}`}
      />
      {error && <p className="text-xs text-red-500 font-medium text-center">{tAttr(error)}</p>}
    </div>
  );
};

export default ReferenceAttributeField;
