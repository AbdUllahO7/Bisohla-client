'use client';

import React, { createContext, useContext, useState, useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useProfile } from './profile.provider';
import {
  usePendingLegalDocuments,
  useAcceptLegalMutation,
  useLegalDocument,
} from '@/core/infrastructure-adapters/use-actions/legal/legal.use-actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight, FileText, AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { logoutAction } from '@/app/[locale]/auth/actions';
import { PendingLegalItemDto } from '@/core/entities/models/legal/legal.dto';

interface LegalGateContextType {
  isOpen: boolean;
  pendingCount: number;
}

const LegalGateContext = createContext<LegalGateContextType>({
  isOpen: false,
  pendingCount: 0,
});

export const useLegalGate = () => useContext(LegalGateContext);

export const LegalGateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('legal');
  const { profile } = useProfile();
  const isAuthenticated = !!profile?.id;

  const { data: pendingRes, isLoading: isPendingLoading } =
    usePendingLegalDocuments(isAuthenticated);
  const pendingItems: PendingLegalItemDto[] = Array.isArray(pendingRes?.data)
    ? pendingRes.data
    : Array.isArray(pendingRes?.data?.pending)
    ? pendingRes.data.pending
    : Array.isArray((pendingRes as any)?.pending)
    ? (pendingRes as any).pending
    : [];

  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [selectedDoc, setSelectedDoc] = useState<PendingLegalItemDto | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptMutation = useAcceptLegalMutation();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const isOpen = isAuthenticated && !isPendingLoading && pendingItems.length > 0;

  // Detail view document body query
  const { data: detailDocRes, isLoading: isDetailLoading } = useLegalDocument(
    selectedDoc?.kind ?? '',
  );
  const detailDoc = detailDocRes?.data;

  const handleAccept = async () => {
    try {
      setErrorMessage(null);
      const kinds = pendingItems.map((item) => item.kind);
      const res = await acceptMutation.mutateAsync({ kinds });

      if (!res.success) {
        setErrorMessage(res.message || t('gate.error'));
        return;
      }

      // If pending list still contains items, stay open; otherwise React Query refetch auto-closes
      if (res.data?.pending && res.data.pending.length > 0) {
        setErrorMessage(t('gate.error'));
      }
    } catch (err: any) {
      setErrorMessage(err?.message || t('gate.error'));
    }
  };

  const handleSignOut = () => {
    startLogoutTransition(async () => {
      await logoutAction();
    });
  };

  const getDocTitle = (item: PendingLegalItemDto) => {
    if (item.title) return item.title;
    if (item.kind === 'privacy_policy') return t('document_kind.privacy_policy');
    if (item.kind === 'terms_of_service') return t('document_kind.terms_of_service');
    if (item.kind === 'cookie_policy') return t('document_kind.cookie_policy');
    return item.slug;
  };

  return (
    <LegalGateContext.Provider
      value={{
        isOpen,
        pendingCount: pendingItems.length,
      }}
    >
      {children}

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent
            className="max-w-lg w-[95vw] sm:w-full p-6 max-h-[90vh] flex flex-col gap-4 overflow-hidden border-0 shadow-2xl rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 z-[9999]"
            onEscapeKeyDown={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
          >
            {activeView === 'list' ? (
              <>
                {/* List View Header */}
                <DialogHeader className="space-y-2 text-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-[#ABDE3B]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                      {t('gate.title')}
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed pt-1">
                    {t('gate.body')}
                  </DialogDescription>
                </DialogHeader>

                {/* Pending Document Rows */}
                <div className="flex-1 overflow-y-auto space-y-3 py-2 max-h-[42vh]">
                  {pendingItems.map((item) => (
                    <button
                      key={item.documentId || item.kind}
                      type="button"
                      onClick={() => {
                        setSelectedDoc(item);
                        setActiveView('detail');
                        setErrorMessage(null);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/60 hover:bg-emerald-50/50 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700/60 transition-all text-start group"
                    >
                      <div className="flex-1 min-w-0 pe-3">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-[#ABDE3B] transition-colors">
                          {getDocTitle(item)}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1 line-clamp-2">
                          {item.summary || (
                            <span className="text-emerald-600 dark:text-[#ABDE3B] font-medium">
                              {t('gate.read_action')}
                            </span>
                          )}
                        </p>
                      </div>
                      {isRTL ? (
                        <ChevronLeft className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-[#ABDE3B] flex-shrink-0 transition-transform group-hover:-translate-x-1" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-[#ABDE3B] flex-shrink-0 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Detail View Header */}
                <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setActiveView('list')}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-300 transition-colors"
                  >
                    {isRTL ? (
                      <ArrowRight className="w-5 h-5" />
                    ) : (
                      <ArrowLeft className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100 truncate">
                      {selectedDoc ? getDocTitle(selectedDoc) : ''}
                    </h3>
                  </div>
                </div>

                {/* Detail View Document Body */}
                <div className="flex-1 overflow-y-auto py-2 text-sm text-gray-700 dark:text-zinc-300 max-h-[48vh] leading-relaxed">
                  {isDetailLoading ? (
                    <div className="space-y-3 p-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-11/12" />
                      <Skeleton className="h-4 w-4/5" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  ) : detailDoc?.contentHtml ? (
                    <div
                      className="rich-text-content space-y-4"
                      dangerouslySetInnerHTML={{ __html: detailDoc.contentHtml }}
                    />
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-zinc-400">
                      <p className="font-semibold">{t('document.empty_title')}</p>
                      <p className="text-xs mt-1">{t('document.empty_subtitle')}</p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Footer Buttons (Common to both views) */}
            <div className="pt-2 space-y-2">
              <Button
                type="button"
                onClick={handleAccept}
                disabled={acceptMutation.isPending || isLoggingOut}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60"
              >
                {acceptMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </span>
                ) : (
                  t('gate.accept_button')
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleSignOut}
                disabled={acceptMutation.isPending || isLoggingOut}
                className="w-full text-gray-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 text-xs font-medium py-2 rounded-xl"
              >
                {isLoggingOut
                  ? isRTL
                    ? 'جاري تسجيل الخروج...'
                    : 'Signing out...'
                  : t('gate.sign_out')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </LegalGateContext.Provider>
  );
};
