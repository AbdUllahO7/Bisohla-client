import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { allRoutes } from '@/constants/routes.constant';
import { Link } from '@/i18n/routing';

const EmailVerifiedPage = async ({
  searchParams,
}: {
  searchParams: {
    status: 'success' | 'error';
    message: string;
  };
}) => {
  const { status } = await searchParams;

  return (
    <>
      {status === 'success' ? (
        <Box variant="column" className="items-start">
          <Text variant="h5" className="text-success">
            Email Verified Successfully
          </Text>
          <Text variant="link">
            <Link href={allRoutes.auth.children.signIn.path}>Login now!</Link>
          </Text>
        </Box>
      ) : (
        <Box variant="column" className="items-start">
          <Text variant="h5" className="text-danger">
            Email Verified Failed
          </Text>
          <Text variant="link">
            <Link href={allRoutes.auth.children.verifyEmail.path}>
              try again!
            </Link>
          </Text>
        </Box>
      )}
    </>
  );
};

export default EmailVerifiedPage;