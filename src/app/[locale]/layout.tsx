// import localFont from "next/font/local";
import GlobalProvider from '@/providers/global.provider';
import '../../globals.css';
import { initConfigs } from '@/config';
import { Locale, routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { getMessages } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';

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
  // const { direction } = useLangContext();
  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body>
        <NextIntlClientProvider messages={messages}>
          <GlobalProvider>{children}</GlobalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
