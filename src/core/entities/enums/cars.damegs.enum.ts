/**
 * Enums for car section and condition types with translation support
 */

export type SelectOption = {
  value: string;
  label: string;
};

/**
 * Represents sections of a car that can be damaged
 */
export enum CarSection {
  Hood = "Hood",
  Roof = "Roof",
  LeftFrontFender = "Left Front Fender",
  RightFrontFender = "Right Front Fender",
  LeftFrontDoor = "Left Front Door",
  RightFrontDoor = "Right Front Door",
  LeftRearDoor = "Left Rear Door",
  RightRearDoor = "Right Rear Door",
  Package = "Package",
  LeftRearFender = "Left Rear Fender",
  RightRearFender = "Right Rear Fender",
}

/**
 * Represents types of car conditions
 */


export enum CarConditionType {
  SCRATCH = 'Scratch',
  PAINT = 'paint',
  REPLACEMENT = 'replacement',
}
/**
 * General function to sort options alphabetically by label
 */
export function sortOptionsAlphabetically<T extends { label: string }>(options: T[]): T[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get car section options with translations
 */
export const getCarSectionOptions = (t: any): SelectOption[] => {
  const options = Object.values(CarSection).map((value) => ({
    value,
    label: t(`carSection.${value}`, { defaultValue: value }),
  }));
  return sortOptionsAlphabetically(options);
};

/**
 * Get grouped car section options for better UI organization with translations
 */
export const getGroupedCarSectionOptions = (t: any) => {
  const groupedOptions = [
    {
      label: t('damageZoneGroup.front', { defaultValue: 'Front' }),
      options: [
        { value: CarSection.Hood, label: t('carSection.Hood', { defaultValue: 'Hood' }) },
      ],
    },
    {
      label: t('damageZoneGroup.roof', { defaultValue: 'Roof' }),
      options: [
        { value: CarSection.Roof, label: t('carSection.Roof', { defaultValue: 'Roof' }) },
      ],
    },
    {
      label: t('damageZoneGroup.leftSide', { defaultValue: 'Left Side' }),
      options: [
        { value: CarSection.LeftFrontFender, label: t('carSection.Left Front Fender', { defaultValue: 'Left Front Fender' }) },
        { value: CarSection.LeftFrontDoor, label: t('carSection.Left Front Door', { defaultValue: 'Left Front Door' }) },
        { value: CarSection.LeftRearDoor, label: t('carSection.Left Rear Door', { defaultValue: 'Left Rear Door' }) },
        { value: CarSection.LeftRearFender, label: t('carSection.Left Rear Fender', { defaultValue: 'Left Rear Fender' }) },
      ],
    },
    {
      label: t('damageZoneGroup.rightSide', { defaultValue: 'Right Side' }),
      options: [
        { value: CarSection.RightFrontFender, label: t('carSection.Right Front Fender', { defaultValue: 'Right Front Fender' }) },
        { value: CarSection.RightFrontDoor, label: t('carSection.Right Front Door', { defaultValue: 'Right Front Door' }) },
        { value: CarSection.RightRearDoor, label: t('carSection.Right Rear Door', { defaultValue: 'Right Rear Door' }) },
        { value: CarSection.RightRearFender, label: t('carSection.Right Rear Fender', { defaultValue: 'Right Rear Fender' }) },
      ],
    },
    {
      label: t('damageZoneGroup.package', { defaultValue: 'Package' }),
      options: [
        { value: CarSection.Package, label: t('carSection.Package', { defaultValue: 'Package' }) },
      ],
    },
  ];
  // Sort options within each group
  return groupedOptions.map(group => ({
    ...group,
    options: sortOptionsAlphabetically(group.options),
  }));
};

/**
 * Get car condition options with translations
 */
export const getCarConditionOptions = (t: any): SelectOption[] => {
  const options = Object.values(CarConditionType).map((value) => ({
    value,
    label: t(`damageType.${value}`, { defaultValue: value }),
  }));
  return sortOptionsAlphabetically(options);
};