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
import { resetPasswordAction } from '../actions';
import { SuccessResponseWithNoContent } from '@/core/entities/api/success.response';
import { useTranslations, useLocale } from 'next-intl';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Car, Lock, CheckCircle, ArrowRight, LogIn, Shield, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import LocaleSwitcher from '@/components/local/LocalSwitcher';

const ResetPasswordForm = ({ token }: { token: string }) => {
  const t = useTranslations('resetPassword');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [state, action] = useActionState<
    ApiResponse<SuccessResponseWithNoContent>,
    FormData
  >(resetPasswordAction, defaultActionState);

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

        {/* Reset Password Form Card */}
        <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <FormStateMessage state={state} />

            
          </CardHeader>

          <CardContent>
            <form action={action} className={`space-y-6 ${isRTL ? "rtl" : "ltr"}`} dir={isRTL ? "rtl" : "ltr"}>
              {/* Hidden Token Input */}
              <input type="hidden" name="token" readOnly value={token} />

              {/* Password Requirements Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className={`${isRTL ? 'mr-3' : 'ml-3'}`}>
                    <h3 className="text-sm font-medium text-blue-800">
                      {t('passwordRequirements.title')}
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>{t('passwordRequirements.minLength')}</li>
                        <li>{t('passwordRequirements.specialChar')}</li>
                        <li>{t('passwordRequirements.upperLower')}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Password Input */}
              <DetailedInput
                placeholder={t('newPasswordPlaceholder')}
                type="password"
                name="password"
                error={state?.errors?.password}
                caption={t('newPasswordLabel')}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />

              {/* Password Confirmation Input */}
              <DetailedInput
                name="passwordConfirmation"
                placeholder={t('confirmPasswordPlaceholder')}
                type="password"
                error={state.errors?.passwordConfirmation}
                caption={t('confirmPasswordLabel')}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />

             
              {/* Submit Button */}
              <div className="pt-2">
                <SubmitButton
                  title={t('submitButton')}
                  submittingTitle={t('submittingButton')}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                />
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="mt-8 space-y-4 text-center">
          <div className="text-sm text-gray-600">
            {t('footer.passwordReset')}{' '}
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
            <span>{t('trustIndicators.encrypted')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;