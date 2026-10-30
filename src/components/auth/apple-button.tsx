import { BACKEND_URL } from '@/core/lib/web/constants';
import { useDirection } from '@/hooks/use-direction';
import { getSafeRedirect } from '@/utils/safe-redirect';
import React from 'react';

interface AppleButtonProps {
  mode?: 'login' | 'signup';
  redirect?: string;
}

const AppleButton = ({ mode = 'signup', redirect }: AppleButtonProps) => {
  const dir = useDirection();
  const isRTL = dir === 'rtl';
  const safeRedirect = getSafeRedirect(redirect);

  const getButtonText = () => {
    if (mode === 'login') {
      return isRTL ? 'تسجيل الدخول باستخدام أبل' : 'Sign in with Apple';
    }
    return isRTL ? 'التسجيل باستخدام أبل' : 'Sign up with Apple';
  };

  const handleClick = () => {
    if (safeRedirect && typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('auth_redirect', safeRedirect);
      } catch {}
    }
  };

  const href = safeRedirect
    ? `${BACKEND_URL}/oauth/apple?redirect=${encodeURIComponent(safeRedirect)}`
    : `${BACKEND_URL}/oauth/apple`;

  return (
    <div className="pt-1">
      <a
        href={href}
        target="_blank"
        onClick={handleClick}
        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-md border border-gray-200 hover:border-gray-300"
      >
        <svg
          className="w-5 h-5"
          viewBox="0 0 24 24"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        {getButtonText()}
      </a>
    </div>
  );
};

export default AppleButton;
