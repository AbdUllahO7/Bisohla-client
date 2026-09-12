import type { FormAttributeDto } from '@/core/entities/models/listing-types/listing-types.dto';

export const DAMAGE_ZONE_SLUG = 'damage_zone';
export const DAMAGE_TYPE_SLUG = 'damage_type';

export type DamageBlueprintKind = 'car' | 'motorcycle';

/**
 * Presentation-only overrides for one attribute of one listing type. The data
 * contract never changes: a preset editor emits exactly what the generic editor
 * would (`repeating_group` rows keyed by child slug), and a preset viewer reads
 * exactly what the generic viewer reads.
 */
export interface AttributePreset {
  kind: 'damage_matrix';
  /** `null` = zone × type table in the wizard and the plain summary boxes on the details page. */
  blueprint: DamageBlueprintKind | null;
  /** Schema-shape guard so an admin edit degrades to the generic renderer instead of crashing. */
  guard: (attr: FormAttributeDto) => boolean;
}

const isDamageGroup = (attr: FormAttributeDto): boolean => {
  if (attr.type !== 'repeating_group') return false;
  const children = attr.childAttributes ?? [];
  const zone = children.find((c) => c.slug === DAMAGE_ZONE_SLUG);
  const type = children.find((c) => c.slug === DAMAGE_TYPE_SLUG);
  return zone?.type === 'select' && type?.type === 'select' && (zone.options?.length ?? 0) > 0;
};

/**
 * listingType.slug → attribute.slug → preset. The ONLY place in the wizard and the
 * details page where a listing-type slug is allowed to appear.
 */
// DISABLED 2026-09-12 (owner decision): the SVG blueprints (`product/CarBlueprint.tsx`,
// `product/MotorcycleBlueprint.tsx`) hardcode zone ids + labels that drift from the admin's
// `damage_zone` options (e.g. motorcycle `rear_wheel` vs schema `Rear Wheel`, car `trunk` vs
// `Package`, 6 car parts with no option at all). Until the parts are bound to schema option ids
// and labelled from the schema, `blueprint: null` keeps the table / summary boxes instead.
// Restore by swapping the commented values back in.
export const LISTING_TYPE_PRESETS: Record<string, Record<string, AttributePreset>> = {
  cars: {
    damages: { kind: 'damage_matrix', blueprint: null /* 'car' */, guard: isDamageGroup },
  },
  motorcycles: {
    damages: { kind: 'damage_matrix', blueprint: null /* 'motorcycle' */, guard: isDamageGroup },
  },
};

export const resolvePreset = (listingTypeSlug: string | null | undefined, attr: FormAttributeDto): AttributePreset | null => {
  if (!listingTypeSlug) return null;
  const preset = LISTING_TYPE_PRESETS[listingTypeSlug]?.[attr.slug];
  return preset && preset.guard(attr) ? preset : null;
};
