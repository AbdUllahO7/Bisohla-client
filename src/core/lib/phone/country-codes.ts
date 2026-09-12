export interface CountryCodeItem {
  iso: string;
  name: string;
  nameAr: string;
  dial: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCodeItem[] = [
  // Priority countries (Middle East & Region)
  { iso: 'SY', name: 'Syria', nameAr: 'سوريا', dial: '+963', flag: '🇸🇾' },
  { iso: 'SA', name: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', dial: '+966', flag: '🇸🇦' },
  { iso: 'AE', name: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', dial: '+971', flag: '🇦🇪' },
  { iso: 'EG', name: 'Egypt', nameAr: 'مصر', dial: '+20', flag: '🇪🇬' },
  { iso: 'JO', name: 'Jordan', nameAr: 'الأردن', dial: '+962', flag: '🇯🇴' },
  { iso: 'LB', name: 'Lebanon', nameAr: 'لبنان', dial: '+961', flag: '🇱🇧' },
  { iso: 'IQ', name: 'Iraq', nameAr: 'العراق', dial: '+964', flag: '🇮🇶' },
  { iso: 'KW', name: 'Kuwait', nameAr: 'الكويت', dial: '+965', flag: '🇰🇼' },
  { iso: 'QA', name: 'Qatar', nameAr: 'قطر', dial: '+974', flag: '🇶🇦' },
  { iso: 'OM', name: 'Oman', nameAr: 'عمان', dial: '+968', flag: '🇴🇲' },
  { iso: 'BH', name: 'Bahrain', nameAr: 'البحرين', dial: '+973', flag: '🇧🇭' },
  { iso: 'YE', name: 'Yemen', nameAr: 'اليمن', dial: '+967', flag: '🇾🇪' },
  { iso: 'PS', name: 'Palestine', nameAr: 'فلسطين', dial: '+970', flag: '🇵🇸' },
  { iso: 'TR', name: 'Turkey', nameAr: 'تركيا', dial: '+90', flag: '🇹🇷' },
  { iso: 'SD', name: 'Sudan', nameAr: 'السودان', dial: '+249', flag: '🇸🇩' },
  { iso: 'LY', name: 'Libya', nameAr: 'ليبيا', dial: '+218', flag: '🇱🇾' },
  { iso: 'TN', name: 'Tunisia', nameAr: 'تونس', dial: '+216', flag: '🇹🇳' },
  { iso: 'DZ', name: 'Algeria', nameAr: 'الجزائر', dial: '+213', flag: '🇩🇿' },
  { iso: 'MA', name: 'Morocco', nameAr: 'المغرب', dial: '+212', flag: '🇲🇦' },

  // Global major countries
  { iso: 'US', name: 'United States', nameAr: 'الولايات المتحدة', dial: '+1', flag: '🇺🇸' },
  { iso: 'CA', name: 'Canada', nameAr: 'كندا', dial: '+1', flag: '🇨🇦' },
  { iso: 'GB', name: 'United Kingdom', nameAr: 'المملكة المتحدة', dial: '+44', flag: '🇬🇧' },
  { iso: 'DE', name: 'Germany', nameAr: 'ألمانيا', dial: '+49', flag: '🇩🇪' },
  { iso: 'FR', name: 'France', nameAr: 'فرنسا', dial: '+33', flag: '🇫🇷' },
  { iso: 'IT', name: 'Italy', nameAr: 'إيطاليا', dial: '+39', flag: '🇮🇹' },
  { iso: 'ES', name: 'Spain', nameAr: 'إسبانيا', dial: '+34', flag: '🇪🇸' },
  { iso: 'NL', name: 'Netherlands', nameAr: 'هولندا', dial: '+31', flag: '🇳🇱' },
  { iso: 'SE', name: 'Sweden', nameAr: 'السويد', dial: '+46', flag: '🇸🇪' },
  { iso: 'RU', name: 'Russia', nameAr: 'روسيا', dial: '+7', flag: '🇷🇺' },
  { iso: 'CN', name: 'China', nameAr: 'الصين', dial: '+86', flag: '🇨🇳' },
  { iso: 'IN', name: 'India', nameAr: 'الهند', dial: '+91', flag: '🇮🇳' },
  { iso: 'PK', name: 'Pakistan', nameAr: 'باكستان', dial: '+92', flag: '🇵🇰' },
  { iso: 'AU', name: 'Australia', nameAr: 'أستراليا', dial: '+61', flag: '🇦🇺' },
  { iso: 'BR', name: 'Brazil', nameAr: 'البرازيل', dial: '+55', flag: '🇧🇷' },
  { iso: 'MY', name: 'Malaysia', nameAr: 'ماليزيا', dial: '+60', flag: '🇲🇾' },
  { iso: 'ID', name: 'Indonesia', nameAr: 'إندونيسيا', dial: '+62', flag: '🇮🇩' },
  { iso: 'IR', name: 'Iran', nameAr: 'إيران', dial: '+98', flag: '🇮🇷' },
  { iso: 'BE', name: 'Belgium', nameAr: 'بلجيكا', dial: '+32', flag: '🇧🇪' },
  { iso: 'CH', name: 'Switzerland', nameAr: 'سويسرا', dial: '+41', flag: '🇨🇭' },
  { iso: 'AT', name: 'Austria', nameAr: 'النمسا', dial: '+43', flag: '🇦🇹' },
  { iso: 'NO', name: 'Norway', nameAr: 'النرويج', dial: '+47', flag: '🇳🇴' },
  { iso: 'DK', name: 'Denmark', nameAr: 'الدنمارك', dial: '+45', flag: '🇩🇰' },
  { iso: 'FI', name: 'Finland', nameAr: 'فنلندا', dial: '+358', flag: '🇫🇮' },
  { iso: 'PL', name: 'Poland', nameAr: 'بولندا', dial: '+48', flag: '🇵🇱' },
  { iso: 'GR', name: 'Greece', nameAr: 'اليونان', dial: '+30', flag: '🇬🇷' },
  { iso: 'RO', name: 'Romania', nameAr: 'رومانيا', dial: '+40', flag: '🇷🇴' },
  { iso: 'CY', name: 'Cyprus', nameAr: 'قبرص', dial: '+357', flag: '🇨🇾' },
];
