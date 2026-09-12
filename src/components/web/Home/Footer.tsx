'use client';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import React, { useState, useEffect } from 'react';
import Logo from '@/components/shared/logo';
import { useSettings } from '@/providers/settings.provider';
import { Skeleton } from '@/components/ui/skeleton';
import { useLegalDocuments } from '@/core/infrastructure-adapters/use-actions/legal/legal.use-actions';

// Resilient Social Icon Link with fallback chain:
// 1. Custom image URL (from admin)
// 2. Local high-res green asset
// 3. Crisp inline SVG vector
const SocialIconLink: React.FC<{
  href: string;
  name: string;
  imageUrl?: string;
  fallbackSrc?: string;
  svgFallback: React.ReactNode;
}> = ({ href, name, imageUrl, fallbackSrc, svgFallback }) => {
  const [src, setSrc] = useState<string | null>(imageUrl || fallbackSrc || null);
  const [showSvg, setShowSvg] = useState<boolean>(!imageUrl && !fallbackSrc);

  useEffect(() => {
    setSrc(imageUrl || fallbackSrc || null);
    setShowSvg(!imageUrl && !fallbackSrc);
  }, [imageUrl, fallbackSrc]);

  const handleError = () => {
    if (src && fallbackSrc && src !== fallbackSrc) {
      setSrc(fallbackSrc);
    } else {
      setShowSvg(true);
    }
  };

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={name}
      className="w-8 h-8 rounded-full flex items-center justify-center text-[#3b8714] dark:text-[#ABDE3B] hover:opacity-80 hover:scale-110 transition-all duration-200"
    >
      {!showSvg && src ? (
        <img
          src={src}
          alt={name}
          width={24}
          height={24}
          className="w-6 h-6 object-contain"
          onError={handleError}
        />
      ) : (
        <span className="w-6 h-6 flex items-center justify-center text-[#3b8714] dark:text-[#ABDE3B]">
          {svgFallback}
        </span>
      )}
    </Link>
  );
};

const FacebookSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramSvg = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TikTokSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.82 4.49 6.31 6.31 0 0 0 1.86-4.49V8.78a8.18 8.18 0 0 0 4.91 1.63v-3.72z" />
  </svg>
);

const YouTubeSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const TwitterSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z"/>
  </svg>
);

const WhatsAppSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.14-.25-.02-.39.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1s.9 2.44 1.03 2.61c.13.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.59.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.1-.22-.17-.47-.3z"/>
  </svg>
);

const TelegramSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z"/>
  </svg>
);

const SnapchatSvg = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M12.035 1.5c-4.425 0-7.009 3.235-7.009 6.275 0 1.25.438 2.568.91 3.513.193.387.24.63.14.848-.127.279-.523.512-.993.682-.384.14-.766.333-.766.753 0 .376.326.65.753.754.673.164 1.346.068 1.895-.148.423-.166.72-.083.895.148.33.438.995 1.346 2.378 1.58.55.093.882.35 1.134.707.13.185.195.405.342.502.268.177.625.04.993-.053.642-.162 1.392-.224 2.32-.224.928 0 1.677.062 2.32.224.368.093.725.23 1.01.053.14-.097.204-.317.334-.502.253-.357.585-.614 1.134-.707 1.383-.234 2.048-1.142 2.378-1.58.175-.231.472-.314.895-.148.55.216 1.222.312 1.895.148.427-.104.753-.378.753-.754 0-.42-.382-.613-.766-.753-.47-.17-.866-.403-.993-.682-.1-.218-.053-.46.14-.848.472-.945.91-2.263.91-3.513 0-3.04-2.584-6.275-7.009-6.275z"/>
  </svg>
);

const Footer = () => {
  const t = useTranslations('homePage.footer');
  const tLegal = useTranslations('legal');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { getCopyrightMessage, isLoading, getAppSettings, getSocialLinks } =
    useSettings();
  const { data: legalDocsResponse } = useLegalDocuments();
  const legalDocs = legalDocsResponse?.data;

  const appStoreUrl = getAppSettings()?.app_info?.app_store_url;
  const playStoreUrl = getAppSettings()?.app_info?.play_store_url;
  const socialLinks = getSocialLinks();


  return (
    <Box
      variant="column"
      className={`relative z-10   pt-10 pb-10 justify-around w-full `}
    >
      <Box
        variant="row"
        className="w-full container justify-between  md:flex-wrap xs:flex-wrap"
      >
        {/*  create ad */}
        <Box
          variant="column"
          className="items-start justify-start gap-8 md:w-[300px] sm:w-[400px] xs:w-[400px] lg:mt-0 lg:items-start xs:items-center xs:mt-5"
        >
          <Text variant="h4" className="text-primary dark:text-[#ABDE3B] font-bold">
            {t('createAd')}
          </Text>
          <Link href="/products/AddProducts" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('createRentalAd')}
          </Link>
          <Link href="/products/AddProducts" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('createSaleAd')}
          </Link>
          <Link href="/auth/sign-in" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('createAccount')}
          </Link>
        </Box>
        <Box
          variant="column"
          className="items-start justify-start gap-8 md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] lg:items-start xs:items-center xs:mt-5"
        >
          <Text variant="h4" className="text-primary dark:text-[#ABDE3B] font-bold">
            {t('brandName')}
          </Text>
          {legalDocs && legalDocs.length > 0 ? (
            legalDocs.map((doc) => {
              const href = `/legal/${doc.slug || doc.kind.replace(/_/g, '-')}`;
              const label =
                doc.title ||
                (doc.kind === 'privacy_policy'
                  ? tLegal('document_kind.privacy_policy')
                  : doc.kind === 'terms_of_service'
                    ? tLegal('document_kind.terms_of_service')
                    : tLegal('document_kind.cookie_policy'));
              return (
                <Link
                  key={doc.documentId || doc.slug}
                  href={href}
                  className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors"
                >
                  {label}
                </Link>
              );
            })
          ) : (
            <>
              <Link
                href="/legal/privacy-policy"
                className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors"
              >
                {tLegal('document_kind.privacy_policy')}
              </Link>
              <Link
                href="/legal/terms-of-service"
                className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors"
              >
                {tLegal('document_kind.terms_of_service')}
              </Link>
              <Link
                href="/legal/cookie-policy"
                className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors"
              >
                {tLegal('document_kind.cookie_policy')}
              </Link>
            </>
          )}
        </Box>
        <Box
          variant="column"
          className="items-start justify-start gap-8 md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] lg:items-start xs:items-center xs:mt-5"
        >
          <Text variant="h4" className="text-primary dark:text-[#ABDE3B] font-bold">
            {t('mainTitle')}
          </Text>
          <Link href="/" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('homePage')}
          </Link>
          <Link href="/products?listingOfferType=for_rent" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('rent')}
          </Link>
          <Link href="/products?listingOfferType=for_sale" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('sale')}
          </Link>
        </Box>

        {/* Subscribe */}
        <Box
          variant="column"
          className="justify-start items-start  md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] "
        >
          <Text variant="lead" className="text-[600] text-primary dark:text-zinc-100 font-semibold">
            {t('subscribeNewsletter')}
          </Text>
          <Text variant="mid" className="w-full text-secondary-text dark:text-zinc-400">
            {t('newsletterDesc')}
          </Text>
          <Box variant="center" className="flex w-full max-w-sm items-center">
            <Input
              type="email"
              placeholder={t('email')}
              className="rounded-2xl border-secondary-text dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <Button
              type="submit"
              className="bg-primary-foreground text-primary ml-1 mr-1"
            >
              {t('subscribe')}
            </Button>
          </Box>
          <Box variant="row" className="mt-5 w-full">
            {isLoading ? (
              <>
                <Skeleton className="w-32 h-12 mr-2" />
                <Skeleton className="w-32 h-12" />
              </>
            ) : (
              <>
                {appStoreUrl ? (
                  <Link href={appStoreUrl} target="_blank">
                    <Button className="bg-white dark:bg-zinc-900 shadow-none border border-primary-light dark:border-zinc-800 h-full ">
                      <Box variant="column" className="gap-0 h-full">
                        <Text variant="small" className="text-primary-light dark:text-zinc-300">
                          {t('availableOn')}{' '}
                        </Text>
                        <Text variant="mid" className="text-primary-light dark:text-zinc-100">
                          {t('appStore')}{' '}
                        </Text>
                      </Box>
                      <Image
                        src="/assets/icons/apple-icon.png"
                        alt="apple"
                        width={20}
                        height={20}
                        className="dark:invert"
                      />
                    </Button>
                  </Link>
                ) : (
                  <Button className="bg-white dark:bg-zinc-900 shadow-none border border-primary-light dark:border-zinc-800 h-full ">
                    <Box variant="column" className="gap-0 h-full">
                      <Text variant="small" className="text-primary-light dark:text-zinc-300">
                        {t('availableOn')}{' '}
                      </Text>
                      <Text variant="mid" className="text-primary-light dark:text-zinc-100">
                        {t('appStore')}{' '}
                      </Text>
                    </Box>
                    <Image
                      src="/assets/icons/apple-icon.png"
                      alt="apple"
                      width={20}
                      height={20}
                      className="dark:invert"
                    />
                  </Button>
                )}

                {playStoreUrl ? (
                  <Link href={playStoreUrl} target="_blank">
                    <Button className="bg-white dark:bg-zinc-900 shadow-none border border-primary-light dark:border-zinc-800 h-full ">
                      <Box variant="column" className=" gap-0 h-full">
                        <Text variant="small" className="text-primary-light dark:text-zinc-300">
                          {t('availableOn')}{' '}
                        </Text>
                        <Text variant="mid" className="text-primary-light dark:text-zinc-100">
                          {t('playStore')}
                        </Text>
                      </Box>
                      <Image
                        src="/assets/icons/play-google.png"
                        alt="google play"
                        width={30}
                        height={30}
                      />
                    </Button>
                  </Link>
                ) : (
                  <Button className="bg-white dark:bg-zinc-900 shadow-none border border-primary-light dark:border-zinc-800 h-full ">
                    <Box variant="column" className=" gap-0 h-full">
                      <Text variant="small" className="text-primary-light dark:text-zinc-300">
                        {t('availableOn')}{' '}
                      </Text>
                      <Text variant="mid" className="text-primary-light dark:text-zinc-100">
                        {t('playStore')}
                      </Text>
                    </Box>
                    <Image
                      src="/assets/icons/play-google.png"
                      alt="google play"
                      width={30}
                      height={30}
                    />
                  </Button>
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        variant="rowBetween"
        className="justify-between container w-full mt-10"
      >
        <Box className="">
          <Logo width={153} height={33} className="" />
        </Box>

        {/* social */}
        <Box variant="row" className="gap-2 items-center flex-wrap">
          {isLoading ? (
            <>
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
              <Skeleton className="w-8 h-8 rounded-full" />
            </>
          ) : (
            <>
              {socialLinks?.tiktok_url && (
                <SocialIconLink
                  href={socialLinks.tiktok_url}
                  name="TikTok"
                  imageUrl={socialLinks.tiktok_image}
                  fallbackSrc="/assets/icons/socialIcons/tiktok.webp"
                  svgFallback={TikTokSvg}
                />
              )}
              {socialLinks?.instagram_url && (
                <SocialIconLink
                  href={socialLinks.instagram_url}
                  name="Instagram"
                  imageUrl={socialLinks.instagram_image}
                  fallbackSrc="/assets/icons/socialIcons/instagram.webp"
                  svgFallback={InstagramSvg}
                />
              )}
              {socialLinks?.facebook_url && (
                <SocialIconLink
                  href={socialLinks.facebook_url}
                  name="Facebook"
                  imageUrl={socialLinks.facebook_image}
                  fallbackSrc="/assets/icons/socialIcons/facebook.webp"
                  svgFallback={FacebookSvg}
                />
              )}
              {socialLinks?.youtube_url && (
                <SocialIconLink
                  href={socialLinks.youtube_url}
                  name="YouTube"
                  imageUrl={socialLinks.youtube_image}
                  fallbackSrc="/assets/icons/socialIcons/icons8-youtube-24.png"
                  svgFallback={YouTubeSvg}
                />
              )}
              {socialLinks?.twitter_url && (
                <SocialIconLink
                  href={socialLinks.twitter_url}
                  name="Twitter"
                  imageUrl={socialLinks.twitter_image}
                  fallbackSrc="/assets/icons/twitter.png"
                  svgFallback={TwitterSvg}
                />
              )}
              {socialLinks?.linkedin_url && (
                <SocialIconLink
                  href={socialLinks.linkedin_url}
                  name="LinkedIn"
                  imageUrl={socialLinks.linkedin_image}
                  fallbackSrc="/assets/icons/socialIcons/icons8-linkedin-24.png"
                  svgFallback={LinkedInSvg}
                />
              )}
              {socialLinks?.whatsapp_url && (
                <SocialIconLink
                  href={socialLinks.whatsapp_url}
                  name="WhatsApp"
                  imageUrl={socialLinks.whatsapp_image}
                  fallbackSrc="/assets/icons/socialIcons/icons8-whatsapp-24.png"
                  svgFallback={WhatsAppSvg}
                />
              )}
              {socialLinks?.telegram_url && (
                <SocialIconLink
                  href={socialLinks.telegram_url}
                  name="Telegram"
                  imageUrl={socialLinks.telegram_image}
                  svgFallback={TelegramSvg}
                />
              )}
              {socialLinks?.snapchat_url && (
                <SocialIconLink
                  href={socialLinks.snapchat_url}
                  name="Snapchat"
                  imageUrl={socialLinks.snapchat_image}
                  svgFallback={SnapchatSvg}
                />
              )}
            </>
          )}
        </Box>
      </Box>

      {/* Copyright */}
      <Box
        variant="center"
        className="container w-full mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800"
      >
        {!isLoading ? (
          <Text variant="small" className="text-primary-light dark:text-zinc-400 text-center">
            {getCopyrightMessage()}
          </Text>
        ) : (
          <Skeleton className="w-20 h-2" />
        )}
      </Box>
    </Box>
  );
};

export default Footer;
