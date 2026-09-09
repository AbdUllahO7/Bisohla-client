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
  MEZZEH = 'Mezzeh',
  AL_QADAM = 'Al-Qadam',
  BARZEH = 'Barzeh',
  QABOUN = 'Qaboun',
  JOBAR = 'Jobar',
  RUKN_AL_DIN = 'Rukn al-Din',
  AL_MIDAN = 'Al-Midan',
  SAYYIDAH_ZAYNAB = 'Sayyidah Zaynab',
  KAFR_BATNA = 'Kafr Batna',
  SAQBA = 'Saqba',
  ARBIN = 'Arbin',
  ZAMALKA = 'Zamalka',

  // Aleppo cities
  ALEPPO = 'Aleppo',
  MANBIJ = 'Manbij',
  AL_BAB = 'Al-Bab',
  AZAZ = 'Azaz',
  AFRIN = 'Afrin',
  JARABLUS = 'Jarablus',
  KOBANI = 'Kobani',
  AL_SAFIRA = 'Al-Safira',
  DAYR_HAFIR = 'Dayr Hafir',
  MARE = "Mare'",
  AL_RAI = 'Al-Rai',
  ATARIB = 'Atarib',
  DARAT_IZZA = 'Darat Izza',
  NUBL = 'Nubl',
  AL_ZAHRAA = 'Al-Zahraa',
  TADIF = 'Tadif',
  AKHTARIN = 'Akhtarin',
  SURAN = 'Suran',
  AL_HADHER = 'Al-Hadher',

  // Homs cities
  HOMS = 'Homs',
  PALMYRA = 'Palmyra',
  AL_RASTAN = 'Al-Rastan',
  TALKALAKH = 'Talkalakh',
  AL_QUSAYR = 'Al-Qusayr',
  TADMOR = 'Tadmor',
  AL_MUKHRAM = 'Al-Mukhram',
  AL_QARYATAYN = 'Al-Qaryatayn',
  TALBISAH = 'Talbisah',
  AL_HOULA = 'Al-Houla',
  SADAD = 'Sadad',
  SHIN = 'Shin',
  AL_MUKHARRAM_AL_FAWQANI = 'Al-Mukharram al-Fawqani',
  HISYA = 'Hisya',
  AL_SUKHNAH = 'Al-Sukhnah',
  HAWSH_HAJU = 'Hawsh Haju',
  ZAIDAL = 'Zaidal',
  MAHEEN = 'Maheen',

  // Hama cities
  HAMA = 'Hama',
  SALAMIYAH = 'Salamiyah',
  MASYAF = 'Masyaf',
  SUQAYLABIYAH = 'Suqaylabiyah',
  MUHARDA = 'Muharda',
  KAFR_NABUDA = 'Kafr Nabuda',
  KAFR_ZITA = 'Kafr Zita',
  TAYBAT_AL_IMAM = 'Taybat al-Imam',
  HALFAYA = 'Halfaya',
  TREMSEH = 'Tremseh',
  LATAMNA = 'Latamna',
  MOREK = 'Morek',
  SHAYZAR = 'Shayzar',
  JUBB_RAMLAH = 'Jubb Ramlah',
  QALAAT_AL_MADIQ = 'Qalaat al-Madiq',
  AL_SUQAYLABIYAH = 'Al-Suqaylabiyah',
  KHATTAB = 'Khattab',
  AL_ZIYARAH = 'Al-Ziyarah',

  // Latakia cities
  LATAKIA = 'Latakia',
  JABLEH = 'Jableh',
  AL_HAFFA = 'Al-Haffa',
  QARDAHA = 'Qardaha',
  KASAB = 'Kasab',
  SALMA = 'Salma',
  BEIT_YASHOUT = 'Beit Yashout',
  AIN_AL_BAYDA = 'Ain al-Bayda',
  BASIT = 'Basit',
  BURJ_ISLAM = 'Burj Islam',
  RABIA = 'Rabia',
  KINSABBA = 'Kinsabba',
  SLINFAH = 'Slinfah',
  DUWAYRKAH = 'Duwayrkah',
  HARF_AL_MUSAYTIRAH = 'Harf al-Musaytirah',
  AL_SAFSAFAH = 'Al-Safsafah',
  AL_FAKHURAH = 'Al-Fakhurah',

  // Idlib cities
  IDLIB = 'Idlib',
  MAARRAT_AL_NUMAN = "Maarrat al-Nu'man",
  ARIHA = 'Ariha',
  JISR_AL_SHUGHUR = 'Jisr al-Shughur',
  SARAQEB = 'Saraqeb',
  KHAN_SHAYKHUN = 'Khan Shaykhun',
  BANSH = 'Bansh',
  JABAL_AL_ZAWIYA = 'Jabal al-Zawiya',
  KAFRANBEL = 'Kafranbel',
  TAFTANAZ = 'Taftanaz',
  BINNISH = 'Binnish',
  SALQIN = 'Salqin',
  HAREM = 'Harem',
  DARKUSH = 'Darkush',
  AL_DANA = 'Al-Dana',
  MAARAT_MISRIN = 'Maarat Misrin',
  KAFR_TAKHARIM = 'Kafr Takharim',
  TALMENES = 'Talmenes',
  SARMADA = 'Sarmada',

  // Al-Hasakah cities
  AL_HASAKAH = 'Al-Hasakah',
  QAMISHLI = 'Qamishli',
  RAS_AL_AYN = 'Ras al-Ayn',
  AL_MALIKIYAH = 'Al-Malikiyah',
  AMUDA = 'Amuda',
  AL_SHADDADI = 'Al_Shaddadi',
  TAL_TAMR = 'Tal Tamr',
  AL_DARBASIYAH = 'Al-Darbasiyah',
  AL_QAHTANIYAH = 'Al-Qahtaniyah',
  AL_MUABBADAH = 'Al-Muabbadah',
  AL_YAARUBIYAH = 'Al-Yaarubiyah',
  AL_JAWADIYAH = 'Al-Jawadiyah',
  TAL_BRAK = 'Tal Brak',
  AL_HAUL = 'Al-Haul',
  MARKADA = 'Markada',
  AL_ARESHAH = 'Al-Areshah',
  AL_SABAH = 'Al-Sabah',

  // Deir ez-Zor cities
  DEIR_EZ_ZOR = 'Deir ez-Zor',
  AL_MAYADIN = 'Al-Mayadin',
  ABU_KAMAL = 'Abu Kamal',
  HAJJIN = 'Hajjin',
  AL_BUKAMAL = 'Al-Bukamal',
  AL_JALAA = 'Al-Jalaa',
  AL_ASHARA = 'Al-Ashara',
  AL_QURIYAH = 'Al-Quriyah',
  KHASHAM = 'Khasham',
  MUHASAN = 'Muhasan',
  THIBAN = 'Thiban',
  AL_SALIHIYAH = 'Al-Salihiyah',
  MARAT = 'Marat',
  AL_BUSAYRAH = 'Al-Busayrah',
  DHIBAN = 'Dhiban',
  AL_JARTHI = 'Al-Jarthi',

  // Tartus cities
  TARTUS = 'Tartus',
  BANIYAS = 'Baniyas',
  SAFITA = 'Safita',
  SHEIKH_BADR = 'Sheikh Badr',
  DURAYKISH = 'Duraykish',
  AL_HAMIDIYAH = 'Al-Hamidiyah',
  AL_QADMOUS = 'Al-Qadmous',
  AL_SAWDA = 'Al-Sawda',
  MASHTA_AL_HELU = 'Mashta al-Helu',
  KHIRBET_AL_FARAS = 'Khirbet al-Faras',
  AL_RAWDAH = 'Al-Rawdah',
  BRUMMANEH = 'Brummaneh',
  KAFF_AL_JAA = 'Kaff al-Jaa',
  ARWAD = 'Arwad',
  AL_ANNAZAH = 'Al-Annazah',

  // Raqqa cities
  RAQQA = 'Raqqa',
  AL_THAWRAH = 'Al-Thawrah',
  TELL_ABYAD = 'Tell Abyad',
  AIN_ISSA = 'Ain Issa',
  AL_KARAMA = 'Al-Karama',
  MANSURA = 'Mansura',
  SULUK = 'Suluk',
  TABQA = 'Tabqa',
  AL_JURNEYYEH = 'Al-Jurneyyeh',
  MAADAN = 'Maadan',
  SABKHA = 'Sabkha',
  AL_KASRAH = 'Al-Kasrah',
  AL_MANSURAH = 'Al-Mansurah',
  RATLAH = 'Ratlah',
  AL_ROMTHANA = 'Al-Romthana',
  HAMRAT_NASIR = 'Hamrat Nasir',

  // Daraa cities
  DARAA = 'Daraa',
  NAWA = 'Nawa',
  IZRA = 'Izra',
  BUSRA_AL_HARIR = 'Busra al-Harir',
  TAFAS = 'Tafas',
  JASSIM = 'Jassim',
  AL_HARA = 'Al-Hara',
  INKHIL = 'Inkhil',
  JASIM = 'Jasim',
  DA_IL = "Da'il",
  KHIRBET_GHAZALEH = 'Khirbet Ghazaleh',
  AL_SANAMAYN = 'Al-Sanamayn',
  GHABAGHIB = 'Ghabaghib',
  AL_SHAYKH_MASKIN = 'Al-Shaykh Maskin',
  TASIL = 'Tasil',
  MUZAYRIB = 'Muzayrib',
  SAHM_AL_JAWLAN = 'Sahm al-Jawlan',

  // As-Suwayda cities
  AS_SUWAYDA = 'As-Suwayda',
  SALKHAD = 'Salkhad',
  SHAHBA = 'Shahba',
  AL_QURAYYA = 'Al-Qurayya',
  ARIQA = 'Ariqa',
  DHIBIN = 'Dhibin',
  SALIM = 'Salim',
  IMTAN = 'Imtan',
  ATIL = 'Atil',
  QANAWAT = 'Qanawat',
  MELH = 'Melh',
  AL_KAFR = 'Al-Kafr',
  AL_MUHAJAH = 'Al-Muhajah',
  SUR = 'Sur',
  AL_MASMIYAH = 'Al-Masmiyah',
  AL_MAZRAA = 'Al-Mazraa',

  // Quneitra cities
  QUNEITRA = 'Quneitra',
  MADINAT_AL_BAATH = 'Madinat al-Baath',
  KHAN_ARNABA = 'Khan Arnaba',
  BAQATHA = 'Baqatha',
  HADAR = 'Hadar',
  AIN_AL_TINEH = 'Ain al-Tineh',
  JUBATA_AL_KHASHAB = 'Jubata al-Khashab',
  JABA = 'Jaba',
  BIR_AJAM = 'Bir Ajam',
  TARANJAH = 'Taranjah',
  NABA_AL_SAKHIR = 'Naba al-Sakhir',
  RAWADI = 'Rawadi',
  BARIQA = 'Bariqa',

  // Damascus-Countryside cities
  AL_TALL = 'Al-Tall',
  YABROUD = 'Yabroud',
  AN_NABK = 'An-Nabk',
  QATANA = 'Qatana',
  AL_KISWAH = 'Al-Kiswah',
  ZABADANI = 'Zabadani',
  QUTAYFA = 'Qutayfa',
  DUMAIRE = 'Dumaire',
  HARJALA = 'Harjala',
  AL_QUTAYFAH = 'Al-Qutayfah',
  MADAYA = 'Madaya',
  SERGHAYA = 'Serghaya',
  RANKOUS = 'Rankous',
  SAIDNAYA = 'Saidnaya',
  MAALOULA = 'Maaloula',
  DEIR_ATIYAH = 'Deir Atiyah',
  AL_RUHAYBAH = 'Al-Ruhaybah',
  AL_DUMAYR = 'Al-Dumayr',
  AQRABA = 'Aqraba',
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
      SyriaCity.KAFR_SOUSA,
      SyriaCity.JARAMANA,
      SyriaCity.MEZZEH,
      SyriaCity.AL_QADAM,
      SyriaCity.BARZEH,
      SyriaCity.QABOUN,
      SyriaCity.JOBAR,
      SyriaCity.RUKN_AL_DIN,
      SyriaCity.AL_MIDAN,
      SyriaCity.SAYYIDAH_ZAYNAB,
      SyriaCity.KAFR_BATNA,
      SyriaCity.SAQBA,
      SyriaCity.ARBIN,
      SyriaCity.ZAMALKA,
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
      SyriaCity.MARE,
      SyriaCity.AL_RAI,
      SyriaCity.ATARIB,
      SyriaCity.DARAT_IZZA,
      SyriaCity.NUBL,
      SyriaCity.AL_ZAHRAA,
      SyriaCity.TADIF,
      SyriaCity.AKHTARIN,
      SyriaCity.SURAN,
      SyriaCity.AL_HADHER,
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
      SyriaCity.TALBISAH,
      SyriaCity.AL_HOULA,
      SyriaCity.SADAD,
      SyriaCity.SHIN,
      SyriaCity.AL_MUKHARRAM_AL_FAWQANI,
      SyriaCity.HISYA,
      SyriaCity.AL_SUKHNAH,
      SyriaCity.HAWSH_HAJU,
      SyriaCity.ZAIDAL,
      SyriaCity.MAHEEN,
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
      SyriaCity.HALFAYA,
      SyriaCity.TREMSEH,
      SyriaCity.LATAMNA,
      SyriaCity.MOREK,
      SyriaCity.SHAYZAR,
      SyriaCity.JUBB_RAMLAH,
      SyriaCity.QALAAT_AL_MADIQ,
      SyriaCity.AL_SUQAYLABIYAH,
      SyriaCity.KHATTAB,
      SyriaCity.AL_ZIYARAH,
    ],
    [SyriaGovernorate.LATAKIA]: [
      SyriaCity.LATAKIA,
      SyriaCity.JABLEH,
      SyriaCity.AL_HAFFA,
      SyriaCity.QARDAHA,
      SyriaCity.KASAB,
      SyriaCity.SALMA,
      SyriaCity.BEIT_YASHOUT,
      SyriaCity.AIN_AL_BAYDA,
      SyriaCity.BASIT,
      SyriaCity.BURJ_ISLAM,
      SyriaCity.RABIA,
      SyriaCity.KINSABBA,
      SyriaCity.SLINFAH,
      SyriaCity.DUWAYRKAH,
      SyriaCity.HARF_AL_MUSAYTIRAH,
      SyriaCity.AL_SAFSAFAH,
      SyriaCity.AL_FAKHURAH,
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
      SyriaCity.KAFRANBEL,
      SyriaCity.TAFTANAZ,
      SyriaCity.BINNISH,
      SyriaCity.SALQIN,
      SyriaCity.HAREM,
      SyriaCity.DARKUSH,
      SyriaCity.AL_DANA,
      SyriaCity.MAARAT_MISRIN,
      SyriaCity.KAFR_TAKHARIM,
      SyriaCity.TALMENES,
      SyriaCity.SARMADA,
    ],
    [SyriaGovernorate.AL_HASAKAH]: [
      SyriaCity.AL_HASAKAH,
      SyriaCity.QAMISHLI,
      SyriaCity.RAS_AL_AYN,
      SyriaCity.AL_MALIKIYAH,
      SyriaCity.AMUDA,
      SyriaCity.AL_SHADDADI,
      SyriaCity.TAL_TAMR,
      SyriaCity.AL_DARBASIYAH,
      SyriaCity.AL_QAHTANIYAH,
      SyriaCity.AL_MUABBADAH,
      SyriaCity.AL_YAARUBIYAH,
      SyriaCity.AL_JAWADIYAH,
      SyriaCity.TAL_BRAK,
      SyriaCity.AL_HAUL,
      SyriaCity.MARKADA,
      SyriaCity.AL_ARESHAH,
      SyriaCity.AL_SABAH,
    ],
    [SyriaGovernorate.DEIR_EZ_ZOR]: [
      SyriaCity.DEIR_EZ_ZOR,
      SyriaCity.AL_MAYADIN,
      SyriaCity.ABU_KAMAL,
      SyriaCity.HAJJIN,
      SyriaCity.AL_BUKAMAL,
      SyriaCity.AL_JALAA,
      SyriaCity.AL_ASHARA,
      SyriaCity.AL_QURIYAH,
      SyriaCity.KHASHAM,
      SyriaCity.MUHASAN,
      SyriaCity.THIBAN,
      SyriaCity.AL_SALIHIYAH,
      SyriaCity.MARAT,
      SyriaCity.AL_BUSAYRAH,
      SyriaCity.DHIBAN,
      SyriaCity.AL_JARTHI,
    ],
    [SyriaGovernorate.TARTUS]: [
      SyriaCity.TARTUS,
      SyriaCity.BANIYAS,
      SyriaCity.SAFITA,
      SyriaCity.SHEIKH_BADR,
      SyriaCity.DURAYKISH,
      SyriaCity.AL_HAMIDIYAH,
      SyriaCity.AL_QADMOUS,
      SyriaCity.AL_SAWDA,
      SyriaCity.MASHTA_AL_HELU,
      SyriaCity.KHIRBET_AL_FARAS,
      SyriaCity.AL_RAWDAH,
      SyriaCity.AL_SAFSAFAH,
      SyriaCity.BRUMMANEH,
      SyriaCity.KAFF_AL_JAA,
      SyriaCity.ARWAD,
      SyriaCity.AL_ANNAZAH,
      SyriaCity.MASYAF,
    ],
    [SyriaGovernorate.RAQQA]: [
      SyriaCity.RAQQA,
      SyriaCity.AL_THAWRAH,
      SyriaCity.TELL_ABYAD,
      SyriaCity.AIN_ISSA,
      SyriaCity.AL_KARAMA,
      SyriaCity.MANSURA,
      SyriaCity.SULUK,
      SyriaCity.TABQA,
      SyriaCity.AL_JURNEYYEH,
      SyriaCity.MAADAN,
      SyriaCity.SABKHA,
      SyriaCity.AL_KASRAH,
      SyriaCity.AL_MANSURAH,
      SyriaCity.RATLAH,
      SyriaCity.AL_ROMTHANA,
      SyriaCity.HAMRAT_NASIR,
    ],
    [SyriaGovernorate.DARAA]: [
      SyriaCity.DARAA,
      SyriaCity.NAWA,
      SyriaCity.IZRA,
      SyriaCity.BUSRA_AL_HARIR,
      SyriaCity.TAFAS,
      SyriaCity.JASSIM,
      SyriaCity.AL_HARA,
      SyriaCity.INKHIL,
      SyriaCity.JASIM,
      SyriaCity.DA_IL,
      SyriaCity.KHIRBET_GHAZALEH,
      SyriaCity.AL_SANAMAYN,
      SyriaCity.GHABAGHIB,
      SyriaCity.AL_SHAYKH_MASKIN,
      SyriaCity.TASIL,
      SyriaCity.MUZAYRIB,
      SyriaCity.SAHM_AL_JAWLAN,
    ],
    [SyriaGovernorate.AS_SUWAYDA]: [
      SyriaCity.AS_SUWAYDA,
      SyriaCity.SALKHAD,
      SyriaCity.SHAHBA,
      SyriaCity.AL_QURAYYA,
      SyriaCity.ARIQA,
      SyriaCity.DHIBIN,
      SyriaCity.SALIM,
      SyriaCity.IMTAN,
      SyriaCity.ATIL,
      SyriaCity.QANAWAT,
      SyriaCity.MELH,
      SyriaCity.AL_KAFR,
      SyriaCity.AL_MUHAJAH,
      SyriaCity.SUR,
      SyriaCity.AL_MASMIYAH,
      SyriaCity.AL_MAZRAA,
    ],
    [SyriaGovernorate.QUNEITRA]: [
      SyriaCity.QUNEITRA,
      SyriaCity.MADINAT_AL_BAATH,
      SyriaCity.KHAN_ARNABA,
      SyriaCity.BAQATHA,
      SyriaCity.HADAR,
      SyriaCity.AIN_AL_TINEH,
      SyriaCity.JUBATA_AL_KHASHAB,
      SyriaCity.JABA,
      SyriaCity.BIR_AJAM,
      SyriaCity.TARANJAH,
      SyriaCity.NABA_AL_SAKHIR,
      SyriaCity.AL_HAMIDIYAH,
      SyriaCity.RAWADI,
      SyriaCity.BARIQA,
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
      SyriaCity.AL_QUTAYFAH,
      SyriaCity.MADAYA,
      SyriaCity.SERGHAYA,
      SyriaCity.RANKOUS,
      SyriaCity.SAIDNAYA,
      SyriaCity.MAALOULA,
      SyriaCity.DEIR_ATIYAH,
      SyriaCity.AL_RUHAYBAH,
      SyriaCity.AL_DUMAYR,
      SyriaCity.AQRABA,
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
  [SyriaCity.BARZEH]: 'برزة',
  [SyriaCity.QABOUN]: 'قابون',
  [SyriaCity.JOBAR]: 'جوبر',
  [SyriaCity.RUKN_AL_DIN]: 'ركن الدين',
  [SyriaCity.AL_MIDAN]: 'الميدان',
  [SyriaCity.SAYYIDAH_ZAYNAB]: 'السيدة زينب',
  [SyriaCity.KAFR_BATNA]: 'كفر بطنا',
  [SyriaCity.SAQBA]: 'سقبا',
  [SyriaCity.ARBIN]: 'عربين',
  [SyriaCity.ZAMALKA]: 'زملكا',

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
  [SyriaCity.MARE]: 'مارع',
  [SyriaCity.AL_RAI]: 'الراعي',
  [SyriaCity.ATARIB]: 'الأتارب',
  [SyriaCity.DARAT_IZZA]: 'دارة عزة',
  [SyriaCity.NUBL]: 'نبل',
  [SyriaCity.AL_ZAHRAA]: 'الزهراء',
  [SyriaCity.TADIF]: 'تادف',
  [SyriaCity.AKHTARIN]: 'اختارين',
  [SyriaCity.SURAN]: 'صوران',
  [SyriaCity.AL_HADHER]: 'الحاضر',

  // Homs cities
  [SyriaCity.HOMS]: 'حمص',
  [SyriaCity.PALMYRA]: 'تدمر',
  [SyriaCity.AL_RASTAN]: 'الرستن',
  [SyriaCity.TALKALAKH]: 'تلكلخ',
  [SyriaCity.AL_QUSAYR]: 'القصير',
  [SyriaCity.TADMOR]: 'تدمر',
  [SyriaCity.AL_MUKHRAM]: 'المخرم',
  [SyriaCity.AL_QARYATAYN]: 'القريتين',
  [SyriaCity.TALBISAH]: 'تلبيسة',
  [SyriaCity.AL_HOULA]: 'الحولة',
  [SyriaCity.SADAD]: 'صدد',
  [SyriaCity.SHIN]: 'شين',
  [SyriaCity.AL_MUKHARRAM_AL_FAWQANI]: 'المخرم الفوقاني',
  [SyriaCity.HISYA]: 'حسياء',
  [SyriaCity.AL_SUKHNAH]: 'السخنة',
  [SyriaCity.HAWSH_HAJU]: 'حوش حجو',
  [SyriaCity.ZAIDAL]: 'زيدل',
  [SyriaCity.MAHEEN]: 'مهين',

  // Hama cities
  [SyriaCity.HAMA]: 'حماة',
  [SyriaCity.SALAMIYAH]: 'سلمية',
  [SyriaCity.MASYAF]: 'مصياف',
  [SyriaCity.SUQAYLABIYAH]: 'السقيلبية',
  [SyriaCity.MUHARDA]: 'محردة',
  [SyriaCity.KAFR_NABUDA]: 'كفر نبودة',
  [SyriaCity.KAFR_ZITA]: 'كفر زيتا',
  [SyriaCity.TAYBAT_AL_IMAM]: 'طيبة الإمام',
  [SyriaCity.HALFAYA]: 'حلفايا',
  [SyriaCity.TREMSEH]: 'الترمسة',
  [SyriaCity.LATAMNA]: 'اللطامنة',
  [SyriaCity.MOREK]: 'مورك',
  [SyriaCity.SHAYZAR]: 'شيزر',
  [SyriaCity.JUBB_RAMLAH]: 'جب رملة',
  [SyriaCity.QALAAT_AL_MADIQ]: 'قلعة المضيق',
  [SyriaCity.AL_SUQAYLABIYAH]: 'السقيلبية',
  [SyriaCity.KHATTAB]: 'خطاب',
  [SyriaCity.AL_ZIYARAH]: 'الزيارة',

  // Latakia cities
  [SyriaCity.LATAKIA]: 'اللاذقية',
  [SyriaCity.JABLEH]: 'جبلة',
  [SyriaCity.AL_HAFFA]: 'الحفة',
  [SyriaCity.QARDAHA]: 'القرداحة',
  [SyriaCity.KASAB]: 'كسب',
  [SyriaCity.SALMA]: 'صلنفة',
  [SyriaCity.BEIT_YASHOUT]: 'بيت ياشوط',
  [SyriaCity.AIN_AL_BAYDA]: 'عين البيضاء',
  [SyriaCity.BASIT]: 'باسيط',
  [SyriaCity.BURJ_ISLAM]: 'برج الإسلام',
  [SyriaCity.RABIA]: 'الربيعة',
  [SyriaCity.KINSABBA]: 'كنسبا',
  [SyriaCity.SLINFAH]: 'صلنفة',
  [SyriaCity.DUWAYRKAH]: 'دويركة',
  [SyriaCity.HARF_AL_MUSAYTIRAH]: 'حرف المسيترة',
  [SyriaCity.AL_SAFSAFAH]: 'الصفصافة',
  [SyriaCity.AL_FAKHURAH]: 'الفاخورة',

  // Idlib cities
  [SyriaCity.IDLIB]: 'إدلب',
  [SyriaCity.MAARRAT_AL_NUMAN]: 'معرة النعمان',
  [SyriaCity.ARIHA]: 'أريحا',
  [SyriaCity.JISR_AL_SHUGHUR]: 'جسر الشغور',
  [SyriaCity.SARAQEB]: 'سراقب',
  [SyriaCity.KHAN_SHAYKHUN]: 'خان شيخون',
  [SyriaCity.BANSH]: 'بنش',
  [SyriaCity.JABAL_AL_ZAWIYA]: 'جبل الزاوية',
  [SyriaCity.KAFRANBEL]: 'كفرنبل',
  [SyriaCity.TAFTANAZ]: 'تفتناز',
  [SyriaCity.BINNISH]: 'بنش',
  [SyriaCity.SALQIN]: 'سلقين',
  [SyriaCity.HAREM]: 'حارم',
  [SyriaCity.DARKUSH]: 'دركوش',
  [SyriaCity.AL_DANA]: 'الدانا',
  [SyriaCity.MAARAT_MISRIN]: 'معرة مصرين',
  [SyriaCity.KAFR_TAKHARIM]: 'كفر تخاريم',
  [SyriaCity.TALMENES]: 'تلمنس',
  [SyriaCity.SARMADA]: 'سرمدا',

  // Al-Hasakah cities
  [SyriaCity.AL_HASAKAH]: 'الحسكة',
  [SyriaCity.QAMISHLI]: 'القامشلي',
  [SyriaCity.RAS_AL_AYN]: 'رأس العين',
  [SyriaCity.AL_MALIKIYAH]: 'المالكية',
  [SyriaCity.AMUDA]: 'عامودا',
  [SyriaCity.AL_SHADDADI]: 'الشدادي',
  [SyriaCity.TAL_TAMR]: 'تل تمر',
  [SyriaCity.AL_DARBASIYAH]: 'الدرباسية',
  [SyriaCity.AL_QAHTANIYAH]: 'القحطانية',
  [SyriaCity.AL_MUABBADAH]: 'المعبدة',
  [SyriaCity.AL_YAARUBIYAH]: 'اليعربية',
  [SyriaCity.AL_JAWADIYAH]: 'الجواديه',
  [SyriaCity.TAL_BRAK]: 'تل براك',
  [SyriaCity.AL_HAUL]: 'الهول',
  [SyriaCity.MARKADA]: 'مركدة',
  [SyriaCity.AL_ARESHAH]: 'العريشة',
  [SyriaCity.AL_SABAH]: 'الصباح',

  // Deir ez-Zor cities
  [SyriaCity.DEIR_EZ_ZOR]: 'دير الزور',
  [SyriaCity.AL_MAYADIN]: 'الميادين',
  [SyriaCity.ABU_KAMAL]: 'أبو كمال',
  [SyriaCity.HAJJIN]: 'هجين',
  [SyriaCity.AL_BUKAMAL]: 'البوكمال',
  [SyriaCity.AL_JALAA]: 'الجلاء',
  [SyriaCity.AL_ASHARA]: 'العشارة',
  [SyriaCity.AL_QURIYAH]: 'القورية',
  [SyriaCity.KHASHAM]: 'خشام',
  [SyriaCity.MUHASAN]: 'محسن',
  [SyriaCity.THIBAN]: 'ذيبان',
  [SyriaCity.AL_SALIHIYAH]: 'الصالحية',
  [SyriaCity.MARAT]: 'مراط',
  [SyriaCity.AL_BUSAYRAH]: 'البصيرة',
  [SyriaCity.DHIBAN]: 'ذيبان',
  [SyriaCity.AL_JARTHI]: 'الجرثي',

  // Tartus cities
  [SyriaCity.TARTUS]: 'طرطوس',
  [SyriaCity.BANIYAS]: 'بانياس',
  [SyriaCity.SAFITA]: 'صافيتا',
  [SyriaCity.SHEIKH_BADR]: 'الشيخ بدر',
  [SyriaCity.DURAYKISH]: 'درويكيش',
  [SyriaCity.AL_HAMIDIYAH]: 'الحميدية',
  [SyriaCity.AL_QADMOUS]: 'القدموس',
  [SyriaCity.AL_SAWDA]: 'السودا',
  [SyriaCity.MASHTA_AL_HELU]: 'مشتى الحلو',
  [SyriaCity.KHIRBET_AL_FARAS]: 'خربة الفرس',
  [SyriaCity.AL_RAWDAH]: 'الروضة',
  [SyriaCity.BRUMMANEH]: 'برمانة',
  [SyriaCity.KAFF_AL_JAA]: 'كف الجاع',
  [SyriaCity.ARWAD]: 'أرواد',
  [SyriaCity.AL_ANNAZAH]: 'النزاحة',

  // Raqqa cities
  [SyriaCity.RAQQA]: 'الرقة',
  [SyriaCity.AL_THAWRAH]: 'الثورة',
  [SyriaCity.TELL_ABYAD]: 'تل أبيض',
  [SyriaCity.AIN_ISSA]: 'عين عيسى',
  [SyriaCity.AL_KARAMA]: 'الكرامة',
  [SyriaCity.MANSURA]: 'منصورة',
  [SyriaCity.SULUK]: 'سلوك',
  [SyriaCity.TABQA]: 'الطبقة',
  [SyriaCity.AL_JURNEYYEH]: 'الجرنية',
  [SyriaCity.MAADAN]: 'معدان',
  [SyriaCity.SABKHA]: 'سبخة',
  [SyriaCity.AL_KASRAH]: 'الكسرة',
  [SyriaCity.AL_MANSURAH]: 'المنصورة',
  [SyriaCity.RATLAH]: 'رتلة',
  [SyriaCity.AL_ROMTHANA]: 'الرمثانة',
  [SyriaCity.HAMRAT_NASIR]: 'حمرات ناصر',

  // Daraa cities
  [SyriaCity.DARAA]: 'درعا',
  [SyriaCity.NAWA]: 'نوى',
  [SyriaCity.IZRA]: 'إزرع',
  [SyriaCity.BUSRA_AL_HARIR]: 'بصرى الحرير',
  [SyriaCity.TAFAS]: 'طفس',
  [SyriaCity.JASSIM]: 'جاسم',
  [SyriaCity.AL_HARA]: 'الحارة',
  [SyriaCity.INKHIL]: 'إنخل',
  [SyriaCity.JASIM]: 'جاسم',
  [SyriaCity.DA_IL]: 'داعل',
  [SyriaCity.KHIRBET_GHAZALEH]: 'خربة غزالة',
  [SyriaCity.AL_SANAMAYN]: 'الصنمين',
  [SyriaCity.GHABAGHIB]: 'غباغب',
  [SyriaCity.AL_SHAYKH_MASKIN]: 'الشيخ مسكين',
  [SyriaCity.TASIL]: 'طاسيل',
  [SyriaCity.MUZAYRIB]: 'المزيريب',
  [SyriaCity.SAHM_AL_JAWLAN]: 'سحم الجولان',

  // As-Suwayda cities
  [SyriaCity.AS_SUWAYDA]: 'السويداء',
  [SyriaCity.SALKHAD]: 'صلخد',
  [SyriaCity.SHAHBA]: 'شهبا',
  [SyriaCity.AL_QURAYYA]: 'القريا',
  [SyriaCity.ARIQA]: 'عريقة',
  [SyriaCity.DHIBIN]: 'ذيبين',
  [SyriaCity.SALIM]: 'سليم',
  [SyriaCity.IMTAN]: 'عمتان',
  [SyriaCity.ATIL]: 'عاتيل',
  [SyriaCity.QANAWAT]: 'قنوات',
  [SyriaCity.MELH]: 'ملح',
  [SyriaCity.AL_KAFR]: 'الكفر',
  [SyriaCity.AL_MUHAJAH]: 'المحجة',
  [SyriaCity.SUR]: 'صور',
  [SyriaCity.AL_MASMIYAH]: 'المسمية',
  [SyriaCity.AL_MAZRAA]: 'المزرعة',

  // Quneitra cities
  [SyriaCity.QUNEITRA]: 'القنيطرة',
  [SyriaCity.MADINAT_AL_BAATH]: 'مدينة البعث',
  [SyriaCity.KHAN_ARNABA]: 'خان أرنبة',
  [SyriaCity.BAQATHA]: 'بقعاثا',
  [SyriaCity.HADAR]: 'حضر',
  [SyriaCity.AIN_AL_TINEH]: 'عين التينة',
  [SyriaCity.JUBATA_AL_KHASHAB]: 'جباتا الخشب',
  [SyriaCity.JABA]: 'جبا',
  [SyriaCity.BIR_AJAM]: 'بئر عجم',
  [SyriaCity.TARANJAH]: 'طرنجة',
  [SyriaCity.NABA_AL_SAKHIR]: 'نبع الصخر',
  [SyriaCity.RAWADI]: 'روضي',
  [SyriaCity.BARIQA]: 'بريقة',

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
  [SyriaCity.AL_QUTAYFAH]: 'القطيفة',
  [SyriaCity.MADAYA]: 'مضايا',
  [SyriaCity.SERGHAYA]: 'سرغايا',
  [SyriaCity.RANKOUS]: 'رنكوس',
  [SyriaCity.SAIDNAYA]: 'صيدنايا',
  [SyriaCity.MAALOULA]: 'معلولا',
  [SyriaCity.DEIR_ATIYAH]: 'دير عطية',
  [SyriaCity.AL_RUHAYBAH]: 'الرحيبة',
  [SyriaCity.AL_DUMAYR]: 'الضمير',
  [SyriaCity.AQRABA]: 'عقربا',
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
  useArabic: boolean = false,
) => {
  return SyriaGovernorate_TO_CITIES[SyriaGovernorate].map((city) => ({
    value: city,
    label: useArabic ? SyriaCity_ARABIC_NAMES[city] : city.replace(/-/g, ' '),
  }));
};

/**
 * Cleans and standardizes Arabic text for lenient matching
 */
export function cleanArabic(text: string): string {
  if (!text) return '';
  return String(text)
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F\u0670]/g, '') // Remove tashkeel/diacritics
    .replace(/[-_\s']+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Normalizes any governorate representation (key, value, lowercase, Arabic, object)
 * to standard SyriaGovernorate enum value
 */
export function normalizeGovernorate(raw: any): string {
  if (!raw && raw !== 0) return '';
  if (typeof raw === 'object') {
    raw =
      raw.name ||
      raw.label ||
      raw.value ||
      raw.ar ||
      raw.en ||
      raw.title ||
      (typeof raw.name === 'object' ? raw.name.ar || raw.name.en : '') ||
      (typeof raw.nameTranslations === 'object' ? raw.nameTranslations.ar || raw.nameTranslations.en : '') ||
      Object.values(raw).find((v) => typeof v === 'string' && v.trim()) ||
      '';
  }
  const str = String(raw).trim();
  if (!str) return '';

  // 1. Direct match with enum values (case-insensitive & hyphen-lenient)
  const lowerStr = str.toLowerCase();
  const cleanStr = lowerStr.replace(/[-\s_]+/g, ' ');
  for (const val of Object.values(SyriaGovernorate)) {
    if (
      val.toLowerCase() === lowerStr ||
      val.replace(/[-\s_]+/g, ' ').toLowerCase() === cleanStr
    ) {
      return val;
    }
  }

  // 2. Match with enum keys (e.g. DAMASCUS_COUNTRYSIDE, AL_HASAKAH)
  const normKey = str.toUpperCase().replace(/[-\s]+/g, '_');
  for (const [k, val] of Object.entries(SyriaGovernorate)) {
    if (k.toUpperCase() === normKey) {
      return val;
    }
  }

  // 3. Match with Arabic names using cleanArabic
  const cleanedInput = cleanArabic(str);

  // 3a. Exact match on cleaned Arabic names
  for (const [val, arName] of Object.entries(SyriaGovernorate_ARABIC_NAMES)) {
    if (cleanArabic(arName) === cleanedInput) {
      return val;
    }
  }

  // 3b. Match with spaces stripped (e.g. "ديرالزور" vs "دير الزور", "ريفدمشق" vs "ريف دمشق")
  const noSpaceInput = cleanedInput.replace(/\s+/g, '');
  for (const [val, arName] of Object.entries(SyriaGovernorate_ARABIC_NAMES)) {
    if (cleanArabic(arName).replace(/\s+/g, '') === noSpaceInput) {
      return val;
    }
  }

  // 3c. Substring matching (sorted by length descending so longer Arabic names match first, e.g. "ريف دمشق" before "دمشق")
  const sortedArabic = Object.entries(SyriaGovernorate_ARABIC_NAMES).sort(
    (a, b) => b[1].length - a[1].length,
  );
  for (const [val, arName] of sortedArabic) {
    const cleanAr = cleanArabic(arName);
    if (cleanedInput.includes(cleanAr) || cleanAr.includes(cleanedInput)) {
      return val;
    }
  }

  return str;
}

/**
 * Normalizes any city representation (key, value, lowercase, Arabic, object)
 * to standard SyriaCity enum value
 */
export function normalizeCity(raw: any, _gov?: string): string {
  if (!raw && raw !== 0) return '';
  if (typeof raw === 'object') {
    raw =
      raw.name ||
      raw.label ||
      raw.value ||
      raw.ar ||
      raw.en ||
      raw.title ||
      (typeof raw.name === 'object' ? raw.name.ar || raw.name.en : '') ||
      (typeof raw.nameTranslations === 'object' ? raw.nameTranslations.ar || raw.nameTranslations.en : '') ||
      Object.values(raw).find((v) => typeof v === 'string' && v.trim()) ||
      '';
  }
  const str = String(raw).trim();
  if (!str) return '';

  // 1. Direct match with enum values
  const lowerStr = str.toLowerCase();
  const cleanStr = lowerStr.replace(/[-_\s']+/g, ' ');
  for (const val of Object.values(SyriaCity)) {
    if (
      val.toLowerCase() === lowerStr ||
      val.replace(/[-_\s']+/g, ' ').toLowerCase() === cleanStr
    ) {
      return val;
    }
  }

  // 2. Match with enum keys
  const normKey = str.toUpperCase().replace(/[-\s']+/g, '_');
  for (const [k, val] of Object.entries(SyriaCity)) {
    if (k.toUpperCase() === normKey) {
      return val;
    }
  }

  // 3. Match with Arabic names using cleanArabic
  const cleanedInput = cleanArabic(str);

  // 3a. Exact match on cleaned Arabic names
  for (const [val, arName] of Object.entries(SyriaCity_ARABIC_NAMES)) {
    if (cleanArabic(arName) === cleanedInput) {
      return val;
    }
  }

  // 3b. Match with spaces stripped
  const noSpaceInput = cleanedInput.replace(/\s+/g, '');
  for (const [val, arName] of Object.entries(SyriaCity_ARABIC_NAMES)) {
    if (cleanArabic(arName).replace(/\s+/g, '') === noSpaceInput) {
      return val;
    }
  }

  // 3c. Substring match (sorted by length descending)
  const sortedCities = Object.entries(SyriaCity_ARABIC_NAMES).sort(
    (a, b) => b[1].length - a[1].length,
  );
  for (const [val, arName] of sortedCities) {
    const cleanAr = cleanArabic(arName);
    if (cleanedInput.includes(cleanAr) || cleanAr.includes(cleanedInput)) {
      return val;
    }
  }

  return str;
}

/**
 * Normalizes address string from string or bilingual object
 */
export function normalizeAddress(raw: any): string {
  if (!raw && raw !== 0) return '';
  if (typeof raw === 'string') return raw.trim();
  if (typeof raw === 'object') {
    const val =
      raw.address ||
      raw.detailedAddress ||
      raw.ar ||
      raw.en ||
      raw.title ||
      raw.name ||
      Object.values(raw).find((v) => typeof v === 'string' && v.trim()) ||
      '';
    return typeof val === 'string' ? val.trim() : String(val).trim();
  }
  return String(raw).trim();
}


