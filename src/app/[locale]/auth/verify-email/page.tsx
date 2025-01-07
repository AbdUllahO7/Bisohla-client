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
import { handleSendVerificationEmail } from '@/services/auth/auth.service';
import { useActionState } from 'react';

const VerifyEmailPage = () => {
  const [state, action] = useActionState<
    ApiResponse<SendEmailVerificationResponse>,
    FormData
  >(handleSendVerificationEmail, defaultActionState);

  return (
    <form action={action} className="w-full">
      <Box className="flex-col w-full gap-4 items-start">
        {/* Status Message */}
        <FormStateMessage state={state} />

        {/* Email Input */}
        <DetailedInput
          placeholder="Enter Your Email"
          type="email"
          name="email"
          error={state?.errors?.email}
          caption="Email"
          // value={state?.fields?.email}
        />

        {/* Submit Button */}
        <SubmitButton
          title="Send Email Verification"
          submittingTitle="Sending"
        />
      </Box>
      <Box variant={'column'} className="items-start m-2">
        <Text>
          New to Bishola?{' '}
          <Link
            href={allRoutes.auth.children.register.path}
            className="text-primary-light"
          >
            Register Now
          </Link>
        </Text>
        <Text>
          Verified your account?{' '}
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

export default VerifyEmailPage;
