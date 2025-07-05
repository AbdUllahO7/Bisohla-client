"use client"

import Box from '@/components/box/box';
import { allRoutes } from '@/constants/routes.constant';
import { Link } from '@/i18n/routing';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Car, ArrowRight, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LocaleSwitcher from '@/components/local/LocalSwitcher';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const EmailVerifiedContent = () => {
  const t = useTranslations('emailVerification');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const searchParams = useSearchParams();
  
  const status = searchParams.get('status') as 'success' | 'error' | null;
  const message = searchParams.get('message') || '';

  const isSuccess = status === 'success';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className={`p-4 rounded-3xl ${isSuccess ? 'bg-emerald-600' : 'bg-red-600'}`}>
              <Car className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('pageTitle')}
          </h1>
          <p className="text-gray-600">
            {t('pageSubtitle')}
          </p>
        </div>

        {/* Language Switcher */}
        <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex justify-center">
            <LocaleSwitcher />
          </div>
        </div>

        {/* Verification Result Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              {isSuccess ? (
                <div className="p-3 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-12 w-12 text-emerald-600" />
                </div>
              ) : (
                <div className="p-3 bg-red-100 rounded-full">
                  <XCircle className="h-12 w-12 text-red-600" />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {isSuccess ? (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">
                      {t('success.title')}
                    </h3>
                    <p className="text-sm">
                      {t('success.description')}
                    </p>
                    {message && (
                      <p className="text-xs mt-2 opacity-75">{message}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="border-red-200 bg-red-50">
                <XCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800">
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">
                      {t('error.title')}
                    </h3>
                    <p className="text-sm">
                      {t('error.description')}
                    </p>
                    {message && (
                      <p className="text-xs mt-2 opacity-75">{message}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {isSuccess ? (
                <Link href={allRoutes.auth.children.signIn.path} className="block">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
                    <span className="flex items-center justify-center gap-2">
                      {t('success.signInButton')}
                      <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                    </span>
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3">
                  <Link href={allRoutes.auth.children.verifyEmail.path} className="block">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4" />
                        {t('error.resendButton')}
                      </span>
                    </Button>
                  </Link>
                  
                  <Link href={allRoutes.auth.children.signIn.path} className="block">
                    <Button 
                      variant="outline" 
                      className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-3 px-4 rounded-xl transition-all duration-200"
                    >
                      <span className="flex items-center justify-center gap-2">
                        {t('error.backButton')}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <div className="text-sm text-gray-600">
            {t('footer.needHelp')}{' '}
            <Link
              href="/support" // Replace with your actual support route
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {t('footer.contactSupport')}
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{t('trustIndicators.secure')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{t('trustIndicators.support')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailVerifiedPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <EmailVerifiedContent />
    </Suspense>
  );
};

export default EmailVerifiedPage;