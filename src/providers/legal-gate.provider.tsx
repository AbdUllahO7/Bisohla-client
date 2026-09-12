'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useTransition, useCallback } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from './profile.provider';
import { useSession } from '@/hooks/auth/use-session';
import {
  usePendingLegalDocuments,
  useLegalDocuments,
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
import { ChevronLeft, ChevronRight, AlertCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
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
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const { profile } = useProfile();

  const currentUserId = (user && user.id && user.id > 0) ? user.id : (profile && profile.id && profile.id > 0) ? profile.id : 0;
  const isAuthenticated = Boolean(currentUserId > 0);

  // Always fetch public legal documents
  const { data: allDocsRes, isLoading: isAllDocsLoading } = useLegalDocuments();

  // Fetch pending legal documents conditionally for authenticated user (polls every 30s)
  const {
    data: pendingRes,
    isLoading: isPendingLoading,
    refetch: refetchPending,
  } = usePendingLegalDocuments(currentUserId, isAuthenticated);

  const pendingItems: PendingLegalItemDto[] = Array.isArray(pendingRes?.data)
    ? pendingRes.data
    : Array.isArray(pendingRes?.data?.pending)
    ? pendingRes.data.pending
    : Array.isArray((pendingRes as any)?.pending)
    ? (pendingRes as any).pending
    : Array.isArray((pendingRes as any)?.data?.data)
    ? (pendingRes as any).data.data
    : Array.isArray((pendingRes as any)?.result)
    ? (pendingRes as any).result
    : [];

  // Filter for items requiring acceptance (requiresAcceptance === true or when returned from pending query)
  const requiredPendingItems: PendingLegalItemDto[] = useMemo(() => {
    if (!isAuthenticated) return [];
    return pendingItems.filter((item: PendingLegalItemDto) => {
      if (item.requiresAcceptance === false) return false;
      return true;
    });
  }, [isAuthenticated, pendingItems]);

  const [activeView, setActiveView] = useState<'list' | 'detail'>('list');
  const [selectedDoc, setSelectedDoc] = useState<PendingLegalItemDto | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const acceptMutation = useAcceptLegalMutation();
  const [isLoggingOut, startLogoutTransition] = useTransition();

  const isOpen = isAuthenticated && !isPendingLoading && requiredPendingItems.length > 0;

  // Detail view document body query
  const { data: detailDocRes, isLoading: isDetailLoading } = useLegalDocument(
    selectedDoc?.kind ?? '',
  );
  const detailDoc = detailDocRes?.data;

  // Reset view state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveView('list');
      setSelectedDoc(null);
      setErrorMessage(null);
    }
  }, [isOpen]);

  // Refetch pending documents on client route transitions if authenticated
  useEffect(() => {
    if (isAuthenticated && currentUserId > 0) {
      refetchPending();
    }
  }, [pathname, isAuthenticated, currentUserId, refetchPending]);

  // Listen to login/logout/session update events
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleAuthChange = () => {
      queryClient.invalidateQueries({ queryKey: ['legal-pending'] });
      if (isAuthenticated && currentUserId > 0) {
        refetchPending();
      }
    };

    const handleLogout = () => {
      queryClient.removeQueries({ queryKey: ['legal-pending'] });
      queryClient.setQueryData(['legal-pending'], null);
      setActiveView('list');
      setSelectedDoc(null);
      setErrorMessage(null);
    };

    window.addEventListener('login-success', handleAuthChange);
    window.addEventListener('session-updated', handleAuthChange);
    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('logout-success', handleLogout);
    window.addEventListener('session-invalidated', handleLogout);

    return () => {
      window.removeEventListener('login-success', handleAuthChange);
      window.removeEventListener('session-updated', handleAuthChange);
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('logout-success', handleLogout);
      window.removeEventListener('session-invalidated', handleLogout);
    };
  }, [queryClient, isAuthenticated, currentUserId, refetchPending]);

  useEffect(() => {
    if (detailDocRes !== undefined) {
      console.log(
        `%c📜 [Legal Document Detail] (${selectedDoc?.kind}):`,
        'color: #ABDE3B; background: #1a2b28; padding: 2px 6px; border-radius: 4px; font-weight: bold;',
        detailDocRes
      );
    }
  }, [detailDocRes, selectedDoc]);

  const handleAccept = async () => {
    try {
      setErrorMessage(null);
      const kinds = requiredPendingItems
        .map((item: PendingLegalItemDto) => item.kind)
        .filter(Boolean);
      const documentIds = requiredPendingItems
        .map((item: PendingLegalItemDto) => item.documentId)
        .filter((id: any): id is number => typeof id === 'number');

      const res = await acceptMutation.mutateAsync({
        kinds: kinds.length > 0 ? kinds : undefined,
        documentIds: documentIds.length > 0 ? documentIds : undefined,
      });

      if (!res.success) {
        setErrorMessage(res.message || t('gate.error'));
        return;
      }

      // Invalidate pending queries
      queryClient.invalidateQueries({ queryKey: ['legal-pending'] });
      setActiveView('list');
      setSelectedDoc(null);

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
      queryClient.removeQueries({ queryKey: ['legal-pending'] });
      queryClient.setQueryData(['legal-pending'], null);
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
        pendingCount: requiredPendingItems.length,
      }}
    >
      {children}

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={() => {}}>
          <DialogContent
            hideCloseButton
            dir={isRTL ? 'rtl' : 'ltr'}
            className="max-w-md w-[92vw] sm:w-[460px] max-h-[85vh] p-6 sm:p-7 flex flex-col justify-between overflow-hidden border border-zinc-800/90 shadow-[0_0_60px_rgba(0,0,0,0.95)] rounded-[28px] !bg-[#0e1312] !opacity-100 text-white !z-[999999]"
            onEscapeKeyDown={(e) => e.preventDefault()}
            onInteractOutside={(e) => e.preventDefault()}
            onPointerDownOutside={(e) => e.preventDefault()}
          >
            {activeView === 'list' ? (
              <div className="flex flex-col flex-1 min-h-0">
                {/* List View Header */}
                <div className="space-y-2 text-center shrink-0">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center leading-tight tracking-tight">
                    {t('gate.title')}
                  </h2>
                  <p className="text-sm text-zinc-400 text-center leading-relaxed pt-1 max-w-xs mx-auto">
                    {t('gate.body')}
                  </p>
                </div>

                {/* Pending Document Cards */}
                <div className="flex-1 min-h-0 overflow-y-auto space-y-3 my-4 max-h-[38vh] scrollbar-thin scrollbar-thumb-zinc-700">
                  {requiredPendingItems.map((item: PendingLegalItemDto) => (
                    <button
                      key={item.documentId || item.kind}
                      type="button"
                      onClick={() => {
                        setSelectedDoc(item);
                        setActiveView('detail');
                        setErrorMessage(null);
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#18201d] hover:bg-[#202c28] border border-zinc-800/90 hover:border-[#198341]/60 transition-all text-start group cursor-pointer"
                    >
                      <div className="flex-1 min-w-0 pe-3">
                        <h4 className="font-bold text-base text-white group-hover:text-[#ABDE3B] transition-colors">
                          {getDocTitle(item)}
                        </h4>
                        <span className="text-xs text-[#22c55e] dark:text-[#ABDE3B] font-semibold mt-1 inline-block">
                          {t('gate.read_action')}
                        </span>
                      </div>
                      {isRTL ? (
                        <ChevronLeft className="w-5 h-5 text-zinc-500 group-hover:text-white flex-shrink-0 transition-transform group-hover:-translate-x-1" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-white flex-shrink-0 transition-transform group-hover:translate-x-1" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col flex-1 min-h-0">
                {/* Detail View Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-zinc-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveView('list')}
                    className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors"
                  >
                    {isRTL ? (
                      <ArrowRight className="w-5 h-5" />
                    ) : (
                      <ArrowLeft className="w-5 h-5" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-lg text-white truncate">
                      {selectedDoc ? getDocTitle(selectedDoc) : ''}
                    </h3>
                  </div>
                </div>

                {/* Detail View Document Body (Scrollable inside the card) */}
                <div className="flex-1 min-h-[200px] max-h-[44vh] overflow-y-auto my-2 text-sm text-zinc-300 leading-relaxed scrollbar-thin scrollbar-thumb-zinc-700 px-2">
                  {isDetailLoading ? (
                    <div className="space-y-3 p-2">
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-11/12 bg-zinc-800" />
                      <Skeleton className="h-4 w-4/5 bg-zinc-800" />
                      <Skeleton className="h-4 w-full bg-zinc-800" />
                      <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                    </div>
                  ) : detailDoc?.contentHtml ? (
                    <div
                      className="rich-text-content space-y-3 text-zinc-200 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: detailDoc.contentHtml }}
                    />
                  ) : (
                    <div className="text-center py-8 text-zinc-400">
                      <p className="font-semibold">{t('document.empty_title')}</p>
                      <p className="text-xs mt-1">{t('document.empty_subtitle')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/40 border border-red-900/60 text-red-400 text-xs shrink-0">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Action Buttons (Always pinned at bottom of modal) */}
            <div className="pt-3 space-y-3 shrink-0 border-t border-zinc-800/60 mt-auto">
              <Button
                type="button"
                onClick={handleAccept}
                disabled={acceptMutation.isPending || isLoggingOut}
                className="w-full h-14 bg-[#2e7d32] hover:bg-[#256628] active:scale-[0.99] text-white font-bold text-base rounded-2xl transition-all shadow-lg hover:shadow-emerald-950/40 disabled:opacity-60"
              >
                {acceptMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                    <span>{isRTL ? 'جاري الحفظ...' : 'Saving...'}</span>
                  </span>
                ) : (
                  t('gate.accept_button')
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleSignOut}
                disabled={acceptMutation.isPending || isLoggingOut}
                className="w-full h-14 bg-black/50 hover:bg-zinc-900 active:scale-[0.99] border border-zinc-800 text-white font-bold text-base rounded-2xl transition-all"
              >
                {isLoggingOut ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                    <span>{isRTL ? 'جاري تسجيل الخروج...' : 'Signing out...'}</span>
                  </span>
                ) : (
                  t('gate.sign_out')
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </LegalGateContext.Provider>
  );
};
