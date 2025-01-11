import Link from 'next/link';
import Box, { BoxProps } from '../box/box';
import { Button } from '../ui/button';
import { allRoutes } from '@/constants/routes.constant';
import Text from '../text/text';
import { getSession } from '@/lib/session';
import SignOutFormButton from './signout-form-button';
import { checkRole } from '@/lib/permission';

const AuthButtons = async (props: BoxProps) => {
  const session = await getSession();

  return (
    <Box {...props}>
      {!session || !session.user ? (
        <Button variant="link" asChild>
          <Link href={allRoutes.auth.children.signIn.path}>Sign In</Link>
        </Button>
      ) : (
        <>
          <Text>Welcome, {session.user.name}!</Text>
          <Button variant="link" asChild>
            {(await checkRole('admin')) ? (
              <Link href={allRoutes.admin.children.dashboard.path}>
                Dashboard
              </Link>
            ) : (
              <Link href={allRoutes.user.children.dashboard.path}>
                Dashboard
              </Link>
            )}
          </Button>
          <SignOutFormButton />
        </>
      )}
    </Box>
  );
};

export default AuthButtons;
