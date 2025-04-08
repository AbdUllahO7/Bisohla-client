// @/core/entities/enums/cars.damegs.enum.ts
/**
 * Enums for car section and condition types with translation support
 */

export enum CarSection {
    // Front section
    FRONT_BUMPER = 'frontBumper',
    HOOD = 'hood',
    FRONT_GRILL = 'frontGrill',
    LEFT_HEADLIGHT = 'leftHeadlight',
    RIGHT_HEADLIGHT = 'rightHeadlight',
  
    // Roof section
    ROOF = 'roof',
  
    // Rear section
    TRUNK = 'trunk',
    REAR_BUMPER = 'rearBumper',
    LEFT_TAILLIGHT = 'leftTaillight',
    RIGHT_TAILLIGHT = 'rightTaillight',
  
    // Left side
    LEFT_FRONT_FENDER = 'leftFrontFender',
    LEFT_FRONT_DOOR = 'leftFrontDoor',
    LEFT_REAR_DOOR = 'leftRearDoor',
    LEFT_REAR_FENDER = 'leftRearFender',
    LEFT_MIRROR = 'leftMirror',
    LEFT_FRONT_PILLAR = 'leftFrontPillar',
    LEFT_CENTER_PILLAR = 'leftCenterPillar',
    LEFT_REAR_PILLAR = 'leftRearPillar',
  
    // Right side
    RIGHT_FRONT_FENDER = 'rightFrontFender',
    RIGHT_FRONT_DOOR = 'rightFrontDoor',
    RIGHT_REAR_DOOR = 'rightRearDoor',
    RIGHT_REAR_FENDER = 'rightRearFender',
    RIGHT_MIRROR = 'rightMirror',
    RIGHT_FRONT_PILLAR = 'rightFrontPillar',
    RIGHT_CENTER_PILLAR = 'rightCenterPillar',
    RIGHT_REAR_PILLAR = 'rightRearPillar',
  
    // Glass
    FRONT_WINDSHIELD = 'frontWindshield',
    REAR_WINDSHIELD = 'rearWindshield',
    LEFT_FRONT_WINDOW = 'leftFrontWindow',
    LEFT_REAR_WINDOW = 'leftRearWindow',
    RIGHT_FRONT_WINDOW = 'rightFrontWindow',
    RIGHT_REAR_WINDOW = 'rightRearWindow',
  
    // Wheels/Rims
    LEFT_FRONT_WHEEL = 'leftFrontWheel',
    LEFT_REAR_WHEEL = 'leftRearWheel',
    RIGHT_FRONT_WHEEL = 'rightFrontWheel',
    RIGHT_REAR_WHEEL = 'rightRearWheel',
  }
  
  export enum CarConditionType {
    SCRATCH = 'scratch',
    DENT = 'dent',
    PAINT_FADED = 'paintFaded',
    PAINT_REPAIRED = 'paintRepaired',
    PANEL_REPLACED = 'panelReplaced',
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
          { value: CarSection.FRONT_BUMPER, label: t('carSection.frontBumper') },
          { value: CarSection.HOOD, label: t('carSection.hood') },
          { value: CarSection.FRONT_GRILL, label: t('carSection.frontGrill') },
          { value: CarSection.LEFT_HEADLIGHT, label: t('carSection.leftHeadlight') },
          { value: CarSection.RIGHT_HEADLIGHT, label: t('carSection.rightHeadlight') },
        ],
      },
      {
        label: t('damageZoneGroup.roof'),
        options: [{ value: CarSection.ROOF, label: t('carSection.roof') }],
      },
      {
        label: t('damageZoneGroup.rear'),
        options: [
          { value: CarSection.TRUNK, label: t('carSection.trunk') },
          { value: CarSection.REAR_BUMPER, label: t('carSection.rearBumper') },
          { value: CarSection.LEFT_TAILLIGHT, label: t('carSection.leftTaillight') },
          { value: CarSection.RIGHT_TAILLIGHT, label: t('carSection.rightTaillight') },
        ],
      },
      {
        label: t('damageZoneGroup.leftSide'),
        options: [
          { value: CarSection.LEFT_FRONT_FENDER, label: t('carSection.leftFrontFender') },
          { value: CarSection.LEFT_FRONT_DOOR, label: t('carSection.leftFrontDoor') },
          { value: CarSection.LEFT_REAR_DOOR, label: t('carSection.leftRearDoor') },
          { value: CarSection.LEFT_REAR_FENDER, label: t('carSection.leftRearFender') },
          { value: CarSection.LEFT_MIRROR, label: t('carSection.leftMirror') },
          { value: CarSection.LEFT_FRONT_PILLAR, label: t('carSection.leftFrontPillar') },
          { value: CarSection.LEFT_CENTER_PILLAR, label: t('carSection.leftCenterPillar') },
          { value: CarSection.LEFT_REAR_PILLAR, label: t('carSection.leftRearPillar') },
        ],
      },
      {
        label: t('damageZoneGroup.rightSide'),
        options: [
          { value: CarSection.RIGHT_FRONT_FENDER, label: t('carSection.rightFrontFender') },
          { value: CarSection.RIGHT_FRONT_DOOR, label: t('carSection.rightFrontDoor') },
          { value: CarSection.RIGHT_REAR_DOOR, label: t('carSection.rightRearDoor') },
          { value: CarSection.RIGHT_REAR_FENDER, label: t('carSection.rightRearFender') },
          { value: CarSection.RIGHT_MIRROR, label: t('carSection.rightMirror') },
          { value: CarSection.RIGHT_FRONT_PILLAR, label: t('carSection.rightFrontPillar') },
          { value: CarSection.RIGHT_CENTER_PILLAR, label: t('carSection.rightCenterPillar') },
          { value: CarSection.RIGHT_REAR_PILLAR, label: t('carSection.rightRearPillar') },
        ],
      },
      {
        label: t('damageZoneGroup.glass'),
        options: [
          { value: CarSection.FRONT_WINDSHIELD, label: t('carSection.frontWindshield') },
          { value: CarSection.REAR_WINDSHIELD, label: t('carSection.rearWindshield') },
          { value: CarSection.LEFT_FRONT_WINDOW, label: t('carSection.leftFrontWindow') },
          { value: CarSection.LEFT_REAR_WINDOW, label: t('carSection.leftRearWindow') },
          { value: CarSection.RIGHT_FRONT_WINDOW, label: t('carSection.rightFrontWindow') },
          { value: CarSection.RIGHT_REAR_WINDOW, label: t('carSection.rightRearWindow') },
        ],
      },
      {
        label: t('damageZoneGroup.wheels'),
        options: [
          { value: CarSection.LEFT_FRONT_WHEEL, label: t('carSection.leftFrontWheel') },
          { value: CarSection.LEFT_REAR_WHEEL, label: t('carSection.leftRearWheel') },
          { value: CarSection.RIGHT_FRONT_WHEEL, label: t('carSection.rightFrontWheel') },
          { value: CarSection.RIGHT_REAR_WHEEL, label: t('carSection.rightRearWheel') },
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