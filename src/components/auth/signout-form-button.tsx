'use client';

import { handleSignout } from '@/services/auth/auth.service';
import { ButtonProps } from '../ui/button';
import { useActionState } from 'react';
import { defaultActionState } from '@/interfaces/api-response.interface';
import SubmitButton from '../submit-button';

interface SignOutButtonProps extends ButtonProps {
  title?: string;
}

const SignOutFormButton = ({ title = 'Sign Out' }: SignOutButtonProps) => {
  const [, action] = useActionState(handleSignout, defaultActionState);

  return (
    <form action={action}>
      <SubmitButton
        variant="link"
        title={title}
        submittingTitle="Signing out..."
      />
    </form>
  );
};

export default SignOutFormButton;
