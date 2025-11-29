'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { allRoutes } from '@/constants/routes.constant';

const AuthErrorPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const error = searchParams.get('error');
  const message = searchParams.get('message');

  // Get user-friendly error messages
  const getErrorMessage = () => {
    switch (error) {
      case 'oauth_failed':
        return (
          message ||
          (isRTL
            ? 'فشل تسجيل الدخول باستخدام حساب Google/Facebook'
            : 'Failed to sign in with Google/Facebook')
        );
      case 'oauth_error':
        return (
          message ||
          (isRTL
            ? 'حدث خطأ أثناء معالجة تسجيل الدخول'
            : 'An error occurred during sign in')
        );
      case 'different_provider':
        return (
          message ||
          (isRTL
            ? 'حساب موجود بطريقة تسجيل مختلفة'
            : 'Account exists with different sign-in method')
        );
      case 'account_exists':
        return isRTL
          ? 'يوجد حساب بهذا البريد الإلكتروني بالفعل'
          : 'An account with this email already exists';
      default:
        return message || (isRTL ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const getErrorDescription = () => {
    switch (error) {
      case 'oauth_failed':
        return isRTL
          ? 'لم نتمكن من إتمام عملية تسجيل الدخول. يرجى المحاولة مرة أخرى.'
          : "We couldn't complete the sign in process. Please try again.";
      case 'oauth_error':
        return isRTL
          ? 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى أو التواصل مع الدعم.'
          : 'An unexpected error occurred. Please try again or contact support.';
      case 'different_provider':
        return ''; // Message already contains full details from backend
      case 'account_exists':
        return isRTL
          ? 'يرجى تسجيل الدخول باستخدام الطريقة التي استخدمتها عند التسجيل.'
          : 'Please sign in using the method you used when registering.';
      default:
        return '';
    }
  };

  useEffect(() => {
    // Log error for debugging
    console.error('Auth error:', { error, message });
  }, [error, message]);

  return (
    <div className="w-full max-w-md mx-auto min-h-[60vh] flex items-center">
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

        {/* Error Card */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-red-100 rounded-full p-4">
                  {error === 'account_exists' ||
                  error === 'different_provider' ? (
                    <AlertTriangle className="h-16 w-16 text-amber-600" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-600" />
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isRTL ? 'عذراً!' : 'Oops!'}
            </h2>

            {/* Error Message */}
            <p className="text-lg font-semibold text-gray-800 mb-2">
              {getErrorMessage()}
            </p>

            {/* Error Description */}
            {getErrorDescription() && (
              <p className="text-gray-600 mb-6 leading-relaxed">
                {getErrorDescription()}
              </p>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => router.push(allRoutes.auth.children.signIn.path)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
              >
                {isRTL ? 'تسجيل الدخول' : 'Sign In'}
              </button>

              <button
                onClick={() =>
                  router.push(allRoutes.auth.children.register.path)
                }
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md border border-gray-200"
              >
                {isRTL ? 'إنشاء حساب جديد' : 'Create New Account'}
              </button>

              <button
                onClick={() => router.push('/')}
                className="w-full text-gray-600 hover:text-emerald-600 font-medium py-2 transition-colors"
              >
                {isRTL ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
              </button>
            </div>

            {/* Support */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-600">
                {isRTL ? (
                  <>
                    <strong>بحاجة إلى مساعدة؟</strong> تواصل مع فريق الدعم
                  </>
                ) : (
                  <>
                    <strong>Need help?</strong> Contact our support team
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthErrorPage;
