import GlobalProvider from '@/providers/global.provider';
import '../../globals.css';
import { initConfigs } from '@/config';
import { Locale, routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import NextTopLoader from 'nextjs-toploader';
import { Cairo } from 'next/font/google';

const cairo = Cairo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
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
        {/* Additional custom meta tags */}
        {/* <meta name="theme-color" content="#2C3C39" />
        <meta name="msapplication-TileColor" content="#2C3C39" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico?v=2" /> */}

        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`bg-white text-primary ${cairo.className}`}>
        <NextIntlClientProvider messages={messages}>
          <GlobalProvider>
            <NextTopLoader color="#2C3C39" height={4} showSpinner={false} />
            {children}
          </GlobalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
