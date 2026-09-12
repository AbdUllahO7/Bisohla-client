import { redirect } from '@/i18n/routing';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPublicSettings } from '@/core/infrastructure-adapters/actions/settings/settings.actions';
import Logo from '@/components/shared/logo';
import { Sparkles, Info } from 'lucide-react';
import 'quill/dist/quill.snow.css';

interface PrivacyPolicyPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function PrivacyPolicyLegacyRedirectPage({
  params,
  searchParams,
}: PrivacyPolicyPageProps) {
  const { locale } = await params;
  const { tab } = await searchParams;
  const isRTL = locale === 'ar';
  const t = await getTranslations('legal');

  // Handle redirects for document tabs
  if (tab === 'terms') {
    redirect({ href: '/legal/terms-of-service', locale });
  }

  if (tab === 'cookies') {
    redirect({ href: '/legal/cookie-policy', locale });
  }

  if (tab !== 'about') {
    redirect({ href: '/legal/privacy-policy', locale });
  }

  // If tab === 'about', render the About page content
  const settingsRes = await getPublicSettings();
  const settingsData = settingsRes?.data?.[locale] || settingsRes?.data;
  const aboutHtml = settingsData?.general?.content?.about_html;
  const copyrightMessage =
    settingsData?.general?.site_info?.copyright_message ||
    (isRTL
      ? '© 2026 بسهولة. جميع الحقوق محفوظة.'
      : '© 2026 Bishola. All rights reserved.');

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

      {/* Hero Section */}
      <div
        className="relative overflow-hidden py-16 md:py-24"
        style={{
          background: 'linear-gradient(135deg, #2C3C39 0%, #198341 100%)',
        }}
      >
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 md:px-8 text-white">
          <div className="space-y-4">
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(171, 222, 59, 0.2)' }}
            >
              <Sparkles className="w-4 h-4" style={{ color: '#ABDE3B' }} />
              <span
                className="text-xs sm:text-sm font-semibold"
                style={{ color: '#ABDE3B' }}
              >
                {t('pages.about.title')}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              {isRTL ? 'عن منصة بسهولة' : 'About Bishola'}
            </h1>
            <p className="text-base sm:text-lg text-white/90 max-w-2xl leading-relaxed">
              {isRTL
                ? 'سوق إلكتروني متكامل يجعل البيع والشراء والإيجار أمراً سهلاً وموثوقاً.'
                : 'A comprehensive marketplace making buying, selling, and renting seamless and reliable.'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        {aboutHtml ? (
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md rounded-3xl shadow-xl p-6 sm:p-10 md:p-14 border border-gray-100 dark:border-zinc-800">
            <div
              className={`rich-text-content ql-editor text-gray-800 dark:text-zinc-200 leading-relaxed space-y-6 ${
                isRTL ? 'ql-direction-rtl text-right' : 'text-left'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
              style={{
                overflowY: 'visible',
                padding: 0,
                direction: isRTL ? 'rtl' : 'ltr',
                textAlign: isRTL ? 'right' : 'left',
              }}
              dangerouslySetInnerHTML={{ __html: aboutHtml }}
            />
            <style>{`
              [dir="rtl"] .rich-text-content,
              [dir="rtl"] .rich-text-content * {
                direction: rtl !important;
                text-align: right !important;
              }
              [dir="rtl"] .rich-text-content .ql-align-center {
                text-align: center !important;
              }
            `}</style>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 rounded-3xl p-10 md:p-16 text-center space-y-4 shadow-sm">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Info className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">
              {isRTL ? 'عن بسهولة' : 'About Bishola'}
            </h2>
            <p className="text-gray-600 dark:text-zinc-400 max-w-md mx-auto text-sm leading-relaxed">
              {isRTL
                ? 'مرحباً بكم في منصة بسهولة. محتوى هذه الصفحة قيد التحديث.'
                : 'Welcome to Bishola. Content is currently being updated.'}
            </p>
          </div>
        )}

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
