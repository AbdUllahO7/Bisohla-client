'use client';

import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    Trash2,
    Bell,
    BellOff,
    MapPin,
    Tag,
    Car,
    MoreVertical,
    Settings2,
    Loader2,
} from 'lucide-react';
import { SelectCarAlertDto } from '@/core/entities/models/car-alerts/car-alerts.dto';
import {
    deleteCarAlert,
    toggleCarAlertStatus,
} from '@/core/infrastructure-adapters/actions/users/car-alert.user.actions';
import { useToast } from '@/hooks/use-toast';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { AlertFormModal } from './AlertFormModal';

interface CarAlertItemProps {
    alert: SelectCarAlertDto;
    onUpdate?: () => void;
    listingTypes?: any[];
}

export const CarAlertItem: React.FC<CarAlertItemProps> = ({
    alert,
    onUpdate,
    listingTypes = [],
}) => {
    const t = useTranslations('carAlerts');
    const tModal = useTranslations('carAlertModal');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const { toast } = useToast();
    const [isToggling, setIsToggling] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleToggle = async (checked: boolean) => {
        setIsToggling(true);
        try {
            const res = await toggleCarAlertStatus(alert.id, {
                isActive: checked,
            });
            if (res.success) {
                toast({
                    title: checked
                        ? t('enabled', { defaultValue: 'Alert Enabled' })
                        : t('disabled', { defaultValue: 'Alert Disabled' }),
                    description: t('toggleSuccess', {
                        defaultValue: 'Your alert status has been updated.',
                    }),
                });
                onUpdate?.();
            } else {
                toast({
                    title: t('error', { defaultValue: 'Error' }),
                    description:
                        res.message ||
                        t('toggleError', {
                            defaultValue: 'Failed to update alert status.',
                        }),
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: t('error', { defaultValue: 'Error' }),
                description: t('unexpectedError', {
                    defaultValue: 'An unexpected error occurred.',
                }),
                variant: 'destructive',
            });
        } finally {
            setIsToggling(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await deleteCarAlert(alert.id);
            if (res.success) {
                toast({
                    title: t('deleted', { defaultValue: 'Alert Deleted' }),
                    description: t('deleteSuccess', {
                        defaultValue: 'The alert has been removed.',
                    }),
                });
                onUpdate?.();
            } else {
                toast({
                    title: t('error', { defaultValue: 'Error' }),
                    description:
                        res.message ||
                        t('deleteError', {
                            defaultValue: 'Failed to delete alert.',
                        }),
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: t('error', { defaultValue: 'Error' }),
                description: t('unexpectedError', {
                    defaultValue: 'An unexpected error occurred.',
                }),
                variant: 'destructive',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const formatPrice = (price: number | null | undefined) => {
        if (!price) return null;
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(price);
    };

    const typeName = listingTypes.find(t => t.id === alert.listingTypeId)?.name;
    const listingTitle = [alert.make?.name, alert.model?.name]
        .filter(Boolean)
        .join(' ') || (typeName ? (isRtl ? `تنبيه ${typeName}` : `${typeName} Alert`) : null) || t('anyListing', {
            defaultValue: 'Any Item',
        });
    const hasLocation = alert.governorate || alert.city;
    const hasPriceRange = alert.minPrice || alert.maxPrice;

    return (
        <TooltipProvider>
            <div
                dir={isRtl ? 'rtl' : 'ltr'}
                className={cn(
                    'group relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 transition-all duration-300',
                    'border border-gray-100 dark:border-zinc-800 hover:border-[#198341]/20',
                    'shadow-sm hover:shadow-lg hover:shadow-[#198341]/5',
                    !alert.isActive && 'opacity-75'
                )}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Status indicator line */}
                <div
                    className={cn(
                        'absolute top-0 left-0 right-0 h-1 transition-all duration-300',
                        alert.isActive
                            ? 'bg-gradient-to-r from-[#198341] via-[#22a352] to-[#ABDE3B]'
                            : 'bg-gray-200 dark:bg-zinc-800'
                    )}
                />

                {/* Main content */}
                <div className="p-5 pt-6">
                    {/* Header section */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                        {/* Left: Icon + Title */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* Animated bell icon */}
                            <div
                                className={cn(
                                    'relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300',
                                    alert.isActive
                                        ? 'bg-gradient-to-br from-[#198341]/10 to-[#ABDE3B]/10'
                                        : 'bg-gray-100 dark:bg-zinc-800'
                                )}
                            >
                                {alert.isActive ? (
                                    <Bell
                                        className={cn(
                                            'w-5 h-5 text-[#198341] transition-transform',
                                            isHovered && 'animate-pulse'
                                        )}
                                    />
                                ) : (
                                    <BellOff className="w-5 h-5 text-gray-400 dark:text-zinc-500" />
                                )}

                                {/* Active pulse indicator */}
                                {alert.isActive && (
                                    <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#198341] opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-[#198341]"></span>
                                    </span>
                                )}
                            </div>

                            {/* Title and subtitle */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-semibold text-[#2C3C39] dark:text-white text-lg truncate">
                                        {listingTitle}
                                    </h3>
                                </div>

                            </div>
                        </div>

                        {/* Right: Toggle switch */}
                        <div className="flex items-center gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="flex items-center gap-2">
                                        {isToggling && (
                                            <Loader2 className="w-4 h-4 animate-spin text-[#198341]" />
                                        )}
                                        {/* Force ltr so switch thumb renders correctly in RTL pages */}
                                        <span dir="ltr">
                                            <Switch
                                                checked={alert.isActive}
                                                onCheckedChange={handleToggle}
                                                disabled={isToggling}
                                                className="data-[state=checked]:bg-[#198341]"
                                            />
                                        </span>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {alert.isActive
                                            ? t('clickToDisable', {
                                                defaultValue:
                                                    'Click to pause notifications',
                                            })
                                            : t('clickToEnable', {
                                                defaultValue:
                                                    'Click to enable notifications',
                                            })}
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                    </div>

                    {/* Criteria tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {/* Price range badge */}
                        {hasPriceRange && (
                            <Badge
                                variant="secondary"
                                className="bg-[#198341]/5 text-[#198341] border-[#198341]/10 hover:bg-[#198341]/10 px-3 py-1.5 rounded-lg font-medium"
                            >
                                <Tag className="w-3.5 h-3.5 mr-1.5" />
                                {formatPrice(alert.minPrice) ||
                                    t('any', { defaultValue: 'Any' })}
                                {' - '}
                                {formatPrice(alert.maxPrice) ||
                                    t('any', { defaultValue: 'Any' })}
                            </Badge>
                        )}

                        {!hasPriceRange && (
                              <Badge
                                  variant="secondary"
                                  className="bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-100 dark:border-zinc-800 px-3 py-1.5 rounded-lg font-medium"
                              >
                                  <Tag className="w-3.5 h-3.5 mr-1.5" />
                                  {t('anyPrice', { defaultValue: 'Any price' })}
                              </Badge>
                          )}

                        {/* Location badge */}
                        {hasLocation && (
                              <Badge
                                  variant="secondary"
                                  className="bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg font-medium"
                              >
                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                {[alert.governorate, alert.city]
                                    .filter(Boolean)
                                    .join(', ')}
                            </Badge>
                        )}

                        {!hasLocation && (
                              <Badge
                                  variant="secondary"
                                  className="bg-gray-50 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-100 dark:border-zinc-800 px-3 py-1.5 rounded-lg font-medium"
                              >
                                <MapPin className="w-3.5 h-3.5 mr-1.5" />
                                {t('anyLocation', {
                                      defaultValue: 'Any location',
                                  })}
                              </Badge>
                          )}
                    </div>

                    {/* Footer with status and actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 dark:border-zinc-800">
                        {/* Status badge */}
                        <div className="flex items-center gap-2">
                            <div
                                className={cn(
                                    'w-2 h-2 rounded-full',
                                    alert.isActive
                                        ? 'bg-[#198341]'
                                        : 'bg-gray-300 dark:bg-zinc-700'
                                )}
                            />
                            <span
                                className={cn(
                                    'text-sm font-medium',
                                    alert.isActive
                                        ? 'text-[#198341]'
                                        : 'text-gray-400 dark:text-zinc-500'
                                )}
                            >
                                {alert.isActive
                                    ? t('activeStatus', {
                                        defaultValue: 'Active',
                                    })
                                    : t('pausedStatus', {
                                        defaultValue: 'Paused',
                                    })}
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1">
                            {/* Edit button */}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditModalOpen(true)}
                                        className={cn(
                                            'h-9 w-9 p-0 rounded-lg transition-all duration-200',
                                            'text-gray-400 dark:text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30',
                                            'opacity-0 group-hover:opacity-100'
                                        )}
                                    >
                                        <Settings2 className="w-4 h-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>
                                        {tModal('editAlertHint')}
                                    </p>
                                </TooltipContent>
                            </Tooltip>

                            {/* Delete button with confirmation dialog */}
                            <AlertDialog>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={isDeleting}
                                                className={cn(
                                                    'h-9 w-9 p-0 rounded-lg transition-all duration-200',
                                                    'text-gray-400 dark:text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30',
                                                    'opacity-0 group-hover:opacity-100'
                                                )}
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>
                                            {t('deleteAlert', {
                                                defaultValue: 'Delete alert',
                                            })}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>

                                <AlertDialogContent className="sm:max-w-[425px] bg-white dark:bg-zinc-900 dark:border-zinc-800">
                                    <AlertDialogHeader>
                                        <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center mb-4">
                                            <Trash2 className="w-6 h-6 text-red-600" />
                                        </div>
                                        <AlertDialogTitle className="text-center">
                                            {t('confirmDeleteTitle', {
                                                defaultValue:
                                                    'Delete this alert?',
                                            })}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription className="text-center">
                                            {t('confirmDeleteDescription', {
                                                defaultValue:
                                                    "You'll stop receiving notifications for",
                                            })}{' '}
                                            <span className="font-semibold text-[#2C3C39] dark:text-white">
                                                {listingTitle}
                                            </span>
                                            .{' '}
                                            {t('cannotUndo', {
                                                defaultValue:
                                                    'This action cannot be undone.',
                                            })}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="sm:justify-center gap-3 mt-4">
                                        <AlertDialogCancel className="flex-1 sm:flex-none">
                                            {t('cancel', {
                                                defaultValue: 'Cancel',
                                            })}
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={handleDelete}
                                            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                        >
                                            {t('delete', {
                                                defaultValue: 'Delete',
                                            })}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </div>
            {/* Edit Alert Modal */}
            <AlertFormModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                alertId={alert.id}
                initialData={{
                    id: alert.id,
                    listingTypeId: alert.listingTypeId,
                    makeId: alert.makeId || 0,
                    modelId: alert.modelId || 0,
                    trimId: alert.trimId || 0,
                    minPrice: alert.minPrice || 0,
                    maxPrice: alert.maxPrice || 0,
                    governorate: alert.governorate || '',
                    city: alert.city || '',
                    attributeFilters: alert.attributeFilters,
                }}
                defaultListingTypeId={alert.listingTypeId}
                onSuccess={onUpdate}
            />
        </TooltipProvider>
    );
};
