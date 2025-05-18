'use client';

import Box from '@/components/box/box';
import DetailedInput from '@/components/detailed-input';
import FormStateMessage from '@/components/form-state-message';
import SubmitButton from '@/components/submit-button';
import Text from '@/components/text/text';
import { allRoutes } from '@/constants/routes.constant';
import {
  ApiResponse,
  defaultActionState,
} from '@/interfaces/api-response.interface';

import {Link} from "@/i18n/routing"
import { useActionState } from 'react';
import { signInAction } from '../actions';
import { useLocale } from 'next-intl';
import LocaleSwitcher from '@/components/local/LocalSwitcher';

const SignInPage = () => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [state, action] = useActionState<ApiResponse<LoginResponse>, FormData>(
    signInAction,
    defaultActionState,
  );

  return (
    <form action={action} className={`w-[50%] ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <Box className="flex-col w-full gap-4 ">
      <div className='xs:hidden lg:block md:block'>
                  <LocaleSwitcher/>
          </div>
        {/* Status Message */}
        <FormStateMessage state={state} />

        {/* Email Input */}
        <DetailedInput
          placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter Your Email'}
          type="email"
          name="email"
          error={state?.errors?.email}
          caption={isRTL ? 'البريد الإلكتروني' : 'Email'}
        />

        {/* Password Input */}
        <DetailedInput
          placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter Your Password'}
          type="password"
          name="password"
          error={state?.errors?.password}
          caption={isRTL ? 'كلمة المرور' : 'Password'}
        />

        {/* Submit Button */}
        <SubmitButton title={isRTL ? 'تسجيل الدخول' : 'Login'} />
      </Box>
      <Box variant={'column'} className="items-start m-2">
        <Text>
          {isRTL ? 'جديد في Bishola؟' : 'New to Bishola?'}{' '}
          <Link
            href={allRoutes.auth.children.register.path}
            className="text-primary-light"
          >
            {isRTL ? 'سجل الآن' : 'Register Now'}
          </Link>
        </Text>
        <Text>
          {isRTL ? 'هل نسيت كلمة المرور؟' : 'Forgot your password?'}{' '}
          <Link
            href={allRoutes.auth.children.sendResetPasswordEmail.path}
            className="text-primary-light"
          >
            {isRTL ? 'إعادة تعيين كلمة المرور' : 'Reset password'}
          </Link>
        </Text>
      </Box>
    </form>
  );
};

export default SignInPage;
