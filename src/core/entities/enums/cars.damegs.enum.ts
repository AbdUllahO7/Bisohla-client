// @/core/entities/enums/cars.damegs.enum.ts
/**
 * Enums for car section and condition types with translation support
 */

// Fixed: RightFrontFender had incorrect value
export enum CarSection {
  Hood = "Hood", 
  Roof = "Roof", 
  LeftFrontFender = "Left Front Fender",
  RightFrontFender = "Right Front Fender", // Fixed value
  LeftFrontDoor = "Left Front Door",
  RightFrontDoor = "Right Front Door",
  LeftRearDoor = "Left Rear Door",
  RightRearDoor = "Right Rear Door",
  Package = "Package",
  LeftRearFender = "Left Rear Fender",
  RightRearFender = "Right Rear Fender",
}
  
export enum CarConditionType {
  SCRATCH = 'Scratch',
  PAINT = 'paint',
  REPLACEMENT = 'replacement',
}

/**
 * Get car section options with translations
 */
export const getCarSectionOptions = (t: any) => {
  return Object.values(CarSection).map((value) => ({
    value,
    label: t(`carSection.${value}`),
  }));
};
  
/**
 * Get grouped car section options for better UI organization with translations
 */
export const getGroupedCarSectionOptions = (t: any) => {
  return [
    {
      label: t('damageZoneGroup.front'),
      options: [
        { value: CarSection.Hood, label: t('carSection.Hood') },
      ],
    },
    {
      label: t('damageZoneGroup.roof'),
      options: [
        { value: CarSection.Roof, label: t('carSection.Roof') },
      ],
    },
    {
      label: t('damageZoneGroup.leftSide'),
      options: [
        { value: CarSection.LeftFrontFender, label: t('carSection.Left Front Fender') },
        { value: CarSection.LeftFrontDoor, label: t('carSection.Left Front Door') },
        { value: CarSection.LeftRearDoor, label: t('carSection.Left Rear Door') },
        { value: CarSection.LeftRearFender, label: t('carSection.Left Rear Fender') },
      ],
    },
    {
      label: t('damageZoneGroup.rightSide'),
      options: [
        { value: CarSection.RightFrontFender, label: t('carSection.Right Front Fender') },
        { value: CarSection.RightFrontDoor, label: t('carSection.Right Front Door') },
        { value: CarSection.RightRearDoor, label: t('carSection.Right Rear Door') },
        { value: CarSection.RightRearFender, label: t('carSection.Right Rear Fender') },
      ],
    },
    {
      label: t('damageZoneGroup.package'),
      options: [
        { value: CarSection.Package, label: t('carSection.Package') },
      ],
    },
  ];
};
  
/**
 * Get car condition options with translations
 */
export const getCarConditionOptions = (t: any) => {
  return Object.values(CarConditionType).map((value) => ({
    value,
    label: t(`damageType.${value}`),
  }));
};