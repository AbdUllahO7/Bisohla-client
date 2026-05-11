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
import { Bell, BellOff, Plus } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useDirection } from '@/hooks/use-direction';
import CarAlertModal from '@/components/web/ProductsPage/CarAlertModal';
import { getCityOptions, getGovernorateOptions } from '@/components/web/ProductsPage/addProducts/StepOne/utils';
import { Button } from '@/components/ui/button';
import { getInjection } from '@/di/container';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const AlertsPage = () => {
    const t = useTranslations('carAlerts');
    const router = useRouter();
    const direction = useDirection();
    const isArabic = direction === 'rtl';
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [listingTypeId, setListingTypeId] = useState<number | undefined>(undefined);
    const [listingTypes, setListingTypes] = useState<any[]>([]);
    const [newAlertListingTypeId, setNewAlertListingTypeId] = useState<number>(1);
    const [isTypeSelectionOpen, setIsTypeSelectionOpen] = useState(false);

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

    // Fetch listing types for selection
    useEffect(() => {
        const fetchTypes = async () => {
            try {
                const controller = getInjection('IListingTypesRepoController');
                const response = await controller.getListingTypes(1, 100);
                if (response.success && response.data) {
                    setListingTypes(response.data.data.filter((t: any) => t.isActive));
                }
            } catch (error) {
                console.error("Failed to fetch listing types", error);
            }
        };
        fetchTypes();
    }, []);

    const { data, isLoading, refetch } = useCarAlerts({
        pageSize: 50,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        filterGroups: listingTypeId ? [{
            operator: 'and',
            filters: [{ field: 'listingTypeId', operator: 'eq', value: listingTypeId }]
        }] : undefined
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
        { label: t('title', { defaultValue: 'My Alerts' }) },
    ];

    return (
        <div dir={isArabic ? 'rtl' : 'ltr'}>
            <SmartBreadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-6 mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full" />
                    <Text variant="h3" className="font-bold text-[#2C3C39]">
                        {t('title', { defaultValue: 'My Alerts' })}
                    </Text>
                    {alerts.length > 0 && (
                        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#198341]/10 text-[#198341]">
                            {alerts.length}
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    {/* Category Filter */}
                    <Select
                        value={listingTypeId ? String(listingTypeId) : "all"}
                        onValueChange={(value) => setListingTypeId(value === "all" ? undefined : Number(value))}
                    >
                        <SelectTrigger className="w-[180px] rounded-xl border-gray-200 bg-white">
                            <SelectValue placeholder={isArabic ? 'الفئة' : 'Category'} />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                            <SelectItem value="all">
                                {isArabic ? 'جميع الفئات' : 'All Categories'}
                            </SelectItem>
                            {listingTypes.map((type) => (
                                <SelectItem key={type.id} value={String(type.id)}>
                                    {type.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={() => setIsTypeSelectionOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold text-sm shadow-sm hover:shadow-md hover:opacity-90 transition-all"
                    >
                        <Plus size={16} />
                        {isArabic ? 'إنشاء تنبيه جديد' : 'New Alert'}
                    </Button>
                </div>
            </div>

            {/* Empty state */}
            {!isLoading && alerts.length === 0 && (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-dashed border-gray-200">
                    <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                        <BellOff className="w-10 h-10 text-gray-300" />
                    </div>
                    <Text variant="h4" className="font-bold text-[#2C3C39] mb-2">
                        {isArabic ? 'لا توجد تنبيهات بعد' : 'No Alerts Yet'}
                    </Text>
                    <Text className="text-gray-500 text-center max-w-sm mb-8">
                        {isArabic
                            ? 'أنشئ تنبيهاً لتكون أول من يعرف عند توفر إعلانات جديدة تناسب طلبك.'
                            : 'Create an alert to be the first to know when new listings match your criteria.'}
                    </Text>
                    <Button
                        onClick={() => setIsTypeSelectionOpen(true)}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#198341] text-white font-bold hover:bg-[#198341]/90 transition-all shadow-md shadow-[#198341]/20"
                    >
                        <Plus size={20} />
                        {isArabic ? 'إنشاء تنبيه جديد' : 'Create New Alert'}
                    </Button>
                </div>
            )}

            {alerts.length > 0 && (
                /* Alerts grid */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {alerts.map((alert: any) => (
                        <CarAlertItem key={alert.id} alert={alert} onUpdate={refetch} listingTypes={listingTypes} />
                    ))}
                </div>
            )}

            <CarAlertModal
                open={isAlertModalOpen}
                onOpenChange={(open) => {
                    setIsAlertModalOpen(open);
                    if (!open) {
                        refetch();
                    }
                }}
                initialData={{}}
                governorateOptions={getGovernorateOptions(isArabic)}
                getCityOptions={(gov) => getCityOptions(gov, isArabic)}
                isArabic={isArabic}
                t={t}
                listingTypeId={newAlertListingTypeId}
            />

            {/* Type Selection Dialog for New Alert */}
            <Dialog open={isTypeSelectionOpen} onOpenChange={setIsTypeSelectionOpen}>
                <DialogContent className="bg-white rounded-2xl max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-center">
                            {isArabic ? 'اختر فئة التنبيه' : 'Choose Alert Category'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-3 py-4">
                        {listingTypes.map((type) => (
                            <Button
                                key={type.id}
                                variant="outline"
                                className="h-14 justify-start px-6 rounded-xl hover:border-primary hover:bg-primary/5 transition-all"
                                onClick={() => {
                                    setNewAlertListingTypeId(type.id);
                                    setIsTypeSelectionOpen(false);
                                    setIsAlertModalOpen(true);
                                }}
                            >
                                <span className="text-lg font-medium">{type.name}</span>
                            </Button>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AlertsPage;
