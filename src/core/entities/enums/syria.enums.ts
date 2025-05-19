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
  KAFR_SOUSA = 'Kafr Sousa',
  JARAMANA = 'Jaramana',
  MEZZEH = 'Mezzeh', // جديد
  AL_QADAM = 'Al-Qadam', // جديد

  // Aleppo cities
  ALEPPO = 'Aleppo',
  MANBIJ = 'Manbij',
  AL_BAB = 'Al-Bab',
  AZAZ = 'Azaz',
  AFRIN = 'Afrin',
  JARABLUS = 'Jarablus',
  KOBANI = 'Kobani',
  AL_SAFIRA = 'Al-Safira', // جديد
  DAYR_HAFIR = 'Dayr Hafir', // جديد

  // Homs cities
  HOMS = 'Homs',
  PALMYRA = 'Palmyra',
  AL_RASTAN = 'Al-Rastan',
  TALKALAKH = 'Talkalakh',
  AL_QUSAYR = 'Al-Qusayr',
  TADMOR = 'Tadmor',
  AL_MUKHRAM = 'Al-Mukhram', // جديد
  AL_QARYATAYN = 'Al-Qaryatayn', // جديد

  // Hama cities
  HAMA = 'Hama',
  SALAMIYAH = 'Salamiyah',
  MASYAF = 'Masyaf',
  SUQAYLABIYAH = 'Suqaylabiyah',
  MUHARDA = 'Muharda',
  KAFR_NABUDA = 'Kafr Nabuda',
  KAFR_ZITA = 'Kafr Zita', // جديد
  TAYBAT_AL_IMAM = 'Taybat al-Imam', // جديد

  // Latakia cities
  LATAKIA = 'Latakia',
  JABLEH = 'Jableh',
  AL_HAFFA = 'Al-Haffa',
  QARDAHA = 'Qardaha',
  KASAB = 'Kasab',
  SALMA = 'Salma', // جديد
  BEIT_YASHOUT = 'Beit Yashout', // جديد

  // Idlib cities
  IDLIB = 'Idlib',
  MAARRAT_AL_NUMAN = "Maarrat al-Nu'man",
  ARIHA = 'Ariha',
  JISR_AL_SHUGHUR = 'Jisr al-Shughur',
  SARAQEB = 'Saraqeb',
  KHAN_SHAYKHUN = 'Khan Shaykhun',
  BANSH = 'Bansh', // جديد
  JABAL_AL_ZAWIYA = 'Jabal al-Zawiya', // جديد

  // Al-Hasakah cities
  AL_HASAKAH = 'Al-Hasakah',
  QAMISHLI = 'Qamishli',
  RAS_AL_AYN = 'Ras al-Ayn',
  AL_MALIKIYAH = 'Al-Malikiyah',
  AMUDA = 'Amuda',
  AL_SHADDADI = 'Al-Shaddadi', // جديد
  TAL_TAMR = 'Tal Tamr', // جديد

  // Deir ez-Zor cities
  DEIR_EZ_ZOR = 'Deir ez-Zor',
  AL_MAYADIN = 'Al-Mayadin',
  ABU_KAMAL = 'Abu Kamal',
  HAJJIN = 'Hajjin',
  AL_BUKAMAL = 'Al-Bukamal', // جديد
  AL_JALAA = 'Al-Jalaa', // جديد

  // Tartus cities
  TARTUS = 'Tartus',
  BANIYAS = 'Baniyas',
  SAFITA = 'Safita',
  SHEIKH_BADR = 'Sheikh Badr',
  DURAYKISH = 'Duraykish',
  AL_HAMIDIYAH = 'Al-Hamidiyah', // جديد
  AL_QADMOUS = 'Al-Qadmous', // جديد

  // Raqqa cities
  RAQQA = 'Raqqa',
  AL_THAWRAH = 'Al-Thawrah',
  TELL_ABYAD = 'Tell Abyad',
  AIN_ISSA = 'Ain Issa',
  AL_KARAMA = 'Al-Karama', // جديد
  MANSURA = 'Mansura', // جديد

  // Daraa cities
  DARAA = 'Daraa',
  NAWA = 'Nawa',
  IZRA = 'Izra',
  BUSRA_AL_HARIR = 'Busra al-Harir',
  TAFAS = 'Tafas',
  JASSIM = 'Jassim', // جديد
  AL_HARA = 'Al-Hara', // جديد

  // As-Suwayda cities
  AS_SUWAYDA = 'As-Suwayda',
  SALKHAD = 'Salkhad',
  SHAHBA = 'Shahba',
  AL_QURAYYA = 'Al-Qurayya',
  ARIQA = 'Ariqa', // جديد
  DHIBIN = 'Dhibin', // جديد

  // Quneitra cities
  QUNEITRA = 'Quneitra',
  MADINAT_AL_BAATH = 'Madinat al-Baath',
  KHAN_ARNABA = 'Khan Arnaba',
  BAQATHA = 'Baqatha', // جديد

  // Damascus-Countryside cities
  AL_TALL = 'Al-Tall',
  YABROUD = 'Yabroud',
  AN_NABK = 'An-Nabk',
  QATANA = 'Qatana',
  AL_KISWAH = 'Al-Kiswah',
  ZABADANI = 'Zabadani',
  QUTAYFA = 'Qutayfa',
  DUMAIRE = 'Dumaire', // جديد
  HARJALA = 'Harjala', // جديد
}

/**
 * Map of SyriaGovernorates to their corresponding cities
 */
export const SyriaGovernorate_TO_CITIES: Record<SyriaGovernorate, SyriaCity[]> = {
  [SyriaGovernorate.DAMASCUS]: [
    SyriaCity.DAMASCUS,
    SyriaCity.DOUMA,
    SyriaCity.HARASTA,
    SyriaCity.DARAYYA,
    SyriaCity.KAFR_SOUSA,
    SyriaCity.JARAMANA,
    SyriaCity.MEZZEH,
    SyriaCity.AL_QADAM,
  ],
  [SyriaGovernorate.ALEPPO]: [
    SyriaCity.ALEPPO,
    SyriaCity.MANBIJ,
    SyriaCity.AL_BAB,
    SyriaCity.AZAZ,
    SyriaCity.AFRIN,
    SyriaCity.JARABLUS,
    SyriaCity.KOBANI,
    SyriaCity.AL_SAFIRA,
    SyriaCity.DAYR_HAFIR,
  ],
  [SyriaGovernorate.HOMS]: [
    SyriaCity.HOMS,
    SyriaCity.PALMYRA,
    SyriaCity.AL_RASTAN,
    SyriaCity.TALKALAKH,
    SyriaCity.AL_QUSAYR,
    SyriaCity.TADMOR,
    SyriaCity.AL_MUKHRAM,
    SyriaCity.AL_QARYATAYN,
  ],
  [SyriaGovernorate.HAMA]: [
    SyriaCity.HAMA,
    SyriaCity.SALAMIYAH,
    SyriaCity.MASYAF,
    SyriaCity.SUQAYLABIYAH,
    SyriaCity.MUHARDA,
    SyriaCity.KAFR_NABUDA,
    SyriaCity.KAFR_ZITA,
    SyriaCity.TAYBAT_AL_IMAM,
  ],
  [SyriaGovernorate.LATAKIA]: [
    SyriaCity.LATAKIA,
    SyriaCity.JABLEH,
    SyriaCity.AL_HAFFA,
    SyriaCity.QARDAHA,
    SyriaCity.KASAB,
    SyriaCity.SALMA,
    SyriaCity.BEIT_YASHOUT,
  ],
  [SyriaGovernorate.IDLIB]: [
    SyriaCity.IDLIB,
    SyriaCity.MAARRAT_AL_NUMAN,
    SyriaCity.ARIHA,
    SyriaCity.JISR_AL_SHUGHUR,
    SyriaCity.SARAQEB,
    SyriaCity.KHAN_SHAYKHUN,
    SyriaCity.BANSH,
    SyriaCity.JABAL_AL_ZAWIYA,
  ],
  [SyriaGovernorate.AL_HASAKAH]: [
    SyriaCity.AL_HASAKAH,
    SyriaCity.QAMISHLI,
    SyriaCity.RAS_AL_AYN,
    SyriaCity.AL_MALIKIYAH,
    SyriaCity.AMUDA,
    SyriaCity.AL_SHADDADI,
    SyriaCity.TAL_TAMR,
  ],
  [SyriaGovernorate.DEIR_EZ_ZOR]: [
    SyriaCity.DEIR_EZ_ZOR,
    SyriaCity.AL_MAYADIN,
    SyriaCity.ABU_KAMAL,
    SyriaCity.HAJJIN,
    SyriaCity.AL_BUKAMAL,
    SyriaCity.AL_JALAA,
  ],
  [SyriaGovernorate.TARTUS]: [
    SyriaCity.TARTUS,
    SyriaCity.BANIYAS,
    SyriaCity.SAFITA,
    SyriaCity.SHEIKH_BADR,
    SyriaCity.DURAYKISH,
    SyriaCity.AL_HAMIDIYAH,
    SyriaCity.AL_QADMOUS,
  ],
  [SyriaGovernorate.RAQQA]: [
    SyriaCity.RAQQA,
    SyriaCity.AL_THAWRAH,
    SyriaCity.TELL_ABYAD,
    SyriaCity.AIN_ISSA,
    SyriaCity.AL_KARAMA,
    SyriaCity.MANSURA,
  ],
  [SyriaGovernorate.DARAA]: [
    SyriaCity.DARAA,
    SyriaCity.NAWA,
    SyriaCity.IZRA,
    SyriaCity.BUSRA_AL_HARIR,
    SyriaCity.TAFAS,
    SyriaCity.JASSIM,
    SyriaCity.AL_HARA,
  ],
  [SyriaGovernorate.AS_SUWAYDA]: [
    SyriaCity.AS_SUWAYDA,
    SyriaCity.SALKHAD,
    SyriaCity.SHAHBA,
    SyriaCity.AL_QURAYYA,
    SyriaCity.ARIQA,
    SyriaCity.DHIBIN,
  ],
  [SyriaGovernorate.QUNEITRA]: [
    SyriaCity.QUNEITRA,
    SyriaCity.MADINAT_AL_BAATH,
    SyriaCity.KHAN_ARNABA,
    SyriaCity.BAQATHA,
  ],
  [SyriaGovernorate.DAMASCUS_COUNTRYSIDE]: [
    SyriaCity.AL_TALL,
    SyriaCity.YABROUD,
    SyriaCity.AN_NABK,
    SyriaCity.QATANA,
    SyriaCity.AL_KISWAH,
    SyriaCity.ZABADANI,
    SyriaCity.QUTAYFA,
    SyriaCity.DUMAIRE,
    SyriaCity.HARJALA,
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
  [SyriaCity.KAFR_SOUSA]: 'كفر سوسة',
  [SyriaCity.JARAMANA]: 'جرمانا',
  [SyriaCity.MEZZEH]: 'المزة',
  [SyriaCity.AL_QADAM]: 'القدم',

  // Aleppo cities
  [SyriaCity.ALEPPO]: 'حلب',
  [SyriaCity.MANBIJ]: 'منبج',
  [SyriaCity.AL_BAB]: 'الباب',
  [SyriaCity.AZAZ]: 'أعزاز',
  [SyriaCity.AFRIN]: 'عفرين',
  [SyriaCity.JARABLUS]: 'جرابلس',
  [SyriaCity.KOBANI]: 'كوباني',
  [SyriaCity.AL_SAFIRA]: 'السفيرة',
  [SyriaCity.DAYR_HAFIR]: 'دير حافر',

  // Homs cities
  [SyriaCity.HOMS]: 'حمص',
  [SyriaCity.PALMYRA]: 'تدمر',
  [SyriaCity.AL_RASTAN]: 'الرستن',
  [SyriaCity.TALKALAKH]: 'تلكلخ',
  [SyriaCity.AL_QUSAYR]: 'القصير',
  [SyriaCity.TADMOR]: 'تدمر',
  [SyriaCity.AL_MUKHRAM]: 'المخرم',
  [SyriaCity.AL_QARYATAYN]: 'القريتين',

  // Hama cities
  [SyriaCity.HAMA]: 'حماة',
  [SyriaCity.SALAMIYAH]: 'سلمية',
  [SyriaCity.MASYAF]: 'مصياف',
  [SyriaCity.SUQAYLABIYAH]: 'السقيلبية',
  [SyriaCity.MUHARDA]: 'محردة',
  [SyriaCity.KAFR_NABUDA]: 'كفر نبودة',
  [SyriaCity.KAFR_ZITA]: 'كفر زيتا',
  [SyriaCity.TAYBAT_AL_IMAM]: 'طيبة الإمام',

  // Latakia cities
  [SyriaCity.LATAKIA]: 'اللاذقية',
  [SyriaCity.JABLEH]: 'جبلة',
  [SyriaCity.AL_HAFFA]: 'الحفة',
  [SyriaCity.QARDAHA]: 'القرداحة',
  [SyriaCity.KASAB]: 'كسب',
  [SyriaCity.SALMA]: 'صلنفة',
  [SyriaCity.BEIT_YASHOUT]: 'بيت ياشوط',

  // Idlib cities
  [SyriaCity.IDLIB]: 'إدلب',
  [SyriaCity.MAARRAT_AL_NUMAN]: 'معرة النعمان',
  [SyriaCity.ARIHA]: 'أريحا',
  [SyriaCity.JISR_AL_SHUGHUR]: 'جسر الشغور',
  [SyriaCity.SARAQEB]: 'سراقب',
  [SyriaCity.KHAN_SHAYKHUN]: 'خان شيخون',
  [SyriaCity.BANSH]: 'بنش',
  [SyriaCity.JABAL_AL_ZAWIYA]: 'جبل الزاوية',

  // Al-Hasakah cities
  [SyriaCity.AL_HASAKAH]: 'الحسكة',
  [SyriaCity.QAMISHLI]: 'القامشلي',
  [SyriaCity.RAS_AL_AYN]: 'رأس العين',
  [SyriaCity.AL_MALIKIYAH]: 'المالكية',
  [SyriaCity.AMUDA]: 'عامودا',
  [SyriaCity.AL_SHADDADI]: 'الشدادي',
  [SyriaCity.TAL_TAMR]: 'تل تمر',

  // Deir ez-Zor cities
  [SyriaCity.DEIR_EZ_ZOR]: 'دير الزور',
  [SyriaCity.AL_MAYADIN]: 'الميادين',
  [SyriaCity.ABU_KAMAL]: 'أبو كمال',
  [SyriaCity.HAJJIN]: 'هجين',
  [SyriaCity.AL_BUKAMAL]: 'البوكمال',
  [SyriaCity.AL_JALAA]: 'الجلاء',

  // Tartus cities
  [SyriaCity.TARTUS]: 'طرطوس',
  [SyriaCity.BANIYAS]: 'بانياس',
  [SyriaCity.SAFITA]: 'صافيتا',
  [SyriaCity.SHEIKH_BADR]: 'الشيخ بدر',
  [SyriaCity.DURAYKISH]: 'درويكيش',
  [SyriaCity.AL_HAMIDIYAH]: 'الحميدية',
  [SyriaCity.AL_QADMOUS]: 'القدموس',

  // Raqqa cities
  [SyriaCity.RAQQA]: 'الرقة',
  [SyriaCity.AL_THAWRAH]: 'الثورة',
  [SyriaCity.TELL_ABYAD]: 'تل أبيض',
  [SyriaCity.AIN_ISSA]: 'عين عيسى',
  [SyriaCity.AL_KARAMA]: 'الكرامة',
  [SyriaCity.MANSURA]: 'منصورة',

  // Daraa cities
  [SyriaCity.DARAA]: 'درعا',
  [SyriaCity.NAWA]: 'نوى',
  [SyriaCity.IZRA]: 'إزرع',
  [SyriaCity.BUSRA_AL_HARIR]: 'بصرى الحرير',
  [SyriaCity.TAFAS]: 'طفس',
  [SyriaCity.JASSIM]: 'جاسم',
  [SyriaCity.AL_HARA]: 'الحارة',

  // As-Suwayda cities
  [SyriaCity.AS_SUWAYDA]: 'السويداء',
  [SyriaCity.SALKHAD]: 'صلخد',
  [SyriaCity.SHAHBA]: 'شهبا',
  [SyriaCity.AL_QURAYYA]: 'القريا',
  [SyriaCity.ARIQA]: 'عريقة',
  [SyriaCity.DHIBIN]: 'ذيبين',

  // Quneitra cities
  [SyriaCity.QUNEITRA]: 'القنيطرة',
  [SyriaCity.MADINAT_AL_BAATH]: 'مدينة البعث',
  [SyriaCity.KHAN_ARNABA]: 'خان أرنبة',
  [SyriaCity.BAQATHA]: 'بقعاثا',

  // Damascus-Countryside cities
  [SyriaCity.AL_TALL]: 'التل',
  [SyriaCity.YABROUD]: 'يبرود',
  [SyriaCity.AN_NABK]: 'النبك',
  [SyriaCity.QATANA]: 'قطنا',
  [SyriaCity.AL_KISWAH]: 'الكسوة',
  [SyriaCity.ZABADANI]: 'الزبداني',
  [SyriaCity.QUTAYFA]: 'القطيفة',
  [SyriaCity.DUMAIRE]: 'دومير',
  [SyriaCity.HARJALA]: 'حرجلة',
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