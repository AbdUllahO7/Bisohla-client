'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Hash, Check, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ListingIdCopyChipProps {
  id: number | string;
  className?: string;
}

/**
 * Listing #ID chip button for product detail page.
 *
 * Requirements from 07-search-enhancements.md §6:
 * - Copies bare digits only (e.g. 12345, not #12345)
 * - Accessible label: "Copy listing ID {id}" with bare digits
 * - Toast: "Listing ID copied" / "تم نسخ رقم الإعلان"
 * - LTR isolated rendering for Arabic and English UI
 * - Fallback clipboard copy support
 */
export const ListingIdCopyChip: React.FC<ListingIdCopyChipProps> = ({ id, className }) => {
  const t = useTranslations('listing.detail.id_chip');
  const { toast } = useToast();
  const [hasCopied, setHasCopied] = useState(false);

  const bareDigits = String(id).replace(/\D/g, '');
  if (!bareDigits) return null;

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(bareDigits);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = bareDigits;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setHasCopied(true);
      toast({
        title: t('copied_toast'),
        duration: 2000,
      });
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      // Fail silently if clipboard write is disallowed
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={t('a11y_label', { id: bareDigits })}
      title={t('a11y_label', { id: bareDigits })}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold',
        'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300',
        'border border-slate-200 dark:border-zinc-700 transition-all cursor-pointer shadow-xs active:scale-95',
        className,
      )}
    >
      {hasCopied ? (
        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-50 duration-200" />
      ) : (
        <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
      )}
      <span dir="ltr" className="font-mono tracking-tight [unicode-bidi:isolate]">
        {bareDigits}
      </span>
      <Copy className="w-3 h-3 text-slate-400 dark:text-zinc-500 opacity-60 ml-0.5" />
    </button>
  );
};

export default ListingIdCopyChip;
