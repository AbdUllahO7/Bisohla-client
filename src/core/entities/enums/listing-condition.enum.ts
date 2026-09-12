/** Free-text column on the backend; admin, mobile and web ship the same fixed set. */
export const LISTING_CONDITIONS = ['new', 'used', 'certified_pre_owned'] as const;

export type ListingCondition = (typeof LISTING_CONDITIONS)[number];

export const getListingConditionOptions = (t: (key: string) => string) =>
  LISTING_CONDITIONS.map((value) => ({ value, label: t(`condition_options.${value}`) }));
