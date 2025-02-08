import { allRoutes } from '@/constants/routes.constant';
import { redirect } from 'next/navigation';
import ResetPasswordForm from './reset-password-form';
import { validateResetPasswordTokenAction } from '../actions';

const ResetPasswordPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ token: string }>;
}) => {
  const { token } = await searchParams;

  if (!token) {
    // If no token is provided, redirect to the sign-in page
    redirect(allRoutes.auth.children.signIn.path);
    return null; // This is never reached, but it's good practice to return null after redirect
  }

  const isValidToken = await validateResetPasswordTokenAction(token);

  if (!isValidToken.success || isValidToken.data?.message === 'Token expired') {
    redirect(allRoutes.auth.children.signIn.path);
  }
  return <ResetPasswordForm token={token} />;
};

export default ResetPasswordPage;
