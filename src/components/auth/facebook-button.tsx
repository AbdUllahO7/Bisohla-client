import { BACKEND_URL } from '@/core/lib/web/constants';
import { useDirection } from '@/hooks/use-direction';
import { getSafeRedirect } from '@/utils/safe-redirect';
import React from 'react';

interface FacebookButtonProps {
  mode?: 'login' | 'signup';
  redirect?: string;
}

const FacebookButton = ({ mode = 'signup', redirect }: FacebookButtonProps) => {
  const dir = useDirection();
  const isRTL = dir === 'rtl';
  const safeRedirect = getSafeRedirect(redirect);

  const getButtonText = () => {
    if (mode === 'login') {
      return isRTL ? 'تسجيل الدخول باستخدام فيسبوك' : 'Sign in with Facebook';
    }
    return isRTL ? 'التسجيل باستخدام فيسبوك' : 'Sign up with Facebook';
  };

  const handleClick = () => {
    if (safeRedirect && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('auth_redirect', safeRedirect);
      } catch {}
    }
  };

  const href = safeRedirect
    ? `${BACKEND_URL}/oauth/facebook?redirect=${encodeURIComponent(safeRedirect)}`
    : `${BACKEND_URL}/oauth/facebook`;

  return (
    <div className="pt-1">
      <a
        href={href}
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md border border-gray-200 hover:border-gray-300"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="#1877F2"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
        {getButtonText()}
      </a>
    </div>
  );
};

export default FacebookButton;
