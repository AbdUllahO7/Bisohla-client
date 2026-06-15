'use client';

import { useState, useEffect } from 'react';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { useTranslations } from 'next-intl';
import SmartBreadcrumb from '@/components/shared/smart-breadcrumbs';
import { useCarAlerts } from '@/core/infrastructure-adapters/use-actions/users/car-alert.user.use-actions';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { useRouter } from '@/i18n/routing';
import { CarAlertItem } from '@/components/web/CarAlerts/CarAlertItem';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Bell, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';

const CarAlertsPage = () => {
    const t = useTranslations('carAlerts');
    const router = useRouter();
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

    const alerts = data?.data?.data || [];

    if (isAuthenticated === null || isLoading) {
        return (
            <Box variant="container" className="py-10">
                <Skeleton className="h-10 w-48 mb-6" />
                <Skeleton className="h-64 w-full rounded-xl" />
            </Box>
        );
    }

    const breadcrumbItems = [
        {
            label: t('breadcrumb', { defaultValue: 'My Alerts' }),
        },
    ];

    return (
        <div className="bg-background min-h-screen pb-10">
            <Box variant="container" className="pt-8">
                <SmartBreadcrumb items={breadcrumbItems} />

                <Box className="w-full flex justify-between items-center mt-8 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full"></div>
                        <Text variant="h3" className="font-bold text-[#2C3C39]">
                            {t('title', { defaultValue: 'My Car Alerts' })}
                        </Text>
                    </div>

                    <Link
                        href="/products"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#198341] text-[#198341] font-bold hover:bg-[#198341]/5 transition-all duration-300"
                    >
                        <Plus size={18} />
                        {t('createNew', { defaultValue: 'Create New Alert' })}
                    </Link>
                </Box>

                {alerts.length === 0 ? (
                    <Box className="w-full bg-white rounded-2xl p-12 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                            <Bell size={40} className="text-gray-300" />
                        </div>
                        <Text variant="h5" className="font-bold text-[#2C3C39] mb-2">
                            {t('noAlerts', { defaultValue: 'No Alerts Found' })}
                        </Text>
                        <Text className="text-gray-500 mb-8 max-w-md">
                            {t('noAlertsDesc', { defaultValue: 'Set up car alerts to get notified when new cars matching your criteria are listed.' })}
                        </Text>
                        <Link
                            href="/products"
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold shadow-md hover:shadow-lg transition-all"
                        >
                            {t('getStarted', { defaultValue: 'Explore Cars' })}
                        </Link>
                    </Box>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {alerts.map((alert: any) => (
                            <CarAlertItem key={alert.id} alert={alert} onUpdate={refetch} />
                        ))}
                    </div>
                )}
            </Box>
        </div>
    );
};

export default CarAlertsPage;
