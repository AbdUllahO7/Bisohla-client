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

import { handleLogin } from '@/services/auth/auth.service';
import Link from 'next/link';
import { useActionState } from 'react';

const SignInPage = () => {
  const [state, action] = useActionState<ApiResponse<LoginResponse>, FormData>(
    handleLogin,
    defaultActionState,
  );

  console.log(state);

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

        {/* Password Input */}
        <DetailedInput
          placeholder="Enter Your Password"
          type="password"
          name="password"
          error={state?.errors?.password}
          caption="Password"
          // value={state?.fields?.password}
        />

        {/* Submit Button */}
        <SubmitButton title="Login" />
      </Box>
      <Box variant={'column'} className="items-start m-2">
        <Text>
          <Link href="/forgot-password">Forgot Password?</Link>
        </Text>
        <Text>
          New to Bishola?{' '}
          <Link
            href={allRoutes.auth.children.register.path}
            className="text-primary-light"
          >
            Register Now
          </Link>
        </Text>
      </Box>
    </form>
  );
};

export default SignInPage;
