'use client';

import { useState, useEffect } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import SmartBreadcrumb from '@/components/smart-breadcrumbs';
import { useCarAlerts } from '@/core/infrastructure-adapters/use-actions/users/car-alert.user.use-actions';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { useRouter } from '@/i18n/routing';
import { CarAlertItem } from '@/components/web/CarAlerts/CarAlertItem';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useDirection } from '@/hooks/use-direction';

const AlertsPage = () => {
    const t = useTranslations('carAlerts');
    const router = useRouter();
    const direction = useDirection();
    const isArabic = direction === 'rtl';
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const verifyAuth = async () => {
            const res = await checkAuth();
            if (!res.success) {
                router.push('/');
            } else {
                setIsAuthenticated(true);
            }
        };
        verifyAuth();
    }, [router]);

    const { data, isLoading, refetch } = useCarAlerts({
        pageSize: 50,
        sortBy: 'createdAt',
        sortDirection: 'desc',
    });

    const alerts = (data as any)?.data?.data || [];

    if (isAuthenticated === null || isLoading) {
        return (
            <Box variant="container" className="py-10">
                <Skeleton className="h-10 w-48 mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-52 w-full rounded-2xl" />
                    ))}
                </div>
            </Box>
        );
    }

    const breadcrumbItems = [
        { label: isArabic ? 'لوحة التحكم' : 'Dashboard', href: '/userProfile' },
        { label: t('title', { defaultValue: 'My Car Alerts' }) },
    ];

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'}>
            <SmartBreadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex items-center justify-between mt-6 mb-6">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
                    <Text variant="h3" className="font-bold text-[#2C3C39]">
                        {t('title', { defaultValue: 'My Car Alerts' })}
                    </Text>
                    {alerts.length > 0 && (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#198341]/10 text-[#198341]">
                            {alerts.length}
                        </span>
                    )}
                </div>

                <Link
                    href="/products"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold text-sm shadow-sm hover:shadow-md hover:opacity-90 transition-all"
                >
                    <Plus size={16} />
                    {isArabic ? 'إنشاء تنبيه جديد' : 'New Alert'}
                </Link>
            </div>

            {/* Empty state */}
            {alerts.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#198341]/10 to-[#ABDE3B]/10 rounded-full flex items-center justify-center mb-6">
                        <Bell size={36} className="text-[#198341]/40" />
                    </div>
                    <Text variant="h5" className="font-bold text-[#2C3C39] mb-2">
                        {t('noAlerts', { defaultValue: 'No Alerts Yet' })}
                    </Text>
                    <Text className="text-gray-500 mb-8 max-w-md text-sm leading-relaxed">
                        {t('noAlertsDesc', {
                            defaultValue:
                                'Create a car alert to get notified when new listings matching your criteria appear.',
                        })}
                    </Text>
                    <Link
                        href="/products"
                        className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        {t('getStarted', { defaultValue: 'Explore Cars & Create Alert' })}
                    </Link>
                </div>
            ) : (
                /* Alerts grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {alerts.map((alert: any) => (
                        <CarAlertItem key={alert.id} alert={alert} onUpdate={refetch} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AlertsPage;
