// src/enums/car.ts

/**
 * Represents vehicle transmission types
 */
export enum Transmission {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  SEMI_AUTOMATIC = 'semi_automatic',
  CVT = 'cvt',
}

/**
 * Represents vehicle fuel types
 */
export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  PLUG_IN_HYBRID = 'plug_in_hybrid',
  LPG = 'lpg',
  NATURAL_GAS = 'natural_gas',
}

/**
 * Represents vehicle body types
 */
export enum BodyType {
  SUV = 'suv',
  SEDAN = 'sedan',
  HATCHBACK = 'hatchback',
  COUPE = 'coupe',
  CONVERTIBLE = 'convertible',
  WAGON = 'wagon',
  VAN = 'van',
  MINIVAN = 'minivan',
  PICKUP = 'pickup',
  OTHER = 'other',
}

/**
 * Represents the current status of a car listing
 */
export enum CarStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
  SOLD = 'sold',
}

/**
 * Represents categories for car features
 */
export enum FeatureCategory {
  SAFETY = 'safety',
  COMFORT = 'comfort',
  TECHNOLOGY = 'technology',
  PERFORMANCE = 'performance',
  EXTERIOR = 'exterior',
  INTERIOR = 'interior',
  ENTERTAINMENT = 'entertainment',
  OTHER = 'other',
}

/**
 * Represents the save status of a car listing
 */
export enum SaveStatus {
  SOLD = 'sold',
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

/**
 * Represents types of vehicle damage
 */
export enum DamageType {
  SCRATCH = 'scratch',
  DENT = 'dent',
  PAINT_FADED = 'paint_faded',
  PAINT_REPAIRED = 'paint_repaired',
  PANEL_REPLACED = 'panel_replaced',
}

/**
 * Represents listing types
 */
export enum ListingType {
  FOR_SALE = 'for_sale',
  FOR_RENT = 'for_rent',
}

// rent types
export enum RentType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

/**
 * Represents zones/areas of a vehicle that can be damaged
 */
export enum DamageZone {
  // Front section
  FRONT_BUMPER = 'front_bumper',
  HOOD = 'hood',
  FRONT_GRILL = 'front_grill',
  LEFT_HEADLIGHT = 'left_headlight',
  RIGHT_HEADLIGHT = 'right_headlight',

  // Roof section
  ROOF = 'roof',

  // Rear section
  TRUNK = 'trunk',
  REAR_BUMPER = 'rear_bumper',
  LEFT_TAILLIGHT = 'left_taillight',
  RIGHT_TAILLIGHT = 'right_taillight',

  // Left side
  LEFT_FRONT_FENDER = 'left_front_fender',
  LEFT_FRONT_DOOR = 'left_front_door',
  LEFT_REAR_DOOR = 'left_rear_door',
  LEFT_REAR_FENDER = 'left_rear_fender',
  LEFT_MIRROR = 'left_mirror',
  LEFT_FRONT_PILLAR = 'left_front_pillar',
  LEFT_CENTER_PILLAR = 'left_center_pillar',
  LEFT_REAR_PILLAR = 'left_rear_pillar',

  // Right side
  RIGHT_FRONT_FENDER = 'right_front_fender',
  RIGHT_FRONT_DOOR = 'right_front_door',
  RIGHT_REAR_DOOR = 'right_rear_door',
  RIGHT_REAR_FENDER = 'right_rear_fender',
  RIGHT_MIRROR = 'right_mirror',
  RIGHT_FRONT_PILLAR = 'right_front_pillar',
  RIGHT_CENTER_PILLAR = 'right_center_pillar',
  RIGHT_REAR_PILLAR = 'right_rear_pillar',

  // Glass
  FRONT_WINDSHIELD = 'front_windshield',
  REAR_WINDSHIELD = 'rear_windshield',
  LEFT_FRONT_WINDOW = 'left_front_window',
  LEFT_REAR_WINDOW = 'left_rear_window',
  RIGHT_FRONT_WINDOW = 'right_front_window',
  RIGHT_REAR_WINDOW = 'right_rear_window',

  // Wheels/Rims
  LEFT_FRONT_WHEEL = 'left_front_wheel',
  LEFT_REAR_WHEEL = 'left_rear_wheel',
  RIGHT_FRONT_WHEEL = 'right_front_wheel',
  RIGHT_REAR_WHEEL = 'right_rear_wheel',
}

// Helper functions for the new enums

/**
 * Get save status options for select components
 */
export const getSaveStatusOptions = () => {
  return Object.values(SaveStatus).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get save status options for select components
 */
export const getRentTypeOptions = () => {
  return Object.values(RentType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get damage type options for select components
 */
export const getDamageTypeOptions = () => {
  return Object.values(DamageType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get listing type options for select components
 */
export const getListingTypeOptions = () => {
  return Object.values(ListingType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get damage zone options for select components
 */
export const getDamageZoneOptions = () => {
  return Object.values(DamageZone).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get grouped damage zone options for better UI organization
 */
export const getGroupedDamageZoneOptions = () => {
  return [
    {
      label: 'Front',
      options: [
        { value: DamageZone.FRONT_BUMPER, label: 'Front Bumper' },
        { value: DamageZone.HOOD, label: 'Hood' },
        { value: DamageZone.FRONT_GRILL, label: 'Front Grill' },
        { value: DamageZone.LEFT_HEADLIGHT, label: 'Left Headlight' },
        { value: DamageZone.RIGHT_HEADLIGHT, label: 'Right Headlight' },
      ],
    },
    {
      label: 'Roof',
      options: [{ value: DamageZone.ROOF, label: 'Roof' }],
    },
    {
      label: 'Rear',
      options: [
        { value: DamageZone.TRUNK, label: 'Trunk' },
        { value: DamageZone.REAR_BUMPER, label: 'Rear Bumper' },
        { value: DamageZone.LEFT_TAILLIGHT, label: 'Left Taillight' },
        { value: DamageZone.RIGHT_TAILLIGHT, label: 'Right Taillight' },
      ],
    },
    {
      label: 'Left Side',
      options: [
        { value: DamageZone.LEFT_FRONT_FENDER, label: 'Left Front Fender' },
        { value: DamageZone.LEFT_FRONT_DOOR, label: 'Left Front Door' },
        { value: DamageZone.LEFT_REAR_DOOR, label: 'Left Rear Door' },
        { value: DamageZone.LEFT_REAR_FENDER, label: 'Left Rear Fender' },
        { value: DamageZone.LEFT_MIRROR, label: 'Left Mirror' },
        { value: DamageZone.LEFT_FRONT_PILLAR, label: 'Left Front Pillar' },
        { value: DamageZone.LEFT_CENTER_PILLAR, label: 'Left Center Pillar' },
        { value: DamageZone.LEFT_REAR_PILLAR, label: 'Left Rear Pillar' },
      ],
    },
    {
      label: 'Right Side',
      options: [
        { value: DamageZone.RIGHT_FRONT_FENDER, label: 'Right Front Fender' },
        { value: DamageZone.RIGHT_FRONT_DOOR, label: 'Right Front Door' },
        { value: DamageZone.RIGHT_REAR_DOOR, label: 'Right Rear Door' },
        { value: DamageZone.RIGHT_REAR_FENDER, label: 'Right Rear Fender' },
        { value: DamageZone.RIGHT_MIRROR, label: 'Right Mirror' },
        { value: DamageZone.RIGHT_FRONT_PILLAR, label: 'Right Front Pillar' },
        { value: DamageZone.RIGHT_CENTER_PILLAR, label: 'Right Center Pillar' },
        { value: DamageZone.RIGHT_REAR_PILLAR, label: 'Right Rear Pillar' },
      ],
    },
    {
      label: 'Glass',
      options: [
        { value: DamageZone.FRONT_WINDSHIELD, label: 'Front Windshield' },
        { value: DamageZone.REAR_WINDSHIELD, label: 'Rear Windshield' },
        { value: DamageZone.LEFT_FRONT_WINDOW, label: 'Left Front Window' },
        { value: DamageZone.LEFT_REAR_WINDOW, label: 'Left Rear Window' },
        { value: DamageZone.RIGHT_FRONT_WINDOW, label: 'Right Front Window' },
        { value: DamageZone.RIGHT_REAR_WINDOW, label: 'Right Rear Window' },
      ],
    },
    {
      label: 'Wheels',
      options: [
        { value: DamageZone.LEFT_FRONT_WHEEL, label: 'Left Front Wheel' },
        { value: DamageZone.LEFT_REAR_WHEEL, label: 'Left Rear Wheel' },
        { value: DamageZone.RIGHT_FRONT_WHEEL, label: 'Right Front Wheel' },
        { value: DamageZone.RIGHT_REAR_WHEEL, label: 'Right Rear Wheel' },
      ],
    },
  ];
};

/**
 * Get transmission options for select components
 */
export const getTransmissionOptions = () => {
  return Object.values(Transmission).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get fuel type options for select components
 */
export const getFuelTypeOptions = () => {
  return Object.values(FuelType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get body type options for select components
 */
export const getBodyTypeOptions = () => {
  return Object.values(BodyType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get car status options for select components
 */
export const getCarStatusOptions = () => {
  return Object.values(CarStatus).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};

/**
 * Get feature category options for select components
 */
export const getFeatureCategoryOptions = () => {
  return Object.values(FeatureCategory).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
};
