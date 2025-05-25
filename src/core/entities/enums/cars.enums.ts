/**
 * Represents vehicle transmission types
 */
export interface CarouselItem {
  title: string;
  carCount: string;
  image: string;
  value?: string;
}

export interface CarouselComponentProps {
  data: CarouselItem[];
  direction: 'ltr' | 'rtl';
}

export enum Transmission {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  SEMI_AUTOMATIC = 'semi_automatic',
  CVT = 'cvt',
}

/**
 * Represents vehicle fuel types
 */
export interface Feature {
  id: string;
  label: string;
}

export interface FeatureCategoryType {
  value: string;
  label: string;
}

export interface FeaturesData {
  [category: string]: Feature[];
}

export interface ColorOption {
  value: string;
  label: string;
  hex: string;
}

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
 * Comprehensive color enum with 50 colors
 */
export enum Colors {
  // Basic colors
  RED = "red",
  GREEN = "green",
  BLUE = "blue",
  YELLOW = "yellow",
  ORANGE = "orange",
  PURPLE = "purple",
  PINK = "pink",
  BROWN = "brown",
  BLACK = "black",
  WHITE = "white",
  GRAY = "gray",

  // Light variants
  LIGHT_RED = "light_red",
  LIGHT_GREEN = "light_green",
  LIGHT_BLUE = "light_blue",
  LIGHT_YELLOW = "light_yellow",
  LIGHT_ORANGE = "light_orange",
  LIGHT_PURPLE = "light_purple",
  LIGHT_PINK = "light_pink",
  LIGHT_BROWN = "light_brown",
  LIGHT_GRAY = "light_gray",

  // Dark variants
  DARK_RED = "dark_red",
  DARK_GREEN = "dark_green",
  DARK_BLUE = "dark_blue",
  DARK_YELLOW = "dark_yellow",
  DARK_ORANGE = "dark_orange",
  DARK_PURPLE = "dark_purple",
  DARK_PINK = "dark_pink",
  DARK_BROWN = "dark_brown",
  DARK_GRAY = "dark_gray",

  // Specific shades
  TURQUOISE = "turquoise",
  TEAL = "teal",
  NAVY = "navy",
  INDIGO = "indigo",
  VIOLET = "violet",
  MAGENTA = "magenta",
  CRIMSON = "crimson",
  MAROON = "maroon",
  OLIVE = "olive",
  LIME = "lime",
  AQUA = "aqua",
  CYAN = "cyan",
  SILVER = "silver",
  GOLD = "gold",
  BEIGE = "beige",
  CORAL = "coral",
  IVORY = "ivory",
  LAVENDER = "lavender",
  MINT = "mint",
  PEACH = "peach",
  PLUM = "plum",
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
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

/**
 * Represents types of vehicle damage
 */
export enum DamageType {
  SCRATCH = 'scratch',
  DENT = 'dent',
  PAINT_FADED = 'paint',
  PAINT_REPAIRED = 'paint_repaired',
  PANEL_REPLACED = 'replacement',
}

/**
 * Represents listing types
 */
export enum ListingType {
  FOR_SALE = 'for_sale',
  FOR_RENT = 'for_rent',
}

/**
 * Represents rent types
 */
export enum RentType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export type SelectOption = {
  value: string;
  label: string;
};

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

/**
 * General function to sort options alphabetically by label
 */
export function sortOptionsAlphabetically<T extends { label: string }>(options: T[]): T[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get save status options for select components
 */
export function getSaveStatusOptions(t: any): SelectOption[] {
  const options = [
    {
      value: SaveStatus.DRAFT,
      label: t("stepFour.saveStatusOptions.draft", { defaultValue: "Draft" }),
    },
    {
      value: SaveStatus.PUBLISHED,
      label: t("stepFour.saveStatusOptions.published", { defaultValue: "Published" }),
    },
  ];
  return sortOptionsAlphabetically(options);
}

/**
 * Get listing type options with translation
 */
export function getListingTypeOptions(t: any): SelectOption[] {
  const options = [
    {
      value: ListingType.FOR_SALE,
      label: t("stepFour.dateValue.forSale", { defaultValue: "For Sale" }),
    },
    {
      value: ListingType.FOR_RENT,
      label: t("stepFour.dateValue.forRent", { defaultValue: "For Rent" }),
    },
  ];
  return sortOptionsAlphabetically(options);
}

/**
 * Get rent type options with translation
 */
export function getRentTypeOptions(t: any): SelectOption[] {
  const options = [
    {
      value: RentType.DAILY,
      label: t("stepFour.dateValue.RentType.daily", { defaultValue: "Daily" }),
    },
    {
      value: RentType.WEEKLY,
      label: t("stepFour.dateValue.RentType.weekly", { defaultValue: "Weekly" }),
    },
    {
      value: RentType.MONTHLY,
      label: t("stepFour.dateValue.RentType.monthly", { defaultValue: "Monthly" }),
    },
    {
      value: RentType.YEARLY,
      label: t("stepFour.dateValue.RentType.yearly", { defaultValue: "Yearly" }),
    },
  ];
  return sortOptionsAlphabetically(options);
}

/**
 * Get damage type options for select components
 */
export const getDamageTypeOptions = (): SelectOption[] => {
  const options = Object.values(DamageType).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
  return sortOptionsAlphabetically(options);
};

/**
 * Get damage zone options for select components
 */
export const getDamageZoneOptions = (): SelectOption[] => {
  const options = Object.values(DamageZone).map((value) => ({
    value,
    label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' '),
  }));
  return sortOptionsAlphabetically(options);
};

/**
 * Get grouped damage zone options for better UI organization
 */
export const getGroupedDamageZoneOptions = () => {
  const groupedOptions = [
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
  // Sort options within each group
  return groupedOptions.map(group => ({
    ...group,
    options: sortOptionsAlphabetically(group.options),
  }));
};

/**
 * Get feature category options for select components with translation support
 */
export const getFeatureCategoryOptions = (t: any): SelectOption[] => {
  const options = [
    { value: FeatureCategory.SAFETY, label: t('featureCategory.safety', { defaultValue: 'Safety' }) },
    { value: FeatureCategory.COMFORT, label: t('featureCategory.comfort', { defaultValue: 'Comfort' }) },
    { value: FeatureCategory.TECHNOLOGY, label: t('featureCategory.technology', { defaultValue: 'Technology' }) },
    { value: FeatureCategory.PERFORMANCE, label: t('featureCategory.performance', { defaultValue: 'Performance' }) },
    { value: FeatureCategory.EXTERIOR, label: t('featureCategory.exterior', { defaultValue: 'Exterior' }) },
    { value: FeatureCategory.INTERIOR, label: t('featureCategory.interior', { defaultValue: 'Interior' }) },
    { value: FeatureCategory.ENTERTAINMENT, label: t('featureCategory.entertainment', { defaultValue: 'Entertainment' }) },
    { value: FeatureCategory.OTHER, label: t('featureCategory.other', { defaultValue: 'Other' }) },
  ];
  return sortOptionsAlphabetically(options);
};

/**
 * Get features by category with translation support
 */
export const getFeaturesByCategory = (t: any): FeaturesData => {
  const features = {
    [FeatureCategory.SAFETY]: [
      { id: 'airbags', label: t('features.safety.airbags', { defaultValue: 'Airbags' }) },
      { id: 'abs', label: t('features.safety.abs', { defaultValue: 'ABS' }) },
      { id: 'parkingSensors', label: t('features.safety.parkingSensors', { defaultValue: 'Parking Sensors' }) },
      { id: 'blindSpotMonitoring', label: t('features.safety.blindSpotMonitoring', { defaultValue: 'Blind Spot Monitoring' }) },
      { id: 'crashSensors', label: t('features.safety.crashSensors', { defaultValue: 'Crash Sensors' }) },
      { id: 'laneAssist', label: t('features.safety.laneAssist', { defaultValue: 'Lane Assist' }) },
    ],
    [FeatureCategory.COMFORT]: [
      { id: 'airConditioning', label: t('features.comfort.airConditioning', { defaultValue: 'Air Conditioning' }) },
      { id: 'heatedSeats', label: t('features.comfort.heatedSeats', { defaultValue: 'Heated Seats' }) },
      { id: 'powerSeats', label: t('features.comfort.powerSeats', { defaultValue: 'Power Seats' }) },
      { id: 'leatherSeats', label: t('features.comfort.leatherSeats', { defaultValue: 'Leather Seats' }) },
      { id: 'sunroof', label: t('features.comfort.sunroof', { defaultValue: 'Sunroof' }) },
      { id: 'keylessEntry', label: t('features.comfort.keylessEntry', { defaultValue: 'Keyless Entry' }) },
    ],
    [FeatureCategory.TECHNOLOGY]: [
      { id: 'bluetooth', label: t('features.technology.bluetooth', { defaultValue: 'Bluetooth' }) },
      { id: 'navigationSystem', label: t('features.technology.navigationSystem', { defaultValue: 'Navigation System' }) },
      { id: 'smartphoneIntegration', label: t('features.technology.smartphoneIntegration', { defaultValue: 'Smartphone Integration' }) },
      { id: 'wirelessCharging', label: t('features.technology.wirelessCharging', { defaultValue: 'Wireless Charging' }) },
      { id: 'digitalDashboard', label: t('features.technology.digitalDashboard', { defaultValue: 'Digital Dashboard' }) },
      { id: 'voiceControl', label: t('features.technology.voiceControl', { defaultValue: 'Voice Control' }) },
    ],
    [FeatureCategory.PERFORMANCE]: [
      { id: 'turboEngine', label: t('features.performance.turboEngine', { defaultValue: 'Turbo Engine' }) },
      { id: 'sportSuspension', label: t('features.performance.sportSuspension', { defaultValue: 'Sport Suspension' }) },
      { id: 'allWheelDrive', label: t('features.performance.allWheelDrive', { defaultValue: 'All Wheel Drive' }) },
      { id: 'sportMode', label: t('features.performance.sportMode', { defaultValue: 'Sport Mode' }) },
      { id: 'hillAssist', label: t('features.performance.hillAssist', { defaultValue: 'Hill Assist' }) },
      { id: 'ecoMode', label: t('features.performance.ecoMode', { defaultValue: 'Eco Mode' }) },
    ],
    [FeatureCategory.EXTERIOR]: [
      { id: 'alloyWheels', label: t('features.exterior.alloyWheels', { defaultValue: 'Alloy Wheels' }) },
      { id: 'ledHeadlights', label: t('features.exterior.ledHeadlights', { defaultValue: 'LED Headlights' }) },
      { id: 'fogLights', label: t('features.exterior.fogLights', { defaultValue: 'Fog Lights' }) },
      { id: 'roofRails', label: t('features.exterior.roofRails', { defaultValue: 'Roof Rails' }) },
      { id: 'panoramicRoof', label: t('features.exterior.panoramicRoof', { defaultValue: 'Panoramic Roof' }) },
      { id: 'tintedWindows', label: t('features.exterior.tintedWindows', { defaultValue: 'Tinted Windows' }) },
    ],
    [FeatureCategory.INTERIOR]: [
      { id: 'woodTrim', label: t('features.interior.woodTrim', { defaultValue: 'Wood Trim' }) },
      { id: 'ambientLighting', label: t('features.interior.ambientLighting', { defaultValue: 'Ambient Lighting' }) },
      { id: 'rearSeatsControl', label: t('features.interior.rearSeatsControl', { defaultValue: 'Rear Seats Control' }) },
      { id: 'foldableSeats', label: t('features.interior.foldableSeats', { defaultValue: 'Foldable Seats' }) },
      { id: 'cupHolders', label: t('features.interior.cupHolders', { defaultValue: 'Cup Holders' }) },
      { id: 'luggageCompartment', label: t('features.interior.luggageCompartment', { defaultValue: 'Luggage Compartment' }) },
    ],
    [FeatureCategory.ENTERTAINMENT]: [
      { id: 'premiumAudio', label: t('features.entertainment.premiumAudio', { defaultValue: 'Premium Audio' }) },
      { id: 'rearScreens', label: t('features.entertainment.rearScreens', { defaultValue: 'Rear Screens' }) },
      { id: 'hdRadio', label: t('features.entertainment.hdRadio', { defaultValue: 'HD Radio' }) },
      { id: 'usbPorts', label: t('features.entertainment.usbPorts', { defaultValue: 'USB Ports' }) },
      { id: 'wifiHotspot', label: t('features.entertainment.wifiHotspot', { defaultValue: 'WiFi Hotspot' }) },
      { id: 'subwoofer', label: t('features.entertainment.subwoofer', { defaultValue: 'Subwoofer' }) },
    ],
    [FeatureCategory.OTHER]: [
      { id: 'cargoBox', label: t('features.other.cargoBox', { defaultValue: 'Cargo Box' }) },
      { id: 'trailerHitch', label: t('features.other.trailerHitch', { defaultValue: 'Trailer Hitch' }) },
      { id: 'bikeRack', label: t('features.other.bikeRack', { defaultValue: 'Bike Rack' }) },
      { id: 'childSeat', label: t('features.other.childSeat', { defaultValue: 'Child Seat' }) },
      { id: 'winterTires', label: t('features.other.winterTires', { defaultValue: 'Winter Tires' }) },
      { id: 'alarmSystem', label: t('features.other.alarmSystem', { defaultValue: 'Alarm System' }) },
    ],
  };
  // Sort features within each category
  return Object.fromEntries(
    Object.entries(features).map(([category, featureList]) => [
      category,
      sortOptionsAlphabetically(featureList),
    ])
  );
};

/**
 * Get transmission options for select components with translation support
 */
export const getTransmissionOptions = (t?: any): SelectOption[] => {
  const options = Object.values(Transmission).map((value) => {
    let label = value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
    if (t) {
      try {
        label = t(`transmission.${value}`);
      } catch (error) {
        // Fallback to formatted value
      }
    }
    return { value, label };
  });
  return sortOptionsAlphabetically(options);
};

/**
 * Get fuel type options for select components with translation support
 */
export const getFuelTypeOptions = (t?: any): SelectOption[] => {
  const options = Object.values(FuelType).map((value) => {
    let label = value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
    if (t) {
      try {
        label = t(`fuelType.${value}`);
      } catch (error) {
        try {
          const oldGazMapping: Record<FuelType, string | undefined> = {
            [FuelType.GASOLINE]: 'petrol',
            [FuelType.DIESEL]: 'diesel',
            [FuelType.ELECTRIC]: 'electric',
            [FuelType.HYBRID]: 'hybrid',
            [FuelType.PLUG_IN_HYBRID]: 'plug_in_hybrid',
            [FuelType.LPG]: 'lpg',
            [FuelType.NATURAL_GAS]: 'natural_gas',
          };
          const mappedValue = oldGazMapping[value];
          if (mappedValue) {
            label = t(`gaz.options.${mappedValue}`);
          }
        } catch (err) {
          // Fallback to formatted value
        }
      }
    }
    return { value, label };
  });
  return sortOptionsAlphabetically(options);
};

/**
 * Get body type options for select components with translation support
 */
export const getBodyTypeOptions = (t?: any): SelectOption[] => {
  const options = Object.values(BodyType).map((value) => {
    let label = value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
    if (t) {
      try {
        label = t(`bodyType.${value}`);
      } catch (error) {
        // Fallback to formatted value
      }
    }
    return { value, label };
  });
  return sortOptionsAlphabetically(options);
};

/**
 * Get car status options for select components with translation support
 */
export const getCarStatusOptions = (t?: any): SelectOption[] => {
  const options = Object.values(CarStatus).map((value) => {
    let label = value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
    if (t) {
      try {
        label = t(`carStatus.${value}`);
      } catch (error) {
        // Fallback to formatted value
      }
    }
    return { value, label };
  });
  return sortOptionsAlphabetically(options);
};

/**
 * Get color options with translations
 */
export const getColorOptions = (t?: any): ColorOption[] => {
  const options: ColorOption[] = [
    // Basic colors
    { value: Colors.RED, label: t ? t('color.options.red', { defaultValue: 'Red' }) : 'Red', hex: '#FF0000' },
    { value: Colors.GREEN, label: t ? t('color.options.green', { defaultValue: 'Green' }) : 'Green', hex: '#008000' },
    { value: Colors.BLUE, label: t ? t('color.options.blue', { defaultValue: 'Blue' }) : 'Blue', hex: '#0000FF' },
    { value: Colors.YELLOW, label: t ? t('color.options.yellow', { defaultValue: 'Yellow' }) : 'Yellow', hex: '#FFFF00' },
    { value: Colors.ORANGE, label: t ? t('color.options.orange', { defaultValue: 'Orange' }) : 'Orange', hex: '#FFA500' },
    { value: Colors.PURPLE, label: t ? t('color.options.purple', { defaultValue: 'Purple' }) : 'Purple', hex: '#800080' },
    { value: Colors.PINK, label: t ? t('color.options.pink', { defaultValue: 'Pink' }) : 'Pink', hex: '#FFC0CB' },
    { value: Colors.BROWN, label: t ? t('color.options.brown', { defaultValue: 'Brown' }) : 'Brown', hex: '#A52A2A' },
    { value: Colors.BLACK, label: t ? t('color.options.black', { defaultValue: 'Black' }) : 'Black', hex: '#000000' },
    { value: Colors.WHITE, label: t ? t('color.options.white', { defaultValue: 'White' }) : 'White', hex: '#FFFFFF' },
    { value: Colors.GRAY, label: t ? t('color.options.gray', { defaultValue: 'Gray' }) : 'Gray', hex: '#808080' },

    // Light variants
    { value: Colors.LIGHT_RED, label: t ? t('color.options.light_red', { defaultValue: 'Light Red' }) : 'Light Red', hex: '#FF6666' },
    { value: Colors.LIGHT_GREEN, label: t ? t('color.options.light_green', { defaultValue: 'Light Green' }) : 'Light Green', hex: '#90EE90' },
    { value: Colors.LIGHT_BLUE, label: t ? t('color.options.light_blue', { defaultValue: 'Light Blue' }) : 'Light Blue', hex: '#ADD8E6' },
    { value: Colors.LIGHT_YELLOW, label: t ? t('color.options.light_yellow', { defaultValue: 'Light Yellow' }) : 'Light Yellow', hex: '#FFFFE0' },
    { value: Colors.LIGHT_ORANGE, label: t ? t('color.options.light_orange', { defaultValue: 'Light Orange' }) : 'Light Orange', hex: '#FFDAB9' },
    { value: Colors.LIGHT_PURPLE, label: t ? t('color.options.light_purple', { defaultValue: 'Light Purple' }) : 'Light Purple', hex: '#D8BFD8' },
    { value: Colors.LIGHT_PINK, label: t ? t('color.options.light_pink', { defaultValue: 'Light Pink' }) : 'Light Pink', hex: '#FFB6C1' },
    { value: Colors.LIGHT_BROWN, label: t ? t('color.options.light_brown', { defaultValue: 'Light Brown' }) : 'Light Brown', hex: '#D2B48C' },
    { value: Colors.LIGHT_GRAY, label: t ? t('color.options.light_gray', { defaultValue: 'Light Gray' }) : 'Light Gray', hex: '#D3D3D3' },

    // Dark variants
    { value: Colors.DARK_RED, label: t ? t('color.options.dark_red', { defaultValue: 'Dark Red' }) : 'Dark Red', hex: '#8B0000' },
    { value: Colors.DARK_GREEN, label: t ? t('color.options.dark_green', { defaultValue: 'Dark Green' }) : 'Dark Green', hex: '#006400' },
    { value: Colors.DARK_BLUE, label: t ? t('color.options.dark_blue', { defaultValue: 'Dark Blue' }) : 'Dark Blue', hex: '#00008B' },
    { value: Colors.DARK_YELLOW, label: t ? t('color.options.dark_yellow', { defaultValue: 'Dark Yellow' }) : 'Dark Yellow', hex: '#B8860B' },
    { value: Colors.DARK_ORANGE, label: t ? t('color.options.dark_orange', { defaultValue: 'Dark Orange' }) : 'Dark Orange', hex: '#FF8C00' },
    { value: Colors.DARK_PURPLE, label: t ? t('color.options.dark_purple', { defaultValue: 'Dark Purple' }) : 'Dark Purple', hex: '#4B0082' },
    { value: Colors.DARK_PINK, label: t ? t('color.options.dark_pink', { defaultValue: 'Dark Pink' }) : 'Dark Pink', hex: '#FF1493' },
    { value: Colors.DARK_BROWN, label: t ? t('color.options.dark_brown', { defaultValue: 'Dark Brown' }) : 'Dark Brown', hex: '#5C4033' },
    { value: Colors.DARK_GRAY, label: t ? t('color.options.dark_gray', { defaultValue: 'Dark Gray' }) : 'Dark Gray', hex: '#A9A9A9' },

    // Specific shades
    { value: Colors.TURQUOISE, label: t ? t('color.options.turquoise', { defaultValue: 'Turquoise' }) : 'Turquoise', hex: '#40E0D0' },
    { value: Colors.TEAL, label: t ? t('color.options.teal', { defaultValue: 'Teal' }) : 'Teal', hex: '#008080' },
    { value: Colors.NAVY, label: t ? t('color.options.navy', { defaultValue: 'Navy' }) : 'Navy', hex: '#000080' },
    { value: Colors.INDIGO, label: t ? t('color.options.indigo', { defaultValue: 'Indigo' }) : 'Indigo', hex: '#4B0082' },
    { value: Colors.VIOLET, label: t ? t('color.options.violet', { defaultValue: 'Violet' }) : 'Violet', hex: '#EE82EE' },
    { value: Colors.MAGENTA, label: t ? t('color.options.magenta', { defaultValue: 'Magenta' }) : 'Magenta', hex: '#FF00FF' },
    { value: Colors.CRIMSON, label: t ? t('color.options.crimson', { defaultValue: 'Crimson' }) : 'Crimson', hex: '#DC143C' },
    { value: Colors.MAROON, label: t ? t('color.options.maroon', { defaultValue: 'Maroon' }) : 'Maroon', hex: '#800000' },
    { value: Colors.OLIVE, label: t ? t('color.options.olive', { defaultValue: 'Olive' }) : 'Olive', hex: '#808000' },
    { value: Colors.LIME, label: t ? t('color.options.lime', { defaultValue: 'Lime' }) : 'Lime', hex: '#00FF00' },
    { value: Colors.AQUA, label: t ? t('color.options.aqua', { defaultValue: 'Aqua' }) : 'Aqua', hex: '#00FFFF' },
    { value: Colors.CYAN, label: t ? t('color.options.cyan', { defaultValue: 'Cyan' }) : 'Cyan', hex: '#00FFFF' },
    { value: Colors.SILVER, label: t ? t('color.options.silver', { defaultValue: 'Silver' }) : 'Silver', hex: '#C0C0C0' },
    { value: Colors.GOLD, label: t ? t('color.options.gold', { defaultValue: 'Gold' }) : 'Gold', hex: '#FFD700' },
    { value: Colors.BEIGE, label: t ? t('color.options.beige', { defaultValue: 'Beige' }) : 'Beige', hex: '#F5F5DC' },
    { value: Colors.CORAL, label: t ? t('color.options.coral', { defaultValue: 'Coral' }) : 'Coral', hex: '#FF7F50' },
    { value: Colors.IVORY, label: t ? t('color.options.ivory', { defaultValue: 'Ivory' }) : 'Ivory', hex: '#FFFFF0' },
    { value: Colors.LAVENDER, label: t ? t('color.options.lavender', { defaultValue: 'Lavender' }) : 'Lavender', hex: '#E6E6FA' },
    { value: Colors.MINT, label: t ? t('color.options.mint', { defaultValue: 'Mint' }) : 'Mint', hex: '#98FB98' },
    { value: Colors.PEACH, label: t ? t('color.options.peach', { defaultValue: 'Peach' }) : 'Peach', hex: '#FFDAB9' },
    { value: Colors.PLUM, label: t ? t('color.options.plum', { defaultValue: 'Plum' }) : 'Plum', hex: '#DDA0DD' },
  ];
  return sortOptionsAlphabetically(options);
};