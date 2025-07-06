'use client';

import DetailedInput from '@/components/detailed-input';
import FormStateMessage from '@/components/form-state-message';
import SubmitButton from '@/components/submit-button';
import { allRoutes } from '@/constants/routes.constant';
import { Link } from '@/i18n/routing';
import {
  ApiResponse,
  defaultActionState,
} from '@/interfaces/api-response.interface';
import { useActionState } from 'react';
import { sendVerificationEmailAction } from '../actions';
import { SuccessResponseWithNoContent } from '@/core/entities/api/success.response';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Car, Mail, CheckCircle, ArrowRight, UserPlus, LogIn } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LocaleSwitcher from '@/components/local/LocalSwitcher';
import Image from 'next/image';

const VerifyEmailPage = () => {
  const t = useTranslations('emailVerification');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [state, action] = useActionState<
    ApiResponse<SuccessResponseWithNoContent>,
    FormData
  >(sendVerificationEmailAction, defaultActionState);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="w-full flex flex-col space-y-4">
        {/* Logo and Header - Compact */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-3">
            <div className=" p-2.5 rounded-2xl shadow-lg">
                <Image
                    src="/assets/images/logo/bishola.png"
                    alt="Bishola Logo"
                    width={100}
                    height={100}
                    className="relative mx-auto transition-all duration-700 hover:scale-110 drop-shadow-2xl"
                    priority
                  />
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
            {t('resend.pageTitle')}
          </h1>
          <p className="text-gray-600 text-sm">
            {t('resend.pageSubtitle')}
          </p>
        </div>

        {/* Language Switcher - Compact */}
        <div className={`flex ${isRTL ? "justify-start" : "justify-end"}`}>
          <LocaleSwitcher />
        </div>

        {/* Verification Form Card - Compact */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm w-full">
          <CardHeader className="space-y-1 pb-3">
            <FormStateMessage state={state} />

            {/* Success Message */}
            {state.success && (
              <Alert className="border-emerald-200 bg-emerald-50">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription className="text-emerald-800">
                  <div className="text-center">
                    <p className="text-sm font-medium">
                      {t('resend.successMessage')}
                    </p>
                    <p className="text-xs mt-1 opacity-75">
                      {t('resend.checkInbox')}
                    </p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-4">
            <form action={action} className={`space-y-4 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
              {/* Email Input */}
              <DetailedInput
                placeholder={t('resend.emailPlaceholder')}
                type="email"
                name="email"
                error={state?.errors?.email}
                caption={t('resend.emailLabel')}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
              />

              {/* Instructions - More compact */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail className="h-4 w-4 text-blue-400" />
                  </div>
                  <div className={`${isRTL ? 'mr-2' : 'ml-2'}`}>
                    <h3 className="text-xs font-medium text-blue-800">
                      {t('resend.instructionsTitle')}
                    </h3>
                    <div className="mt-1 text-xs text-blue-700">
                      <p>{t('resend.instructionsText')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button - More compact */}
              <div className="pt-1">
                <SubmitButton
                  title={t('resend.submitButton')}
                  submittingTitle={t('resend.submittingButton')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links - More compact */}
        <div className="space-y-2 text-center">
          <div className="text-sm text-gray-600">
            {t('footer.newToBishola')}{' '}
            <Link
              href={allRoutes.auth.children.register.path}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
            >
              {t('footer.registerNow')}
              <UserPlus className="h-3 w-3" />
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            {t('footer.alreadyVerified')}{' '}
            <Link
              href={allRoutes.auth.children.signIn.path}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
            >
              {t('footer.signInNow')}
              <LogIn className="h-3 w-3" />
            </Link>
          </div>
          <div className="text-sm text-gray-600">
            <Link
              href="/"
              className="font-medium text-gray-700 hover:text-emerald-600 transition-colors inline-flex items-center gap-1"
            >
              {t('footer.backToHome')}
              <ArrowRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>

        {/* Trust Indicators - More compact */}
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{t('trustIndicators.secure')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span>{t('trustIndicators.support')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;