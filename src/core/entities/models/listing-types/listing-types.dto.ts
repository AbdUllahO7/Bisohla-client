export interface ListingInstallmentOption {
  id: number;
  months: number;
  displayOrder: number;
}

export interface ListingTypeDto {
  id: number;
  slug: string;
  name: string;
  description: string;
  iconUrl: string | null;
  imageUrl: string | null;
  isActive: boolean;
  order: number;
  rentEnabled?: boolean;
  installmentsEnabled?: boolean;
  installmentsMode?: 'free' | 'catalog';
  installmentOptions?: ListingInstallmentOption[];
  createdByAdminId: number | null;
  updatedByAdminId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface SchemaAttributeDto {
  id: number;
  type: string;
  required?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  isTranslatable?: boolean;
  isLeafOnly?: boolean;
  referenceGroupId?: number;
  dependsOn?: string;
  options?: string[];
  validation?: any;
  minItems?: number;
  childAttributes?: Record<string, SchemaAttributeDto>;
  conditionallyRequiredWhen?: any;
}

export interface SchemaDependencyDto {
  type: string;
  dependsOn: string;
}

export interface ListingTypeSchemaDto {
  version: number;
  required: string[];
  attributes: Record<string, SchemaAttributeDto>;
  attributeIds: number[];
  dependencies: Record<string, SchemaDependencyDto>;
}

export interface TranslationDto {
  id: number;
  locale: string;
  name: string;
  description?: string | null;
  hint?: string | null;
  [key: string]: any;
}

/** Backend `listing-type-attribute.zod.dto.ts:19-27` — the stored value is always the option `id`. */
export interface FormAttributeOptionDto {
  id: string;
  label: { en: string; ar: string };
  color?: string | null;
}

export interface FormAttributeValidationRules {
  min?: number;
  max?: number;
  regex?: string;
  minLength?: number;
  maxLength?: number;
}

/** Child is required iff the parent's selected ref item has `metadata[key] === true` (any key when array). */
export interface ConditionallyRequiredWhen {
  refAttributeSlug: string;
  metadataKey: string | string[];
}

/** When the rule evaluates TRUE against `refAttributeSlug`'s value the attribute is hidden. */
export interface ValueDependencyShape {
  refAttributeSlug: string;
  op: 'eq' | 'neq' | 'in' | 'nin';
  value: string | string[];
}

export interface FormAttributeDto {
  id: number;
  listingTypeId: number;
  versionId: number;
  sectionId: number | null;
  slug: string;
  name: string;
  hint: string | null;
  type: string;
  isRequired: boolean;
  isFilterable: boolean;
  isSearchable: boolean;
  isActive: boolean;
  isTranslatable: boolean;
  order: number;
  referenceGroupId: number | null;
  dependsOnAttributeId: number | null;
  groupAttributeId: number | null;
  options: FormAttributeOptionDto[] | null;
  validationRules: FormAttributeValidationRules | null;
  conditionallyRequiredWhen: ConditionallyRequiredWhen | null;
  valueDependency?: ValueDependencyShape | null;
  iconUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  translations: TranslationDto[];
  section?: any;
  referenceGroup?: any;
  dependsOn?: any;
  childAttributes?: FormAttributeDto[];
}

export interface SectionDto {
  id: number;
  listingTypeId: number;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  translations: TranslationDto[];
  attributes: FormAttributeDto[];
}

export interface ListingTypeFormSchemaDto {
  listingTypeId: number;
  sections: SectionDto[];
  compiledSchema: ListingTypeSchemaDto;
}

export type ListingTypeFilterSchemaDto = ListingTypeFormSchemaDto;
export type ListingTypeAlertFormSchemaDto = ListingTypeFormSchemaDto;
