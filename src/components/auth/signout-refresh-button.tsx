import { handleSignout } from '@/services/auth/auth.service';
import { Button, ButtonProps } from '../ui/button';

interface SignOutButtonProps extends ButtonProps {
  title?: string;
}

const SignOutRefreshButton = ({ title = 'Sign Out' }: SignOutButtonProps) => {
  return (
    <Button variant="link" onClick={handleSignout} className="text-danger">
      {title}
    </Button>
  );
};

export default SignOutRefreshButton;
