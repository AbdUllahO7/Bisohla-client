'use client';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLocale } from 'next-intl';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import React from 'react';
import Logo from '@/components/logo';
import { useSettings } from '@/providers/settings.provider';
import { Skeleton } from '@/components/ui/skeleton';

const Footer = ({ isUserProfile }: { isUserProfile?: boolean }) => {
  const locale = useLocale(); // Get the current language
  const { getCopyrightMessage, isLoading, getAppSettings, getSocialLinks } =
    useSettings();

  const appStoreUrl = getAppSettings().app_info?.app_store_url;
  const playStoreUrl = getAppSettings().app_info?.play_store_url;
  const socialLinks = getSocialLinks();

  console.log('SOCIAL LINKS: ', socialLinks);

  return (
    <Box
      variant="column"
      className={`relative z-50   pt-10 pb-10 justify-around w-full `}
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
          <Text variant="h4" className="text-primary">
            {locale === 'ar' ? 'أنشىء اعلان' : 'Create Ad'}
          </Text>
          <Link href="/products/AddProducts" className="text-primary">
            {locale === 'ar'
              ? 'إنشىء إعلان تأجير سيارة'
              : 'Create a car rental ad'}
          </Link>
          <Link href="/products/AddProducts" className="text-primary">
            {locale === 'ar' ? 'أنشىء إعلان بيع سيارة' : 'Create a car sale ad'}
          </Link>
          <Link href="/auth/sign-in" className="text-primary">
            {locale === 'ar' ? 'أنشىء حساب' : 'Create Account'}
          </Link>
        </Box>
        <Box
          variant="column"
          className="items-start justify-start gap-8 md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] lg:items-start xs:items-center xs:mt-5"
        >
          <Text variant="h4" className="text-primary">
            {locale === 'ar' ? 'بسهولة' : 'Bishola'}
          </Text>
          <Link href="/Privacypolicy" className="text-primary">
            {locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy policy'}
          </Link>
          <Link href="/Privacypolicy" className="text-primary">
            {locale === 'ar'
              ? 'سياسة انشاء الاعلان'
              : 'Advertisement creation policy'}
          </Link>
          <Link href="/Privacypolicy" className="text-primary">
            {locale === 'ar'
              ? 'سياسية حماية البيانات'
              : 'Data Protection Policy'}
          </Link>
        </Box>
        <Box
          variant="column"
          className="items-start justify-start gap-8 md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] lg:items-start xs:items-center xs:mt-5"
        >
          <Text variant="h4" className="text-primary">
            {locale === 'ar' ? 'العنوان الرئيسي' : 'Main Title'}
          </Text>
          <Link href="/" className="text-primary">
            {locale === 'ar' ? 'الصفحة الرئيسية' : 'Home Page'}
          </Link>
          <Link href="/products?listingType=for_rent" className="text-primary">
            {locale === 'ar' ? 'الاستئجار' : 'Rent'}
          </Link>
          <Link href="/products?listingType=for_sale" className="text-primary">
            {locale === 'ar' ? ' البيع' : 'Sale'}
          </Link>
        </Box>

        {/* Subscribe */}
        <Box
          variant="column"
          className="justify-start items-start  md:w-[300px] sm:w-[400px] lg:mt-0 xs:w-[400px] "
        >
          <Text variant="lead" className="text-[600] ">
            {locale === 'ar'
              ? 'اشترك في النشرة الإخبارية لدينا'
              : 'Subscribe to our newsletter'}
          </Text>
          <Text variant="mid" className="w-full">
            {locale === 'ar'
              ? 'ابق على اطلاع على آخر الأخبار والعروض الحصرية والتحديثات المثيرة'
              : 'Stay up to date with the latest news, exclusive offers and exciting updates.'}
          </Text>
          <Box variant="center" className="flex w-full max-w-sm items-center">
            <Input
              type="email"
              placeholder={locale === 'ar' ? 'البريد الالكتروني' : 'Email'}
              className="rounded-2xl  border-secondary-text"
            />
            <Button
              type="submit"
              className="bg-primary-foreground text-primary ml-1 mr-1"
            >
              {locale === 'ar' ? 'اشتراك' : 'Subscribe'}
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
                    <Button className="bg-white shadow-none border border-primary-light h-full ">
                      <Box variant="column" className="gap-0 h-full">
                        <Text variant="small" className="text-primary-light">
                          Available on the{' '}
                        </Text>
                        <Text variant="mid" className="text-primary-light">
                          App Store{' '}
                        </Text>
                      </Box>
                      <Image
                        src="/assets/icons/apple-icon.png"
                        alt="apple"
                        width={20}
                        height={20}
                      />
                    </Button>
                  </Link>
                ) : (
                  <Button className="bg-white shadow-none border border-primary-light h-full ">
                    <Box variant="column" className="gap-0 h-full">
                      <Text variant="small" className="text-primary-light">
                        Available on the{' '}
                      </Text>
                      <Text variant="mid" className="text-primary-light">
                        App Store{' '}
                      </Text>
                    </Box>
                    <Image
                      src="/assets/icons/apple-icon.png"
                      alt="apple"
                      width={20}
                      height={20}
                    />
                  </Button>
                )}

                {playStoreUrl ? (
                  <Link href={playStoreUrl} target="_blank">
                    <Button className="bg-white shadow-none border border-primary-light h-full ">
                      <Box variant="column" className=" gap-0 h-full">
                        <Text variant="small" className="text-primary-light">
                          Available on the{' '}
                        </Text>
                        <Text variant="mid" className="text-primary-light">
                          Google Play
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
                  <Button className="bg-white shadow-none border border-primary-light h-full ">
                    <Box variant="column" className=" gap-0 h-full">
                      <Text variant="small" className="text-primary-light">
                        Available on the{' '}
                      </Text>
                      <Text variant="mid" className="text-primary-light">
                        Google Play
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
          <Logo width={153} height={33} />
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
              {socialLinks.tiktok_url && (
                <div>
                  <Link href={socialLinks.tiktok_url} target="_blank">
                    <Image
                      src={
                        socialLinks.tiktok_image ||
                        '/assets/icons/tiktokpng.png'
                      }
                      alt="TikTok"
                      width={30}
                      height={30}
                    />
                  </Link>
                </div>
              )}
              {socialLinks.instagram_url && (
                <Link href={socialLinks.instagram_url} target="_blank">
                  <Image
                    src={
                      socialLinks.instagram_image ||
                      '/assets/icons/instagram.png'
                    }
                    alt="Instagram"
                    width={20}
                    height={20}
                  />
                </Link>
              )}
              {socialLinks.facebook_url && (
                <Link href={socialLinks.facebook_url} target="_blank">
                  <Image
                    src={
                      socialLinks.facebook_image || '/assets/icons/faceBook.png'
                    }
                    alt="Facebook"
                    width={20}
                    height={20}
                  />
                </Link>
              )}
              {socialLinks.youtube_url && (
                <Link href={socialLinks.youtube_url} target="_blank">
                  <Image
                    src={
                      socialLinks.youtube_image || '/assets/icons/youtube.png'
                    }
                    alt="YouTube"
                    width={24}
                    height={24}
                  />
                </Link>
              )}
              {socialLinks.twitter_url && (
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
              {socialLinks.linkedin_url && (
                <Link href={socialLinks.linkedin_url} target="_blank">
                  <Image
                    src={
                      socialLinks.linkedin_image || '/assets/icons/linkedin.png'
                    }
                    alt="LinkedIn"
                    width={20}
                    height={20}
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
        className="container w-full mt-8 pt-8 border-t border-gray-200"
      >
        {!isLoading ? (
          <Text variant="small" className="text-primary-light text-center">
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
