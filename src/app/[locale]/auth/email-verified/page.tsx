"use client"

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
import Image from 'next/image';

const EmailVerifiedContent = () => {
  const t = useTranslations('emailVerification');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const searchParams = useSearchParams();
  
  const status = searchParams.get('status') as 'success' | 'error' | null;
  const message = searchParams.get('message') || '';

  const isSuccess = status === 'success';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="w-full flex flex-col space-y-4">
        {/* Logo and Header - Compact */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className={`p-2.5 rounded-2xl shadow-lg ${isSuccess ? 'bg-emerald-600' : 'bg-red-600'}`}>
               <Image
                  src="/assets/images/logo/bishola.png"
                  alt="Bishola Logo"
                  width={120}
                  height={120}
                  className="relative mx-auto transition-all duration-700 hover:scale-110 drop-shadow-2xl"
                  priority
                />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {t('pageTitle')}
          </h1>
          <p className="text-gray-600 text-sm">
            {t('pageSubtitle')}
          </p>
        </div>

        {/* Language Switcher - Compact */}
        <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
          <LocaleSwitcher />
        </div>

        {/* Verification Result Card - Compact */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm w-full">
          <CardHeader className="text-center pb-3">
            <div className="flex justify-center mb-3">
              {isSuccess ? (
                <div className="p-2 bg-emerald-100 rounded-full">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              ) : (
                <div className="p-2 bg-red-100 rounded-full">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-4">
            <div className="space-y-4">
              {isSuccess ? (
                <Alert className="border-emerald-200 bg-emerald-50">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    <div className="text-center">
                      <h3 className="font-semibold text-base mb-1">
                        {t('success.title')}
                      </h3>
                      <p className="text-sm">
                        {t('success.description')}
                      </p>
                      {message && (
                        <p className="text-xs mt-1 opacity-75">{message}</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <div className="text-center">
                      <h3 className="font-semibold text-base mb-1">
                        {t('error.title')}
                      </h3>
                      <p className="text-sm">
                        {t('error.description')}
                      </p>
                      {message && (
                        <p className="text-xs mt-1 opacity-75">{message}</p>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons - More compact */}
              <div className="space-y-2 pt-2">
                {isSuccess ? (
                  <Link href={allRoutes.auth.children.signIn.path} className="block">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
                      <span className="flex items-center justify-center gap-2">
                        {t('success.signInButton')}
                        <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
                      </span>
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-2">
                    <Link href={allRoutes.auth.children.verifyEmail.path} className="block">
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg">
                        <span className="flex items-center justify-center gap-2">
                          <RefreshCw className="h-4 w-4" />
                          {t('error.resendButton')}
                        </span>
                      </Button>
                    </Link>
                    
                    <Link href={allRoutes.auth.children.signIn.path} className="block">
                      <Button 
                        variant="outline" 
                        className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200"
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
            </div>
          </CardContent>
        </Card>

        {/* Footer Links - More compact */}
        <div className="text-center">
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

        {/* Trust Indicators - More compact */}
      
      </div>
    </div>
  );
};

const EmailVerifiedPage = () => {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md mx-auto flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    }>
      <EmailVerifiedContent />
    </Suspense>
  );
};

export default EmailVerifiedPage;