'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useDirection } from '@/hooks/use-direction';
import { UserAddress } from '@/core/entities/models/users/saved-address.dto';
import {
  useSavedAddresses,
  useTouchSavedAddress,
} from '@/core/infrastructure-adapters/use-actions/users/saved-address.use-actions';
import { findMatchingSavedAddress } from '@/core/lib/saved-address-match';
import { SavedAddressRow } from './SavedAddressRow';

interface SavedAddressPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLocation: {
    governorate?: string | null;
    city?: string | null;
    address?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  };
  onSelectAddress: (address: UserAddress) => void;
}

export const SavedAddressPickerDialog: React.FC<SavedAddressPickerDialogProps> = ({
  open,
  onOpenChange,
  currentLocation,
  onSelectAddress,
}) => {
  const t = useTranslations();
  const direction = useDirection();

  const {
    data: response,
    isLoading,
    isError,
    refetch,
  } = useSavedAddresses({ enabled: open });

  const touchMutation = useTouchSavedAddress();

  const addresses = response?.data || [];
  const matchingAddress = findMatchingSavedAddress(addresses, currentLocation);

  const handleSelect = (address: UserAddress) => {
    // Fire-and-forget touch call
    touchMutation.mutate(address.id);
    onSelectAddress(address);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dir={direction}
        className="max-w-md w-full p-6 max-h-[85vh] flex flex-col gap-4 rounded-3xl"
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
            {t('savedAddresses.title')}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pe-1 -me-1">
          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2"
                >
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-28" />
                      <Skeleton className="h-3 w-40" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!isLoading && isError && (
            <div className="p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 text-center space-y-3">
              <AlertCircle className="w-6 h-6 text-rose-600 mx-auto" />
              <p className="text-sm font-medium text-rose-700 dark:text-rose-300">
                {t('savedAddresses.form.save_failed_error')}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
                className="gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>إعادة المحاولة / Retry</span>
              </Button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && addresses.length === 0 && (
            <div className="p-8 rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-base">
                  {t('savedAddress.picker_empty_title')}
                </h4>
                <p className="text-xs text-slate-500 dark:text-zinc-400">
                  {t('savedAddress.picker_empty_body')}
                </p>
              </div>
            </div>
          )}

          {/* List of Selectable Addresses */}
          {!isLoading && !isError && addresses.length > 0 && (
            <div className="space-y-2.5">
              {addresses.map((address) => {
                const isSelected = matchingAddress?.id === address.id;
                return (
                  <SavedAddressRow
                    key={address.id}
                    address={address}
                    variant="selectable"
                    isSelected={isSelected}
                    onSelect={handleSelect}
                  />
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
