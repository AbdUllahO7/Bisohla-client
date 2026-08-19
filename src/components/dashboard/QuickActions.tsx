// components/dashboard/QuickActions.tsx
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, BarChart3, ListOrdered, Heart, BellRing, Settings } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useDirection } from '@/hooks/use-direction';

export function QuickActions() {
  const direction = useDirection();

  const actions = [
    {
      href: '/products/AddProducts',
      icon: PlusCircle,
      title: direction === 'ltr' ? 'Add New Listing' : 'إضافة إعلان جديد',
      description:
        direction === 'ltr'
          ? 'List a vehicle, real estate, or product'
          : 'أدرج إعلان جديد للبيع أو الإيجار بسهولة',
      color: 'text-[#198341]',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    {
      href: '/userProfile/Statistics',
      icon: BarChart3,
      title: direction === 'ltr' ? 'My Statistics' : 'إحصائياتي والنمو',
      description:
        direction === 'ltr'
          ? 'Views, contact rate, and analytics'
          : 'المشاهدات، التواصل، ورسوم النمو البيانية',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      href: '/userProfile/Products',
      icon: ListOrdered,
      title: direction === 'ltr' ? 'Manage Listings' : 'إدارة إعلاناتي',
      description:
        direction === 'ltr'
          ? 'Edit, publish, map visibility, and delete'
          : 'تعديل، نشر، التحكم بالظهور على الخريطة',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    },
    {
      href: '/userProfile/Alerts',
      icon: BellRing,
      title: direction === 'ltr' ? 'Custom Alerts' : 'تنبيهاتي الذكية',
      description:
        direction === 'ltr'
          ? 'Notifications for matching criteria'
          : 'إشعارات عند توفر إعلانات تناسب طلبك',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    },
    {
      href: '/userProfile/Favorites',
      icon: Heart,
      title: direction === 'ltr' ? 'Wishlist & Saved' : 'الإعلانات المفضلة',
      description:
        direction === 'ltr'
          ? 'Your saved items and shortcuts'
          : 'الإعلانات والسيارات المحفوظة لديك',
      color: 'text-rose-600 dark:text-rose-400',
      bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    },
    {
      href: '/userProfile/UserInfo',
      icon: Settings,
      title: direction === 'ltr' ? 'Settings & Profile' : 'الملف والإعدادات',
      description:
        direction === 'ltr'
          ? 'Theme, language, and account security'
          : 'المظهر، اللغة، وأمان الحساب',
      color: 'text-gray-700 dark:text-zinc-300',
      bgColor: 'bg-gray-100 dark:bg-zinc-800',
    },
  ];

  return (
    <Card className="border-gray-100 dark:border-zinc-800 shadow-sm rounded-3xl">
      <CardHeader>
        <CardTitle className="text-lg font-extrabold text-[#2C3C39] dark:text-zinc-100">
          {direction === 'ltr' ? 'Quick Access & Management' : 'إجراءات سريعة وإدارة الحساب'}
        </CardTitle>
        <CardDescription className="text-xs text-gray-500">
          {direction === 'ltr'
            ? 'Fast shortcuts to manage your listings, statistics, and preferences'
            : 'روابط مباشرة لإدارة إعلاناتك، إحصائياتك، وتفضيلاتك'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <div className="h-full p-4 rounded-2xl border border-gray-100 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/60 hover:border-[#198341]/40 hover:shadow-md transition-all duration-200 group flex items-start gap-3.5">
                <div
                  className={`p-2.5 rounded-xl ${action.bgColor} ${action.color} shrink-0 group-hover:scale-110 transition-transform`}
                >
                  <action.icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2C3C39] dark:text-zinc-100 group-hover:text-[#198341] transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
