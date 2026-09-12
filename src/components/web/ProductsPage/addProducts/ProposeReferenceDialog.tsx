'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  FuzzyRefItemResult,
  ProposeReferenceResult,
  LOOKS_LIKE_CONTACT_OR_URL,
} from '@/core/entities/models/listings/reference-proposal.dto';
import { useFuzzyReferenceSearch } from '@/core/infrastructure-adapters/use-actions/visitors/reference-proposal.use-actions';
import { Sparkles, ArrowRight, ArrowLeft } from 'lucide-react';

interface ProposeReferenceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributeName: string;
  groupId: number;
  parentItemId?: number | null;
  initialName?: string;
  minNameLength?: number;
  maxNameLength?: number;
  onResolve: (result: ProposeReferenceResult) => void;
}

export const ProposeReferenceDialog: React.FC<ProposeReferenceDialogProps> = ({
  open,
  onOpenChange,
  attributeName,
  groupId,
  parentItemId,
  initialName = '',
  minNameLength = 2,
  maxNameLength = 120,
  onResolve,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('referenceProposal');

  const [name, setName] = useState(initialName);
  const [debouncedName, setDebouncedName] = useState(initialName);

  // Sync initial search term when opening
  useEffect(() => {
    if (open) {
      setName(initialName);
      setDebouncedName(initialName);
    }
  }, [open, initialName]);

  // Debounce 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedName(name.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [name]);

  // Client-side guards
  const validationError = useMemo(() => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    if (trimmed.length < minNameLength) {
      return t('error_too_short', { min: minNameLength });
    }
    if (trimmed.length > maxNameLength) {
      return t('error_too_long', { max: maxNameLength });
    }
    if (LOOKS_LIKE_CONTACT_OR_URL.test(trimmed)) {
      return t('error_contact_info');
    }
    return null;
  }, [name, minNameLength, maxNameLength, t]);

  const isEligibleForFuzzy = debouncedName.length >= minNameLength && !validationError;

  const { data: candidates = [], isLoading } = useFuzzyReferenceSearch(
    groupId,
    {
      searchTerm: debouncedName,
      parentItemId: parentItemId || undefined,
      searchAllParents: true,
    },
    open && isEligibleForFuzzy
  );

  const handleSelectExisting = (item: FuzzyRefItemResult) => {
    onResolve({
      kind: 'existing',
      id: item.id,
      label: item.label,
      parentItemId: item.parentItemId,
      parentLabel: item.parentLabel,
      metadata: item.metadata,
      parentMetadata: item.parentMetadata,
    });
    onOpenChange(false);
  };

  const handleConfirmProposal = () => {
    const trimmed = name.trim();
    if (!trimmed || validationError) return;
    onResolve({
      kind: 'propose',
      name: trimmed,
    });
    onOpenChange(false);
  };

  const hasCandidates = candidates.length > 0;
  const showDidYouMean = isEligibleForFuzzy && (isLoading || hasCandidates);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-full p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 shadow-2xl">
        <DialogHeader className="space-y-1.5 text-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#198341]" />
            </div>
            <DialogTitle className="text-lg font-bold text-slate-800 dark:text-zinc-100">
              {t('sheet_title', { attribute: attributeName })}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-slate-500 dark:text-zinc-400">
            {t('sheet_subtitle')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              {t('name_label')}
            </label>
            <Input
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('name_placeholder', { attribute: attributeName })}
              className="h-11 rounded-xl bg-slate-50 dark:bg-zinc-800/80 border-slate-200 dark:border-zinc-700 text-sm focus-visible:ring-primary focus-visible:border-primary"
            />
            {validationError && (
              <p className="text-xs text-red-500 font-medium">{validationError}</p>
            )}
          </div>

          {/* Did You Mean Section */}
          {showDidYouMean && (
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-slate-600 dark:text-zinc-400">
                {t('did_you_mean_title')}
              </span>

              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {isLoading ? (
                  <>
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                  </>
                ) : (
                  candidates.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectExisting(item)}
                      className="w-full text-start p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800 hover:border-primary/40 hover:bg-primary/5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800 dark:text-zinc-200 group-hover:text-primary">
                          {item.label}
                        </span>
                        {item.parentLabel && (
                          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                            {t('under_parent', { parent: item.parentLabel })}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-400 group-hover:text-primary transition-colors">
                        {isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-xs"
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button
            type="button"
            disabled={!name.trim() || !!validationError}
            onClick={handleConfirmProposal}
            className="flex-1 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold text-xs h-10 shadow-sm hover:shadow transition-all"
          >
            {hasCandidates
              ? t('confirm_cta', { name: name.trim() })
              : t('confirm_cta_empty')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposeReferenceDialog;
