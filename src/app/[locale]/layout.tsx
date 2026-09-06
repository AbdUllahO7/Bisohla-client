// app/[locale]/layout.tsx
import GlobalProvider from '@/providers/global.provider';
import '../../globals.css';
import { initConfigs } from '@/core/config';
import { Locale, routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import NextTopLoader from 'nextjs-toploader';
import { Cairo } from 'next/font/google';
import AppDeepLink from '@/components/shared/AppDeepLink';
import SmartAppBanner from '@/components/shared/SmartAppBanner';
import AppDownloadModalProvider from '@/providers/AppDownloadModalProvider';
import { Toaster } from '@/components/ui/toaster';

const cairo = Cairo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  initConfigs();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    console.log('Service Worker registered with scope: ', reg.scope);
                  }).catch(function(err) {
                    console.error('Service Worker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </head>
      <body className={`bg-white dark:bg-background text-primary dark:text-foreground ${cairo.className}`}>
        <NextIntlClientProvider messages={messages}>
          <GlobalProvider>
            <NextTopLoader color="#2C3C39" height={4} showSpinner={false} />

            <AppDeepLink />

            <SmartAppBanner />

            {children}
            {/* <AppDownloadModalProvider /> */}
            <Toaster />
          </GlobalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
