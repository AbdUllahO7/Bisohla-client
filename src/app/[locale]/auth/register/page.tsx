'use client';
import DetailedInput from '@/components/detailed-input';
import FormStateMessage from '@/components/form-state-message';
import SubmitButton from '@/components/submit-button';
import { allRoutes } from '@/constants/routes.constant';
import {
  type ApiResponse,
  defaultActionState,
} from '@/interfaces/api-response.interface';
import { handleRegister } from '@/services/auth/auth.service';
import type { RegisterFormValues } from '@/zod-schemas/auth/register-form-schema';
import { Link } from '@/i18n/routing';
import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/local/LocalSwitcher';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Car,
  Mail,
  User,
  Lock,
  CheckCircle,
  ArrowRight,
  MailOpen,
  RefreshCw,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Image from 'next/image';
import { BACKEND_URL } from '@/core/lib/web/constants';

const RegisterPage = () => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('forgotPassword');

  const [state, action] = useActionState<
    ApiResponse<RegisterFormValues>,
    FormData
  >(handleRegister, defaultActionState);

  // Function to open email based on email domain
  const handleOpenEmail = () => {
    const email = state.data?.email || '';
    const domain = email.split('@')[1]?.toLowerCase();

    // Map common email providers to their web URLs
    const emailProviders: { [key: string]: string } = {
      'gmail.com': 'https://mail.google.com',
      'yahoo.com': 'https://mail.yahoo.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'icloud.com': 'https://www.icloud.com/mail',
      'live.com': 'https://outlook.live.com',
    };

    const emailUrl = emailProviders[domain] || 'https://mail.google.com';
    window.open(emailUrl, '_blank');
  };

  // Show success screen after registration
  if (state.success && state.data) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="w-full flex flex-col space-y-4">
          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="p-2 rounded-2xl shadow-lg mb-2">
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
          </div>

          {/* Success Card */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              {/* Success Icon */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
                  <div className="relative bg-emerald-100 rounded-full p-4">
                    <MailOpen className="h-16 w-16 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {isRTL ? 'تحقق من بريدك الإلكتروني' : 'Check Your Email'}
              </h2>

              {/* Message */}
              <p className="text-gray-600 mb-6 leading-relaxed">
                {isRTL ? (
                  <>
                    لقد أرسلنا رابط التحقق إلى
                    <br />
                    <span className="font-semibold text-emerald-600">
                      {state.data.email}
                    </span>
                    <br />
                    يرجى التحقق من بريدك الإلكتروني وتفعيل حسابك
                  </>
                ) : (
                  <>
                    We've sent a verification link to
                    <br />
                    <span className="font-semibold text-emerald-600">
                      {state.data.email}
                    </span>
                    <br />
                    Please check your email and verify your account
                  </>
                )}
              </p>

              {/* Open Email Button */}
              <button
                onClick={handleOpenEmail}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg mb-4 flex items-center justify-center gap-2"
              >
                <Mail className="h-5 w-5" />
                {isRTL ? 'فتح البريد الإلكتروني' : 'Open Email'}
              </button>

              {/* Resend Link */}
              <Link
                href={allRoutes.auth.children.verifyEmail.path}
                className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors gap-1"
              >
                <RefreshCw className="h-4 w-4" />
                {isRTL
                  ? 'إعادة إرسال رسالة التحقق'
                  : 'Resend verification email'}
              </Link>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-start leading-relaxed">
                  {isRTL ? (
                    <>
                      <strong>ملاحظة:</strong> إذا لم تجد الرسالة، يرجى التحقق
                      من مجلد الرسائل غير المرغوب فيها (Spam).
                    </>
                  ) : (
                    <>
                      <strong>Note:</strong> If you don't see the email, please
                      check your spam or junk folder.
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Links */}
          <div className="text-center space-y-2">
            <div className="text-sm text-gray-600">
              <Link
                href={allRoutes.auth.children.signIn.path}
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1"
              >
                <ArrowRight
                  className={`h-3 w-3 ${isRTL ? 'rotate-180' : ''}`}
                />
                {isRTL ? 'العودة إلى تسجيل الدخول' : 'Back to Sign In'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show registration form
  return (
    <div className="w-full max-w-md max-h-[85vh] mx-auto">
      <div className="w-full flex flex-col space-y-4">
        {/* Logo and Header - More compact */}
        <div className="text-center">
          <div className="flex items-center justify-center ">
            <div className="p-2 rounded-2xl shadow-lg mb-2">
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

          <p className="text-gray-600 text-sm">
            {isRTL
              ? 'انضم إلى بسهولة واستمتع بخدماتنا المميزة'
              : 'Join Bishola and enjoy our premium services'}
          </p>
        </div>

        {/* Language Switcher - More compact */}
        <div className={`flex ${isRTL ? 'justify-start' : 'justify-end'}`}>
          <LocaleSwitcher />
        </div>

        {/* Registration Card - More compact */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm w-full">
          <CardHeader className="space-y-1 pb-1">
            <FormStateMessage state={state} />
          </CardHeader>

          <CardContent className="px-4 sm:px-6 pb-2">
            <form
              action={action}
              className={`space-y-4 ${isRTL ? 'rtl' : 'ltr'}`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {/* Email Input - Preserved on error */}
              <DetailedInput
                name="email"
                placeholder={
                  isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email address'
                }
                type="email"
                error={state.errors?.email}
                caption={isRTL ? 'البريد الإلكتروني' : 'Email Address'}
                icon={<Mail className="h-5 w-5 text-gray-400" />}
                defaultValue={state.data?.email || ''}
              />

              {/* Name Input - Preserved on error */}
              <DetailedInput
                name="name"
                placeholder={
                  isRTL ? 'أدخل اسمك الكامل' : 'Enter your full name'
                }
                type="text"
                error={state.errors?.name}
                caption={isRTL ? 'الاسم الكامل' : 'Full Name'}
                icon={<User className="h-5 w-5 text-gray-400" />}
                defaultValue={state.data?.name || ''}
              />

              {/* Password Input - NOT preserved for security */}
              <DetailedInput
                name="password"
                placeholder={
                  isRTL ? 'أدخل كلمة مرور قوية' : 'Create a strong password'
                }
                type="password"
                error={state.errors?.password}
                caption={isRTL ? 'كلمة المرور' : 'Password'}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />

              {/* Password Confirmation Input - NOT preserved for security */}
              <DetailedInput
                name="passwordConfirmation"
                placeholder={
                  isRTL ? 'أعد إدخال كلمة المرور' : 'Confirm your password'
                }
                type="password"
                error={state.errors?.passwordConfirmation}
                caption={isRTL ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                icon={<Lock className="h-5 w-5 text-gray-400" />}
              />

              {/* Terms and Privacy Notice - More compact */}
              <div className="text-xs text-gray-500 text-center leading-relaxed px-1">
                {isRTL ? (
                  <>
                    بإنشاء حساب، فإنك توافق على{' '}
                    <Link
                      href="#"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      شروط الخدمة
                    </Link>{' '}
                    و{' '}
                    <Link
                      href="#"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      سياسة الخصوصية
                    </Link>
                  </>
                ) : (
                  <>
                    By creating an account, you agree to our{' '}
                    <Link
                      href="#"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link
                      href="#"
                      className="text-emerald-600 hover:text-emerald-700 font-medium"
                    >
                      Privacy Policy
                    </Link>
                  </>
                )}
              </div>

              {/* Submit Button - More compact */}
              <div className="pt-1">
                <SubmitButton
                  title={isRTL ? 'إنشاء الحساب' : 'Create Account'}
                  submittingTitle={
                    isRTL ? 'جار الإنشاء...' : 'Creating Account...'
                  }
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                />
              </div>

              {/* Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">
                    {isRTL ? 'أو' : 'Or'}
                  </span>
                </div>
              </div>

              {/* Google OAuth Button */}
              <div className="pt-1">
                <a
                  href={`${BACKEND_URL}/oauth/google`}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md border border-gray-200 hover:border-gray-300"
                >
                  <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  {isRTL ? 'التسجيل باستخدام جوجل' : 'Sign up with Google'}
                </a>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer Links - More compact */}
        <div className="text-center space-y-1">
          <div className="text-sm text-gray-600">
            {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
            <Link
              href={allRoutes.auth.children.signIn.path}
              className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              {isRTL ? 'تسجيل الدخول الآن' : 'Sign in here'}
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
      </div>
    </div>
  );
};

export default RegisterPage;
