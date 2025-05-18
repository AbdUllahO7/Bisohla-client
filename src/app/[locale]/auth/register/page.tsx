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
import { handleRegister } from '@/services/auth/auth.service';
import { RegisterFormValues } from '@/zod-schemas/auth/register-form-schema';
import {Link} from "@/i18n/routing"
import { useActionState } from 'react';
import { useLocale } from 'next-intl';
import LocaleSwitcher from '@/components/local/LocalSwitcher';

const RegisterPage = () => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  
  const [state, action] = useActionState<
    ApiResponse<RegisterFormValues>,
    FormData
  >(handleRegister, defaultActionState);

  return (
    <form action={action} className={`w-[50%] justify-center items-center ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      <Box className="flex-col w-full gap-4 items-start">
      <div className='xs:hidden lg:block md:block justify-center mx-auto'>
                                <LocaleSwitcher/>
                </div>
        {/* Status Message */}
        <FormStateMessage state={state} />

        {state.success && state.data && (
          <Text variant="link" className="text-alert">
            <Link href={allRoutes.auth.children.verifyEmail.path}>
              {isRTL ? 'إعادة إرسال تأكيد البريد الإلكتروني' : 'Resend email verification'}
            </Link>
          </Text>
        )}

        {/* Email Input */}
        <DetailedInput
          name="email"
          placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter Your Email'}
          type="email"
          error={state.errors?.email}
          caption={isRTL ? 'البريد الإلكتروني' : 'Email'}
        />

        {/* Name Input */}
        <DetailedInput
          name="name"
          placeholder={isRTL ? 'أدخل اسمك' : 'Enter Your Name'}
          type="text"
          error={state.errors?.name}
          caption={isRTL ? 'الاسم' : 'Name'}
        />

        {/* Password Input */}
        <DetailedInput
          name="password"
          placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter Your Password'}
          type="password"
          error={state.errors?.password}
          caption={isRTL ? 'كلمة المرور' : 'Password'}
        />

        {/* Password Confirmation Input */}
        <DetailedInput
          name="passwordConfirmation"
          placeholder={isRTL ? 'أدخل كلمة المرور مرة أخرى' : 'Enter Your Password Again'}
          type="password"
          error={state.errors?.passwordConfirmation}
          caption={isRTL ? 'تأكيد كلمة المرور' : 'Password Confirmation'}
        />

        {/* Submit Button */}
        <SubmitButton title={isRTL ? 'تسجيل' : 'Register'} submittingTitle={isRTL ? 'جار التحميل...' : 'Loading...'} />
      </Box>

      <Box variant={'column'} className="items-start m-2">
        <Text>
          {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
          <Link href={allRoutes.auth.children.signIn.path} className="text-primary-light">
            {isRTL ? 'تسجيل الدخول الآن' : 'Sign in Now'}
          </Link>
        </Text>
      </Box>
    </form>
  );
};

export default RegisterPage;
