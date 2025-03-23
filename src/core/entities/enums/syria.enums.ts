// src/enums/location.ts

/**
 * Represents Syrian SyriaGovernorates
 */
export enum SyriaGovernorate {
  DAMASCUS = 'Damascus',
  ALEPPO = 'Aleppo',
  HOMS = 'Homs',
  HAMA = 'Hama',
  LATAKIA = 'Latakia',
  IDLIB = 'Idlib',
  AL_HASAKAH = 'Al-Hasakah',
  DEIR_EZ_ZOR = 'Deir ez-Zor',
  TARTUS = 'Tartus',
  RAQQA = 'Raqqa',
  DARAA = 'Daraa',
  AS_SUWAYDA = 'As-Suwayda',
  QUNEITRA = 'Quneitra',
  DAMASCUS_COUNTRYSIDE = 'Damascus-Countryside',
}

/**
 * Represents Syrian cities
 */
export enum SyriaCity {
  // Damascus cities
  DAMASCUS = 'Damascus',
  DOUMA = 'Douma',
  HARASTA = 'Harasta',
  DARAYYA = 'Darayya',

  // Aleppo cities
  ALEPPO = 'Aleppo',
  MANBIJ = 'Manbij',
  AL_BAB = 'Al-Bab',
  AZAZ = 'Azaz',
  AFRIN = 'Afrin',

  // Homs cities
  HOMS = 'Homs',
  PALMYRA = 'Palmyra',
  AL_RASTAN = 'Al-Rastan',
  TALKALAKH = 'Talkalakh',

  // Hama cities
  HAMA = 'Hama',
  SALAMIYAH = 'Salamiyah',
  MASYAF = 'Masyaf',
  SUQAYLABIYAH = 'Suqaylabiyah',

  // Latakia cities
  LATAKIA = 'Latakia',
  JABLEH = 'Jableh',
  AL_HAFFA = 'Al-Haffa',
  QARDAHA = 'Qardaha',

  // Idlib cities
  IDLIB = 'Idlib',
  MAARRAT_AL_NUMAN = "Maarrat al-Nu'man",
  ARIHA = 'Ariha',
  JISR_AL_SHUGHUR = 'Jisr al-Shughur',
  SARQEP = 'SARQEP',

  // Al-Hasakah cities
  AL_HASAKAH = 'Al-Hasakah',
  QAMISHLI = 'Qamishli',
  RAS_AL_AYN = 'Ras al-Ayn',
  AL_MALIKIYAH = 'Al-Malikiyah',

  // Deir ez-Zor cities
  DEIR_EZ_ZOR = 'Deir ez-Zor',
  AL_MAYADIN = 'Al-Mayadin',
  ABU_KAMAL = 'Abu Kamal',

  // Tartus cities
  TARTUS = 'Tartus',
  BANIYAS = 'Baniyas',
  SAFITA = 'Safita',
  SHEIKH_BADR = 'Sheikh Badr',

  // Raqqa cities
  RAQQA = 'Raqqa',
  AL_THAWRAH = 'Al-Thawrah',
  TELL_ABYAD = 'Tell Abyad',

  // Daraa cities
  DARAA = 'Daraa',
  NAWA = 'Nawa',
  IZRA = 'Izra',
  BUSRA_AL_HARIR = 'Busra al-Harir',

  // As-Suwayda cities
  AS_SUWAYDA = 'As-Suwayda',
  SALKHAD = 'Salkhad',
  SHAHBA = 'Shahba',

  // Quneitra cities
  QUNEITRA = 'Quneitra',
  MADINAT_AL_BAATH = 'Madinat al-Baath',

  // Damascus-Countryside cities
  AL_TALL = 'Al-Tall',
  YABROUD = 'Yabroud',
  AN_NABK = 'An-Nabk',
  QATANA = 'Qatana',
  AL_KISWAH = 'Al-Kiswah',
}

/**
 * Map of SyriaGovernorates to their corresponding cities
 */
export const SyriaGovernorate_TO_CITIES: Record<SyriaGovernorate, SyriaCity[]> =
  {
    [SyriaGovernorate.DAMASCUS]: [
      SyriaCity.DAMASCUS,
      SyriaCity.DOUMA,
      SyriaCity.HARASTA,
      SyriaCity.DARAYYA,
    ],
    [SyriaGovernorate.ALEPPO]: [
      SyriaCity.ALEPPO,
      SyriaCity.MANBIJ,
      SyriaCity.AL_BAB,
      SyriaCity.AZAZ,
      SyriaCity.AFRIN,
    ],
    [SyriaGovernorate.HOMS]: [
      SyriaCity.HOMS,
      SyriaCity.PALMYRA,
      SyriaCity.AL_RASTAN,
      SyriaCity.TALKALAKH,
    ],
    [SyriaGovernorate.HAMA]: [
      SyriaCity.HAMA,
      SyriaCity.SALAMIYAH,
      SyriaCity.MASYAF,
      SyriaCity.SUQAYLABIYAH,
    ],
    [SyriaGovernorate.LATAKIA]: [
      SyriaCity.LATAKIA,
      SyriaCity.JABLEH,
      SyriaCity.AL_HAFFA,
      SyriaCity.QARDAHA,
    ],
    [SyriaGovernorate.IDLIB]: [
      SyriaCity.IDLIB,
      SyriaCity.MAARRAT_AL_NUMAN,
      SyriaCity.ARIHA,
      SyriaCity.JISR_AL_SHUGHUR,
      SyriaCity.SARQEP,
    ],
    [SyriaGovernorate.AL_HASAKAH]: [
      SyriaCity.AL_HASAKAH,
      SyriaCity.QAMISHLI,
      SyriaCity.RAS_AL_AYN,
      SyriaCity.AL_MALIKIYAH,
    ],
    [SyriaGovernorate.DEIR_EZ_ZOR]: [
      SyriaCity.DEIR_EZ_ZOR,
      SyriaCity.AL_MAYADIN,
      SyriaCity.ABU_KAMAL,
    ],
    [SyriaGovernorate.TARTUS]: [
      SyriaCity.TARTUS,
      SyriaCity.BANIYAS,
      SyriaCity.SAFITA,
      SyriaCity.SHEIKH_BADR,
    ],
    [SyriaGovernorate.RAQQA]: [
      SyriaCity.RAQQA,
      SyriaCity.AL_THAWRAH,
      SyriaCity.TELL_ABYAD,
    ],
    [SyriaGovernorate.DARAA]: [
      SyriaCity.DARAA,
      SyriaCity.NAWA,
      SyriaCity.IZRA,
      SyriaCity.BUSRA_AL_HARIR,
    ],
    [SyriaGovernorate.AS_SUWAYDA]: [
      SyriaCity.AS_SUWAYDA,
      SyriaCity.SALKHAD,
      SyriaCity.SHAHBA,
    ],
    [SyriaGovernorate.QUNEITRA]: [
      SyriaCity.QUNEITRA,
      SyriaCity.MADINAT_AL_BAATH,
    ],
    [SyriaGovernorate.DAMASCUS_COUNTRYSIDE]: [
      SyriaCity.AL_TALL,
      SyriaCity.YABROUD,
      SyriaCity.AN_NABK,
      SyriaCity.QATANA,
      SyriaCity.AL_KISWAH,
    ],
  };

/**
 * Arabic names for SyriaGovernorates (for bilingual support)
 */
export const SyriaGovernorate_ARABIC_NAMES: Record<SyriaGovernorate, string> = {
  [SyriaGovernorate.DAMASCUS]: 'دمشق',
  [SyriaGovernorate.ALEPPO]: 'حلب',
  [SyriaGovernorate.HOMS]: 'حمص',
  [SyriaGovernorate.HAMA]: 'حماة',
  [SyriaGovernorate.LATAKIA]: 'اللاذقية',
  [SyriaGovernorate.IDLIB]: 'إدلب',
  [SyriaGovernorate.AL_HASAKAH]: 'الحسكة',
  [SyriaGovernorate.DEIR_EZ_ZOR]: 'دير الزور',
  [SyriaGovernorate.TARTUS]: 'طرطوس',
  [SyriaGovernorate.RAQQA]: 'الرقة',
  [SyriaGovernorate.DARAA]: 'درعا',
  [SyriaGovernorate.AS_SUWAYDA]: 'السويداء',
  [SyriaGovernorate.QUNEITRA]: 'القنيطرة',
  [SyriaGovernorate.DAMASCUS_COUNTRYSIDE]: 'ريف دمشق',
};

/**
 * Arabic names for SyriaCities (for bilingual support)
 */
export const SyriaCity_ARABIC_NAMES: Record<SyriaCity, string> = {
  // Damascus cities
  [SyriaCity.DAMASCUS]: 'دمشق',
  [SyriaCity.DOUMA]: 'دوما',
  [SyriaCity.HARASTA]: 'حرستا',
  [SyriaCity.DARAYYA]: 'داريا',

  // Aleppo cities
  [SyriaCity.ALEPPO]: 'حلب',
  [SyriaCity.MANBIJ]: 'منبج',
  [SyriaCity.AL_BAB]: 'الباب',
  [SyriaCity.AZAZ]: 'أعزاز',
  [SyriaCity.AFRIN]: 'عفرين',

  // Homs cities
  [SyriaCity.HOMS]: 'حمص',
  [SyriaCity.PALMYRA]: 'تدمر',
  [SyriaCity.AL_RASTAN]: 'الرستن',
  [SyriaCity.TALKALAKH]: 'تلكلخ',

  // Hama cities
  [SyriaCity.HAMA]: 'حماة',
  [SyriaCity.SALAMIYAH]: 'سلمية',
  [SyriaCity.MASYAF]: 'مصياف',
  [SyriaCity.SUQAYLABIYAH]: 'السقيلبية',

  // Latakia cities
  [SyriaCity.LATAKIA]: 'اللاذقية',
  [SyriaCity.JABLEH]: 'جبلة',
  [SyriaCity.AL_HAFFA]: 'الحفة',
  [SyriaCity.QARDAHA]: 'القرداحة',

  // Idlib cities
  [SyriaCity.IDLIB]: 'إدلب',
  [SyriaCity.MAARRAT_AL_NUMAN]: 'معرة النعمان',
  [SyriaCity.ARIHA]: 'أريحا',
  [SyriaCity.JISR_AL_SHUGHUR]: 'جسر الشغور',
  [SyriaCity.SARQEP]: 'سراقب',

  // Al-Hasakah cities
  [SyriaCity.AL_HASAKAH]: 'الحسكة',
  [SyriaCity.QAMISHLI]: 'القامشلي',
  [SyriaCity.RAS_AL_AYN]: 'رأس العين',
  [SyriaCity.AL_MALIKIYAH]: 'المالكية',

  // Deir ez-Zor cities
  [SyriaCity.DEIR_EZ_ZOR]: 'دير الزور',
  [SyriaCity.AL_MAYADIN]: 'الميادين',
  [SyriaCity.ABU_KAMAL]: 'أبو كمال',

  // Tartus cities
  [SyriaCity.TARTUS]: 'طرطوس',
  [SyriaCity.BANIYAS]: 'بانياس',
  [SyriaCity.SAFITA]: 'صافيتا',
  [SyriaCity.SHEIKH_BADR]: 'الشيخ بدر',

  // Raqqa cities
  [SyriaCity.RAQQA]: 'الرقة',
  [SyriaCity.AL_THAWRAH]: 'الثورة',
  [SyriaCity.TELL_ABYAD]: 'تل أبيض',

  // Daraa cities
  [SyriaCity.DARAA]: 'درعا',
  [SyriaCity.NAWA]: 'نوى',
  [SyriaCity.IZRA]: 'إزرع',
  [SyriaCity.BUSRA_AL_HARIR]: 'بصرى الحرير',

  // As-Suwayda cities
  [SyriaCity.AS_SUWAYDA]: 'السويداء',
  [SyriaCity.SALKHAD]: 'صلخد',
  [SyriaCity.SHAHBA]: 'شهبا',

  // Quneitra cities
  [SyriaCity.QUNEITRA]: 'القنيطرة',
  [SyriaCity.MADINAT_AL_BAATH]: 'مدينة البعث',

  // Damascus-Countryside cities
  [SyriaCity.AL_TALL]: 'التل',
  [SyriaCity.YABROUD]: 'يبرود',
  [SyriaCity.AN_NABK]: 'النبك',
  [SyriaCity.QATANA]: 'قطنا',
  [SyriaCity.AL_KISWAH]: 'الكسوة',
};

/**
 * Get SyriaGovernorate options for select components
 */
export const getSyriaGovernorateOptions = () => {
  return Object.values(SyriaGovernorate).map((value) => ({
    value,
    label: value.replace(/-/g, ' '),
  }));
};

/**
 * Get SyriaGovernorate options with Arabic names for bilingual select components
 */
export const getBilingualSyriaGovernorateOptions = () => {
  return Object.values(SyriaGovernorate).map((value) => ({
    value,
    label: `${value.replace(/-/g, ' ')} (${
      SyriaGovernorate_ARABIC_NAMES[value]
    })`,
  }));
};

/**
 * Get SyriaCity options for select components
 */
export const getSyriaCityOptions = () => {
  return Object.values(SyriaCity).map((value) => ({
    value,
    label: value.replace(/-/g, ' '),
  }));
};

/**
 * Get bilingual SyriaCity options for select components
 */
export const getBilingualSyriaCityOptions = () => {
  return Object.values(SyriaCity).map((value) => ({
    value,
    label: `${value.replace(/-/g, ' ')} (${SyriaCity_ARABIC_NAMES[value]})`,
  }));
};

/**
 * Get SyriaCity options for a specific SyriaGovernorate
 * @param SyriaGovernorate The SyriaGovernorate to get cities for
 */
export const getCitiesBySyriaGovernorate = (
  SyriaGovernorate: SyriaGovernorate,
) => {
  return SyriaGovernorate_TO_CITIES[SyriaGovernorate].map((SyriaCity) => ({
    value: SyriaCity,
    label: SyriaCity.replace(/-/g, ' '),
  }));
};

/**
 * Get bilingual SyriaCity options for a specific SyriaGovernorate
 * @param SyriaGovernorate The SyriaGovernorate to get cities for
 * @param useArabic Whether to use Arabic names (true) or English (false)
 */
export const getBilingualCitiesBySyriaGovernorate = (
  SyriaGovernorate: SyriaGovernorate,
  useArabic: boolean = false
) => {
  return SyriaGovernorate_TO_CITIES[SyriaGovernorate].map((city) => ({
    value: city,
    label: useArabic ? SyriaCity_ARABIC_NAMES[city] : city.replace(/-/g, ' ')
  }));
};