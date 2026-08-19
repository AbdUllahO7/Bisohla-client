export interface TourStep {
  targetKey: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
  placement?: 'top' | 'bottom' | 'auto';
}

export interface TourDefinition {
  id: string;
  version: string;
  steps: TourStep[];
}

export const TOURS: Record<string, TourDefinition> = {
  home_tour: {
    id: 'home_tour',
    version: '1.0',
    steps: [
      {
        targetKey: 'home_search',
        titleAr: 'محرك البحث الذكي',
        titleEn: 'Smart Search',
        descAr: 'ابحث عن السيّارات والعقارات والخدمات بسهولة عبر سوريا مع فلاتر متقدمة.',
        descEn: 'Search for vehicles, real estate, and listings across Syria with advanced filters.',
        placement: 'bottom',
      },
      {
        targetKey: 'home_categories',
        titleAr: 'الأقسام والتصنيفات',
        titleEn: 'Categories',
        descAr: 'استعرض الإعلانات حسب النوع: سيّارات، عقارات، قطع تبديل، والمزيد.',
        descEn: 'Explore listings by category: cars, properties, spare parts, and more.',
        placement: 'bottom',
      },
      {
        targetKey: 'home_map_btn',
        titleAr: 'الخريطة التفاعلية',
        titleEn: 'Interactive Map',
        descAr: 'استكشف الإعلانات على الخريطة المباشرة واكتشف العروض القريبة منك.',
        descEn: 'Explore listings on the live interactive map and discover deals near you.',
        placement: 'bottom',
      },
    ],
  },
  profile_tour: {
    id: 'profile_tour',
    version: '1.0',
    steps: [
      {
        targetKey: 'profile_stats',
        titleAr: 'إحصائيات إعلاناتك',
        titleEn: 'Your Statistics',
        descAr: 'تابع عدد المشاهدات، التواصل، ومعدل نمو إعلاناتك عبر رسوم بيانية تفاعلية.',
        descEn: 'Track your listing views, contacts, and performance through interactive charts.',
        placement: 'bottom',
      },
      {
        targetKey: 'profile_alerts',
        titleAr: 'تنبيهات مخصصة',
        titleEn: 'Custom Alerts',
        descAr: 'أنشئ تنبيهات لتصلك إشعارات فورية عند توفر سيّارات مطابقة لمواصفاتك.',
        descEn: 'Set up custom alerts to receive instant notifications when matching items are listed.',
        placement: 'bottom',
      },
      {
        targetKey: 'profile_settings',
        titleAr: 'إعدادات الحساب والمظهر',
        titleEn: 'Settings & Appearance',
        descAr: 'خصّص لغة التطبيق، المظهر (الداكن/الفاتح)، وخيارات حسابك.',
        descEn: 'Customize language, theme (Dark/Light mode), and manage your account.',
        placement: 'bottom',
      },
    ],
  },
};
