import { allRoutes } from '@/constants/routes.constant';
import { validateResetPasswordToken } from '@/services/auth/auth.service';
import { redirect } from 'next/navigation';
import ResetPasswordForm from './reset-password-form';

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: { token: string };
}) => {
  const { token } = await searchParams;

  if (!token) {
    // If no token is provided, redirect to the sign-in page
    redirect(allRoutes.auth.children.signIn.path);
    return null; // This is never reached, but it's good practice to return null after redirect
  }

  const isValidToken = await validateResetPasswordToken(token);

  if (!isValidToken.success || isValidToken.data?.message === 'Token expired') {
    redirect(allRoutes.auth.children.signIn.path);
  }
  return <ResetPasswordForm />;
};

export default ResetPasswordPage;
