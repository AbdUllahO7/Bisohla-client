import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { getLegalDocumentByKind } from '@/core/infrastructure-adapters/actions/legal/legal.actions';
import { getPublicSettings } from '@/core/infrastructure-adapters/actions/settings/settings.actions';
import Logo from '@/components/shared/logo';
import { Sparkles, FileText, Calendar, AlertCircle } from 'lucide-react';
import 'quill/dist/quill.snow.css';

export const revalidate = 3600;

interface LegalPageProps {
  params: Promise<{
    locale: string;
    kind: string;
  }>;
}

const KIND_MAPPING: Record<string, string> = {
  'privacy-policy': 'privacy_policy',
  'privacy_policy': 'privacy_policy',
  'terms-of-service': 'terms_of_service',
  'terms_of_service': 'terms_of_service',
  'cookie-policy': 'cookie_policy',
  'cookie_policy': 'cookie_policy',
};

export async function generateMetadata({
  params,
}: LegalPageProps): Promise<Metadata> {
  const { kind, locale } = await params;
  const isRTL = locale === 'ar';
  const t = await getTranslations('legal');

  const normalizedKind = KIND_MAPPING[kind];
  if (!normalizedKind) {
    return {
      title: isRTL ? 'مستند غير موجود' : 'Document Not Found',
    };
  }

  const res = await getLegalDocumentByKind(normalizedKind);
  const fallbackTitle =
    normalizedKind === 'privacy_policy'
      ? t('pages.privacy.title')
      : normalizedKind === 'terms_of_service'
        ? t('pages.terms.title')
        : t('pages.cookies.title');

  const title = res.data?.title || fallbackTitle;

  return {
    title: `${title} | ${isRTL ? 'بسهولة' : 'Bishola'}`,
    description:
      res.data?.summary ||
      (isRTL
        ? `الشروط والمستندات القانونية لمنصة بسهولة - ${title}`
        : `Legal documents and terms for Bishola - ${title}`),
  };
}

export default async function LegalDocumentPage({ params }: LegalPageProps) {
  const { kind, locale } = await params;
  const isRTL = locale === 'ar';
  const t = await getTranslations('legal');

  const normalizedKind = KIND_MAPPING[kind];
  if (!normalizedKind) {
    notFound();
  }

  // 1. Fetch document from API
  const res = await getLegalDocumentByKind(normalizedKind);

  // 2. Fetch public settings for brand footer and privacy fallback
  const settingsRes = await getPublicSettings();
  const settingsData = settingsRes?.data?.[locale] || settingsRes?.data;
  const copyrightMessage =
    settingsData?.general?.site_info?.copyright_message ||
    (isRTL
      ? '© 2026 بسهولة. جميع الحقوق محفوظة.'
      : '© 2026 Bishola. All rights reserved.');

  let doc = res.data;
  let isUsingPrivacyFallback = false;

  // 404-specific fallback for privacy policy
  if (!doc && normalizedKind === 'privacy_policy' && res.status === 404) {
    const privacyHtml = settingsData?.general?.content?.privacy_html;
    if (privacyHtml) {
      isUsingPrivacyFallback = true;
      doc = {
        documentId: 0,
        kind: 'privacy_policy',
        slug: 'privacy-policy',
        requiresAcceptance: true,
        version: 1,
        effectiveAt: null,
        publishedAt: null,
        title: t('pages.privacy.title'),
        contentHtml: privacyHtml,
        summary: null,
      };
    }
  }

  const fallbackTitle =
    normalizedKind === 'privacy_policy'
      ? t('pages.privacy.title')
      : normalizedKind === 'terms_of_service'
        ? t('pages.terms.title')
        : t('pages.cookies.title');

  const title = doc?.title || fallbackTitle;
  const contentHtml = doc?.contentHtml;
  const isUnpublishedOrEmpty = !contentHtml || contentHtml.trim() === '';

  return (
    <div
      className={`min-h-screen w-full bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 ${
        isRTL ? 'rtl' : 'ltr'
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-20 start-10 w-96 h-96 rounded-full opacity-5 animate-pulse"
          style={{ backgroundColor: '#ABDE3B' }}
        />
        <div
          className="absolute bottom-20 end-10 w-[500px] h-[500px] rounded-full opacity-5 animate-pulse"
          style={{ backgroundColor: '#198341', animationDelay: '1s' }}
        />
      </div>

      {/* Hero Header */}
      <div
        className="relative overflow-hidden py-16 md:py-24"
        style={{
          background: 'linear-gradient(135deg, #2C3C39 0%, #198341 100%)',
        }}
      >
        <div
          className="absolute top-0 end-0 w-96 h-96 rounded-full opacity-10"
          style={{
            backgroundColor: '#ABDE3B',
            transform: isRTL
              ? 'translate(-30%, -30%)'
              : 'translate(30%, -30%)',
          }}
        />
        <div
          className="absolute bottom-0 start-0 w-80 h-80 rounded-full opacity-10"
          style={{
            backgroundColor: '#ABDE3B',
            transform: isRTL
              ? 'translate(30%, 30%)'
              : 'translate(-30%, 30%)',
          }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-white">
          <div className={`space-y-4 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(171, 222, 59, 0.2)' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#ABDE3B' }} />
              <span
                className="text-xs sm:text-sm font-semibold"
                style={{ color: '#ABDE3B' }}
              >
                {t('settings.section')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {title}
            </h1>

            {doc?.summary && (
              <p className="text-base sm:text-lg text-white/90 max-w-3xl leading-relaxed">
                {doc.summary}
              </p>
            )}

            {doc?.effectiveAt && (
              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 pt-2">
                <Calendar className="w-4 h-4 text-[#ABDE3B]" />
                <span>
                  {isRTL ? 'تاريخ السريان: ' : 'Effective Date: '}
                  {new Date(doc.effectiveAt).toLocaleDateString(
                    isRTL ? 'ar-SY' : 'en-US',
                    {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    },
                  )}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        {isUnpublishedOrEmpty ? (
          <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-3xl p-10 md:p-16 text-center space-y-4 shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              {t('document.empty_title')}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
              {t('document.empty_subtitle')}
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-10 md:p-14 border border-gray-100 dark:border-zinc-800">
            <div
              className={`rich-text-content ql-editor legal-document-content text-gray-800 dark:text-zinc-200 leading-relaxed space-y-6 ${
                isRTL ? 'ql-direction-rtl text-right' : 'text-left'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{
                overflowY: 'visible',
                padding: 0,
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
              }}
              dangerouslySetInnerHTML={{ __html: contentHtml }}
            />
          </div>
        )}

        <style>{`
          .legal-document-content.ql-editor {
            border: none !important;
            padding: 0 !important;
          }
          [dir="rtl"] .legal-document-content,
          [dir="rtl"] .legal-document-content.ql-editor,
          .legal-document-content[dir="rtl"] {
            direction: rtl !important;
            text-align: right !important;
          }
          [dir="rtl"] .legal-document-content p,
          [dir="rtl"] .legal-document-content h1,
          [dir="rtl"] .legal-document-content h2,
          [dir="rtl"] .legal-document-content h3,
          [dir="rtl"] .legal-document-content h4,
          [dir="rtl"] .legal-document-content h5,
          [dir="rtl"] .legal-document-content h6,
          [dir="rtl"] .legal-document-content li,
          [dir="rtl"] .legal-document-content div,
          [dir="rtl"] .legal-document-content span,
          [dir="rtl"] .legal-document-content blockquote {
            direction: rtl !important;
            text-align: right !important;
          }
          [dir="rtl"] .legal-document-content .ql-align-center {
            text-align: center !important;
          }
          [dir="rtl"] .legal-document-content .ql-align-right {
            text-align: right !important;
          }
          [dir="rtl"] .legal-document-content .ql-align-left {
            text-align: left !important;
          }
          [dir="rtl"] .legal-document-content ul,
          [dir="rtl"] .legal-document-content ol {
            padding-right: 2em !important;
            padding-left: 0 !important;
            direction: rtl !important;
          }
          [dir="ltr"] .legal-document-content,
          [dir="ltr"] .legal-document-content.ql-editor,
          .legal-document-content[dir="ltr"] {
            direction: ltr !important;
            text-align: left !important;
          }
        `}</style>

        {/* Brand Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo width={120} height={26} />
          {copyrightMessage && (
            <p className="text-xs text-gray-500 dark:text-zinc-400 text-center sm:text-end">
              {copyrightMessage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
