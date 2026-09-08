'use client';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import React from 'react';
import Logo from '@/components/shared/logo';
import { useSettings } from '@/providers/settings.provider';
import { Skeleton } from '@/components/ui/skeleton';

const Footer = () => {
  const t = useTranslations('homePage.footer');
  const { getCopyrightMessage, isLoading, getAppSettings, getSocialLinks } =
    useSettings();

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
          <Link href="/legal/privacy-policy" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('privacyPolicy')}
          </Link>
          <Link href="/legal/terms-of-service" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('adCreationPolicy')}
          </Link>
          <Link href="/legal/cookie-policy" className="text-primary dark:text-zinc-300 hover:text-primary-light dark:hover:text-[#ABDE3B] transition-colors">
            {t('dataProtectionPolicy')}
          </Link>
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
        <Box variant="row" className="gap-2">
          {isLoading ? (
            <>
              <Skeleton className="w-8 h-8 mr-2" />
              <Skeleton className="w-8 h-8 mr-2" />
              <Skeleton className="w-8 h-8" />
            </>
          ) : (
            <>
              {socialLinks?.tiktok_url && (
                <div>
                  <Link href={socialLinks.tiktok_url} target="_blank">
                    <Image
                      src={
                        socialLinks.tiktok_image ||
                        '/assets/icons/socialIcons/icons8-tiktok-24.png'
                      }
                      alt="TikTok"
                      width={30}
                      height={30}
                    />
                  </Link>
                </div>
              )}
              {socialLinks?.instagram_url && (
                <Link href={socialLinks.instagram_url} target="_blank">
                  <Image
                    src={
                      socialLinks.instagram_image ||
                      '/assets/icons/socialIcons/icons8-instagram-24.png'
                    }
                    className=""
                    alt="Instagram"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              {socialLinks?.facebook_url && (
                <Link href={socialLinks.facebook_url} target="_blank">
                  <Image
                    src={
                      socialLinks.facebook_image ||
                      '/assets/icons/socialIcons/icons8-facebook-48.png'
                    }
                    className=""
                    alt="Facebook"
                    width={20}
                    height={20}
                  />
                </Link>
              )}
              {socialLinks?.youtube_url && (
                <Link href={socialLinks.youtube_url} target="_blank">
                  <Image
                    src={
                      socialLinks.youtube_image ||
                      '/assets/icons/socialIcons/icons8-youtube-24.png'
                    }
                    alt="YouTube"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              {socialLinks?.twitter_url && (
                <Link href={socialLinks.twitter_url} target="_blank">
                  <Image
                    src={
                      socialLinks.twitter_image || '/assets/icons/twitter.png'
                    }
                    alt="Twitter"
                    width={20}
                    height={20}
                  />
                </Link>
              )}
              {socialLinks?.linkedin_url && (
                <Link href={socialLinks.linkedin_url} target="_blank">
                  <Image
                    src={
                      socialLinks.linkedin_image ||
                      '/assets/icons/socialIcons/icons8-linkedin-24.png'
                    }
                    alt="LinkedIn"
                    width={24}
                    height={24}
                  />
                </Link>
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
