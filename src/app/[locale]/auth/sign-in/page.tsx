'use client';
import DetailedInput from '@/components/forms/detailed-input';
import FormStateMessage from '@/components/forms/form-state-message';
import SubmitButton from '@/components/forms/submit-button';
import { allRoutes } from '@/constants/routes.constant';
import {
  type ApiResponse,
  defaultActionState,
} from '@/core/entities/interfaces/api-response.interface';
import { Link } from '@/i18n/routing';
import { useActionState } from 'react';
import { signInAction } from '../actions';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/locale/LocaleSwitcher';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useSettings } from '@/providers/settings.provider';
import GoogleButton from '@/components/auth/google-button';
import FacebookButton from '@/components/auth/facebook-button';
import AppleButton from '@/components/auth/apple-button';

const SignInPage = () => {
  const { getAuthenticationSettings } = useSettings();

  const authSettings = getAuthenticationSettings();

  const locale = useLocale();
  const isRTL = locale === 'ar';
  const queryClient = useQueryClient();
  const t = useTranslations('forgotPassword');

  const [state, action] = useActionState<ApiResponse<LoginResponse>, FormData>(
    signInAction,
    defaultActionState,
  );

  // Invalidate queries when login is successful
  useEffect(() => {
    if (state.success) {
      // Invalidate auth-related queries
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['check-auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['legal-pending'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('login-success'));
      }
    }
  }, [state.success, queryClient]);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="w-full flex flex-col space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className=" p-3 rounded-2xl shadow-lg">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {isRTL ? 'مرحباً بعودتك' : 'Welcome Back'}
          </h1>
          <p className="text-gray-600 dark:text-white text-sm sm:text-base">
            {isRTL
              ? 'سجل دخولك للوصول إلى حسابك'
              : 'Sign in to access your account'}
          </p>
        </div>

        {/* Language Switcher */}
        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <LocaleSwitcher />
        </div>

        {/* Sign In Card */}
        <Card className="shadow-xl border-0 dark:border dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm w-full">
          <CardHeader className="space-y-1 pb-4">
            <FormStateMessage state={state} />
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <form
              action={action}
              className={`space-y-5 ${isRTL ? 'rtl' : 'ltr'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Email Input */}
              <DetailedInput
                placeholder={
                  isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'
                }
                type="email"
                name="email"
                error={state?.errors?.email}
                caption={isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                icon={<Mail className="h-5 w-5 text-gray-400 dark:text-zinc-400" />}
              />

              {/* Password Input */}
              <DetailedInput
                placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                type="password"
                name="password"
                error={state?.errors?.password}
                caption={isRTL ? 'كلمة المرور' : 'Password'}
                icon={<Lock className="h-5 w-5 text-gray-400 dark:text-zinc-400" />}
              />

              {/* Submit Button */}
              <div className="pt-2">
                <SubmitButton
                  title={isRTL ? 'تسجيل الدخول' : 'Sign In'}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                />
              </div>

              {/* Divider */}
              {(authSettings?.auth_providers?.enable_facebook_oauth ||
                authSettings?.auth_providers?.enable_google_oauth ||
                authSettings?.auth_providers?.enable_apple_oauth) && (
                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-zinc-800"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white dark:bg-zinc-900 px-2 text-gray-500 dark:text-white">
                      {isRTL ? 'أو' : 'Or'}
                    </span>
                  </div>
                </div>
              )}

              {/* Google OAuth Button */}
              {authSettings?.auth_providers?.enable_google_oauth && (
                <GoogleButton mode="login" />
              )}
              {authSettings?.auth_providers?.enable_facebook_oauth && (
                <FacebookButton mode="login" />
              )}
              {authSettings?.auth_providers?.enable_apple_oauth && (
                <AppleButton mode="login" />
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="space-y-3 text-center">
          <div className="text-sm text-gray-600 dark:text-white">
            {isRTL ? 'جديد في Bishola؟' : 'New to Bishola?'}{' '}
            <Link
              href={allRoutes.auth.children.register.path}
              className="font-semibold text-emerald-600 dark:text-[#ABDE3B] hover:text-emerald-700 dark:hover:text-[#ABDE3B]/90 transition-colors"
            >
              {isRTL ? 'سجل الآن' : 'Create Account'}
            </Link>
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            <Link
              href={allRoutes.auth.children.sendResetPasswordEmail.path}
              className="font-medium text-gray-700 dark:text-white hover:text-emerald-600 dark:hover:text-[#ABDE3B] transition-colors"
            >
              {isRTL ? 'هل نسيت كلمة المرور؟' : 'Forgot your password?'}
            </Link>
          </div>
          <div className="text-sm text-gray-600 dark:text-white">
            <Link
              href="/"
              className="font-medium text-gray-700 dark:text-white hover:text-emerald-600 dark:hover:text-[#ABDE3B] transition-colors inline-flex items-center gap-1"
            >
              {t('footer.backToHome')}
              <ArrowRight className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
          </div>
        </div>

        {/* Trust Indicators */}
      </div>
    </div>
  );
};

export default SignInPage;
