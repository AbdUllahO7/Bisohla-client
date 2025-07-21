// components/dashboard/QuickActions.tsx
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Car, Settings, Star } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useDirection } from '@/hooks/use-direction';

export function QuickActions() {
  const direction = useDirection();

  const actions = [
    {
      href: '/products/AddProducts',
      icon: Car,
      title: direction === 'ltr' ? 'Add New Car' : 'إضافة سيارة جديدة',
      description:
        direction === 'ltr'
          ? 'List a new car for sale or rent'
          : 'أدرج سيارة جديدة للبيع أو الإيجار',
      color: 'text-primary',
    },
    {
      href: '/userProfile/UserInfo',
      icon: Settings,
      title: direction === 'ltr' ? 'Profile Settings' : 'إعدادات الملف الشخصي',
      description:
        direction === 'ltr'
          ? 'Update your profile information'
          : 'تحديث معلومات ملفك الشخصي',
      color: 'text-primary',
    },
    {
      href: '/userProfile/Favorites',
      icon: Star,
      title: direction === 'ltr' ? 'View Favorites' : 'عرض المفضلة',
      description:
        direction === 'ltr'
          ? 'Check your saved car listings'
          : 'تحقق من قوائم السيارات المحفوظة',
      color: 'text-primary',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {direction === 'ltr' ? 'Quick Actions' : 'إجراءات سريعة'}
        </CardTitle>
        <CardDescription>
          {direction === 'ltr'
            ? 'Manage your listings and profile'
            : 'إدارة قوائمك وملفك الشخصي'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {actions.map((action, index) => (
            <Link key={index} href={action.href}>
              <Card className="cursor-pointer hover:shadow-md transition-all duration-200 border-primary/20 hover:border-primary/40 hover:scale-105">
                <CardContent className="p-4 text-center">
                  <action.icon
                    className={`h-8 w-8 ${action.color} mx-auto mb-3`}
                  />
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {action.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
