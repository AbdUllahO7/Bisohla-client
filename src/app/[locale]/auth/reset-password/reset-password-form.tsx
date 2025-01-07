'use client';

import Box from '@/components/box/box';
import DetailedInput from '@/components/detailed-input';
import FormStateMessage from '@/components/form-state-message';
import SubmitButton from '@/components/submit-button';
import Text from '@/components/text/text';
import { allRoutes } from '@/constants/routes.constant';
import { Link } from '@/i18n/routing';
import {
  ApiResponse,
  defaultActionState,
} from '@/interfaces/api-response.interface';
import { handleResetPassword } from '@/services/auth/auth.service';
import { redirect, useSearchParams } from 'next/navigation';
import { useActionState } from 'react';

const ResetPasswordForm = () => {
  const searchParams = useSearchParams();
  console.log('Client searchParams:', searchParams.toString()); // Debug log

  const token = searchParams.get('token');

  const [state, action] = useActionState<
    ApiResponse<ResetPasswordResponse>,
    FormData
  >(handleResetPassword, defaultActionState);

  if (!token) {
    redirect(allRoutes.auth.children.signIn.path);
  }

  return (
    <form action={action} className="w-full">
      <Box className="flex-col w-full gap-4 items-start">
        {/* Status Message */}
        <FormStateMessage state={state} />

        <input type="hidden" name="token" readOnly value={token} />
        {/* Password Input */}
        <DetailedInput
          placeholder="Enter your new password"
          type="password"
          name="password"
          error={state?.errors?.password}
          caption="New Password"
          // value={state?.fields?.email}
        />

        {/* Password Confirmation Input */}
        <DetailedInput
          name="passwordConfirmation"
          placeholder="Enter Your Password Again"
          type="password"
          error={state.errors?.passwordConfirmation}
          caption="Password Confirmation"
        />

        {/* Submit Button */}
        <SubmitButton title="Reset Password" submittingTitle="Resetting..." />
      </Box>
      <Box variant={'column'} className="items-start m-2">
        <Text>
          Had reset your password?{' '}
          <Link
            href={allRoutes.auth.children.signIn.path}
            className="text-primary-light"
          >
            Sign in Now
          </Link>
        </Text>
      </Box>
    </form>
  );
};

export default ResetPasswordForm;
