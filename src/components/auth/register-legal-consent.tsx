'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLegalDocuments, useLegalDocument } from '@/core/infrastructure-adapters/use-actions/legal/legal.use-actions';
import { LegalDocumentListItemDto } from '@/core/entities/models/legal/legal.dto';
import { Skeleton } from '@/components/ui/skeleton';

interface RegisterLegalConsentProps {
  error?: unknown;
  defaultChecked?: boolean;
  
}

const DocumentPreviewModal = ({
  kind,
  onClose,
}: {
  kind: string | null;
  onClose: () => void;
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('legal');
  const { data: res, isLoading } = useLegalDocument(kind || '');
  const doc = res?.data;

  if (!kind) return null;

  const fallbackTitle =
    kind === 'privacy_policy'
      ? t('document_kind.privacy_policy')
      : kind === 'terms_of_service'
        ? t('document_kind.terms_of_service')
        : t('document_kind.cookie_policy');

  const title = doc?.title || fallbackTitle;

  return (
    <Dialog open={!!kind} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-6">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
            {title}
          </DialogTitle>
          {doc?.effectiveAt && (
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {isRTL ? 'تاريخ السريان: ' : 'Effective date: '}
              {new Date(doc.effectiveAt).toLocaleDateString(isRTL ? 'ar-SY' : 'en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </DialogHeader>

        <div
          className="flex-1 overflow-y-auto py-4 pr-1 text-sm text-gray-700 dark:text-zinc-300 leading-relaxed"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : doc?.contentHtml ? (
            <div
              className={`rich-text-content space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}
              style={{ direction: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}
              dangerouslySetInnerHTML={{ __html: doc.contentHtml }}
            />
          ) : (
            <div className="text-center py-10 text-gray-500 dark:text-zinc-400">
              <p className="font-semibold">{t('document.empty_title')}</p>
              <p className="text-xs mt-1">{t('document.empty_subtitle')}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const RegisterLegalConsent = ({
  error,
  defaultChecked = false,
}: RegisterLegalConsentProps) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const tAuth = useTranslations('auth');
  const tLegal = useTranslations('legal');
  const [checked, setChecked] = useState(defaultChecked);
  const [previewKind, setPreviewKind] = useState<string | null>(null);

  const { data: res } = useLegalDocuments();
  const rawDocs = res?.data?.filter((d) => d.requiresAcceptance) ?? [];

  // Fallback to Privacy Policy if list is empty or loading
  const docs: Array<Pick<LegalDocumentListItemDto, 'kind' | 'slug' | 'title'>> =
    rawDocs.length > 0
      ? rawDocs
      : [
          {
            kind: 'privacy_policy',
            slug: 'privacy-policy',
            title: tLegal('document_kind.privacy_policy'),
          },
        ];

  const separator = isRTL ? '، ' : ', ';

  const getDocTitle = (doc: Pick<LegalDocumentListItemDto, 'kind' | 'slug' | 'title'>) => {
    if (doc.title) return doc.title;
    if (doc.kind === 'privacy_policy') return tLegal('document_kind.privacy_policy');
    if (doc.kind === 'terms_of_service') return tLegal('document_kind.terms_of_service');
    if (doc.kind === 'cookie_policy') return tLegal('document_kind.cookie_policy');
    return doc.slug;
  };

  return (
    <div className="space-y-1.5 pt-1">
      <div className="flex items-start gap-2.5">
        <Checkbox
          id="acceptedLegal"
          name="acceptedLegal"
          checked={checked}
          onCheckedChange={(val) => setChecked(!!val)}
          className="mt-0.5"
        />
        <div className="text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">
          <label htmlFor="acceptedLegal" className="cursor-pointer">
            {tAuth('signup.legal.prefix')}
          </label>
          {docs.map((doc, index) => {
            const isLast = index === docs.length - 1;
            return (
              <React.Fragment key={doc.kind}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPreviewKind(doc.kind);
                  }}
                  className="inline font-medium text-emerald-600 hover:text-emerald-700 dark:text-[#ABDE3B] dark:hover:text-[#ABDE3B]/90 hover:underline mx-1"
                >
                  {getDocTitle(doc)}
                </button>
                {!isLast && <span>{separator}</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {Boolean(error) && (
        <p className="text-xs text-red-500 font-medium">{tAuth('errors.legal_required')}</p>
      )}

      <DocumentPreviewModal
        kind={previewKind}
        onClose={() => setPreviewKind(null)}
      />
    </div>
  );
};

export const OAuthLegalNotice = () => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const tAuth = useTranslations('auth');
  const tLegal = useTranslations('legal');
  const [previewKind, setPreviewKind] = useState<string | null>(null);

  const { data: res } = useLegalDocuments();
  const rawDocs = res?.data?.filter((d) => d.requiresAcceptance) ?? [];

  const docs: Array<Pick<LegalDocumentListItemDto, 'kind' | 'slug' | 'title'>> =
    rawDocs.length > 0
      ? rawDocs
      : [
          {
            kind: 'privacy_policy',
            slug: 'privacy-policy',
            title: tLegal('document_kind.privacy_policy'),
          },
        ];

  const separator = isRTL ? '، ' : ', ';

  const getDocTitle = (doc: Pick<LegalDocumentListItemDto, 'kind' | 'slug' | 'title'>) => {
    if (doc.title) return doc.title;
    if (doc.kind === 'privacy_policy') return tLegal('document_kind.privacy_policy');
    if (doc.kind === 'terms_of_service') return tLegal('document_kind.terms_of_service');
    if (doc.kind === 'cookie_policy') return tLegal('document_kind.cookie_policy');
    return doc.slug;
  };

  return (
    <div className="text-xs text-gray-400 dark:text-zinc-500 text-center leading-relaxed mt-2 px-2">
      <span>{tAuth('legal.oauth_caption_prefix')}</span>
      {docs.map((doc, index) => {
        const isLast = index === docs.length - 1;
        return (
          <React.Fragment key={doc.kind}>
            <button
              type="button"
              onClick={() => setPreviewKind(doc.kind)}
              className="inline font-medium text-emerald-600 hover:text-emerald-700 dark:text-[#ABDE3B] hover:underline mx-1"
            >
              {getDocTitle(doc)}
            </button>
            {!isLast && <span>{separator}</span>}
          </React.Fragment>
        );
      })}

      <DocumentPreviewModal
        kind={previewKind}
        onClose={() => setPreviewKind(null)}
      />
    </div>
  );
};
