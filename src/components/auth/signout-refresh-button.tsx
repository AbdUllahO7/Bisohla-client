'use client';

import { Button, ButtonProps } from '../ui/button';
import { useRouter } from 'next/navigation';
import { allRoutes } from '@/constants/routes.constant';

interface SignOutButtonProps extends ButtonProps {
  title?: string;
}

const SignOutRefreshButton = ({ title = 'Sign Out' }: SignOutButtonProps) => {
  const router = useRouter();

  const logout = async () => {
    await fetch(allRoutes.api.auth.signOut.path, { method: 'GET' });
    router.refresh(); // Client-side refresh for the current page
  };

  return (
    <Button variant="link" onClick={logout} className="text-danger">
      {title}
    </Button>
  );
};

export default SignOutRefreshButton;
