import type {
  FormAttributeDto,
  SectionDto,
} from '@/core/entities/models/listing-types/listing-types.dto';

/**
 * Form-side value of one attribute, keyed by attribute id in the wizard state.
 * `repeating_group` rows are keyed by CHILD SLUG (`[{ damage_zone, damage_type }]`),
 * which is what the backend stores in `valueJson` and what the detail view reads.
 */
export type AttributeFormValue =
  | string
  | number
  | boolean
  | string[]
  | { en: string | null; ar: string | null }
  | { min: number | null; max: number | null }
  | Record<string, unknown>[]
  | null;

export type AttributeValueMap = Record<number, AttributeFormValue>;

/** Captured when a reference item is picked — `metadata` drives `conditionallyRequiredWhen`. */
export interface ReferenceSnapshot {
  id: number;
  name: string;
  metadata: Record<string, unknown> | null;
}

export type ReferenceSnapshotMap = Record<number, ReferenceSnapshot | null>;

/** Seller-proposed reference name awaiting review ("I can't find my model"). */
export interface ReferenceProposal {
  name: string;
}

export type ReferenceProposalMap = Record<number, ReferenceProposal>;

export type ReferenceMetadataMap = Record<number, Record<string, unknown> | null>;

export interface AttributeWithDisplay extends FormAttributeDto {
  hidden: boolean;
  disabled: boolean;
  effectiveRequired: boolean;
}

export interface SectionWithDisplay extends Omit<SectionDto, 'attributes'> {
  attributes: AttributeWithDisplay[];
}

/** attribute id → i18n key under `attributeForm.errors.*` */
export type AttributeErrorMap = Record<number, string>;
