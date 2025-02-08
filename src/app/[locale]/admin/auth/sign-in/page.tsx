'use client';

import Box from '@/components/box/box';
import DetailedInput from '@/components/detailed-input';
import FormStateMessage from '@/components/form-state-message';
import SubmitButton from '@/components/submit-button';
import Text from '@/components/text/text';
import {
  ApiResponse,
  defaultActionState,
} from '@/interfaces/api-response.interface';
import Link from 'next/link';
import { useActionState } from 'react';
import { adminSignInAction } from '../actions';
// import { ApiSuccessResponse} from '@/interfaces/api-response.interface';

const AdminSignInPage = () => {
  const [state, action] = useActionState<ApiResponse<LoginResponse>, FormData>(
    adminSignInAction,
    defaultActionState,
  );

  return (
    <form action={action} className="w-full">
      <Box className="flex-col w-full gap-4 items-start">
        {/* Status Message */}
        <FormStateMessage state={state} />
        {/* Email Input */}
        <DetailedInput
          // register={register('email')}
          placeholder="Enter Your Email"
          type="email"
          name="email"
          error={state?.errors?.email}
          caption="Email"
        />

        {/* Password Input */}
        <DetailedInput
          // register={register('password')}
          placeholder="Enter Your Password"
          type="password"
          name="password"
          error={state?.errors?.password}
          caption="Password"
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
          <Link href="/register" className="text-primary-light">
            Register Now
          </Link>
        </Text>
      </Box>
    </form>
  );
};

export default AdminSignInPage;
