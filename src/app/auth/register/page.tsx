'use client';

import Box from '@/components/box/box';
import DetailedInput from '@/components/detailed-input';
import FormStateMessage from '@/components/form-state-message';
import SubmitButton from '@/components/submit-button';
import Text from '@/components/text/text';
import { defaultActionState } from '@/interfaces/api-response.interface';
import { handleRegister } from '@/services/auth.service';
import Link from 'next/link';
import { useActionState } from 'react';

const RegisterPage = () => {
  const [state, action] = useActionState(handleRegister, defaultActionState);

  return (
    <form action={action} className="w-full">
      <Box className="flex-col w-full gap-4 items-start">
        {/* Status Message */}
        <FormStateMessage state={state} />
        {/* Email Input */}
        <DetailedInput
          name="email"
          placeholder="Enter Your Email"
          type="email"
          error={state.errors?.email}
          caption="Email"
        />

        {/* Password Input */}
        <DetailedInput
          name="name"
          placeholder="Enter Your Name"
          type="text"
          error={state.errors?.name}
          caption="Name"
        />

        {/* Password Input */}
        <DetailedInput
          name="password"
          placeholder="Enter Your Password"
          type="password"
          error={state.errors?.password}
          caption="Password"
        />

        {/* Submit Button */}
        <SubmitButton title="Register" submittingTitle="Loading..." />
      </Box>
      <Box variant={'column'} className="items-start m-2">
        <Text>
          Alreay have an account?{' '}
          <Link href="/sign-in" className="text-primary-light">
            Sign in Now
          </Link>
        </Text>
      </Box>
    </form>
  );
};

export default RegisterPage;
