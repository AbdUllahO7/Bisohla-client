'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useSettings } from '@/providers/settings.provider';
import {
  useSavedAddresses,
  useSetDefaultSavedAddress,
} from '@/core/infrastructure-adapters/use-actions/users/saved-address.use-actions';
import { UserAddress } from '@/core/entities/models/users/saved-address.dto';
import { SavedAddressRow } from './SavedAddressRow';

export const SavedAddressesList: React.FC = () => {
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations();
  const { getListingsSettings } = useSettings();

  const locationSettings = getListingsSettings()?.location;
  const isEnabled = locationSettings?.saved_addresses_enabled ?? true;
  const maxAddresses = locationSettings?.max_saved_addresses_per_user ?? 10;

  const { data: response, isLoading, isError, refetch } = useSavedAddresses();
  const setDefaultMutation = useSetDefaultSavedAddress();
  const [settingDefaultId, setSettingDefaultId] = useState<number | null>(null);

  const addresses = response?.data || [];
  const isCapReached = addresses.length >= maxAddresses;

  const handleSetDefault = async (address: UserAddress) => {
    try {
      setSettingDefaultId(address.id);
      const res = await setDefaultMutation.mutateAsync(address.id);
      if (res.success) {
        toast({
          title: t('savedAddresses.set_default_success_toast'),
          className: 'bg-emerald-600 text-white border-emerald-700',
        });
      } else {
        toast({
          variant: 'destructive',
          title: t('savedAddresses.set_default_failed_toast'),
        });
      }
    } catch {
      toast({
        variant: 'destructive',
        title: t('savedAddresses.set_default_failed_toast'),
      });
    } finally {
      setSettingDefaultId(null);
    }
  };

  const handleEdit = (address: UserAddress) => {
    router.push(`/userProfile/SavedAddresses/${address.id}`);
  };

  const handleAddNew = () => {
    router.push('/userProfile/SavedAddresses/new');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* Title is rendered in every state branch */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {t('savedAddresses.title')}
        </h1>
      </div>

      {/* Loading Skeleton State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3"
            >
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {t('savedAddresses.form.save_failed_error')}
            </h3>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 border-slate-300 dark:border-zinc-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة / Retry</span>
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && addresses.length === 0 && (
        <div className="p-10 sm:p-14 rounded-3xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/30 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <MapPin className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">
              {t('savedAddresses.empty_title')}
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {t('savedAddresses.empty_body')}
            </p>
          </div>
          {isEnabled && !isCapReached && (
            <Button
              onClick={handleAddNew}
              className="mt-2 inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-xl shadow-sm px-6"
            >
              <Plus className="w-4 h-4" />
              <span>{t('savedAddresses.add_button')}</span>
            </Button>
          )}
        </div>
      )}

      {/* Content State: List of Addresses */}
      {!isLoading && !isError && addresses.length > 0 && (
        <div className="space-y-3.5">
          {addresses.map((address) => (
            <SavedAddressRow
              key={address.id}
              address={address}
              variant="manageable"
              onEdit={handleEdit}
              onSetDefault={handleSetDefault}
              isSettingDefault={settingDefaultId === address.id}
            />
          ))}

          {/* Footer Add address button & Cap Caption */}
          {isEnabled && (
            <div className="pt-4 space-y-2">
              <Button
                type="button"
                variant="outline"
                disabled={isCapReached}
                onClick={handleAddNew}
                className="w-full py-6 rounded-2xl border-dashed border-slate-300 dark:border-zinc-700 hover:border-primary hover:text-primary font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>{t('savedAddresses.add_button')}</span>
              </Button>

              {isCapReached && (
                <p className="text-xs text-center text-amber-600 dark:text-amber-400 font-medium">
                  {t('savedAddresses.cap_reached_note', { count: maxAddresses })}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
