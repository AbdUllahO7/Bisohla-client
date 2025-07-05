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
import Box from '@/components/box/box';

const VerifyEmailPage = () => {
  const t = useTranslations('emailVerification');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [state, action] = useActionState<
    ApiResponse<SuccessResponseWithNoContent>,
    FormData
  >(sendVerificationEmailAction, defaultActionState);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-emerald-600 p-4 rounded-3xl">
              <Car className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('resend.pageTitle')}
          </h1>
          <p className="text-gray-600">
            {t('resend.pageSubtitle')}
          </p>
        </div>

        {/* Language Switcher */}
        <div className={`mb-6 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex justify-center">
            <LocaleSwitcher />
          </div>
        </div>

        {/* Verification Form Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
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

          <CardContent>
            <form action={action} className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
              {/* Email Input */}
              <DetailedInput
                placeholder={t('resend.emailPlaceholder')}
                type="email"
                name="email"
                error={state?.errors?.email}
                caption={t('resend.emailLabel')}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
              />

              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                    <h3 className="text-sm font-medium text-blue-800">
                      {t('resend.instructionsTitle')}
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>{t('resend.instructionsText')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <SubmitButton
                  title={t('resend.submitButton')}
                  submittingTitle={t('resend.submittingButton')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 space-y-4 text-center">
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

export default VerifyEmailPage;