import Link, { LinkProps } from 'next/link';
import { Button } from '../ui/button';
import { allRoutes } from '@/constants/routes.constant';

interface SignOutLinkProps extends Omit<LinkProps, 'href'> {
  title?: string;
}

const SignOutLink: React.FC<SignOutLinkProps> = ({
  title = 'Sign out',
  ...props
}) => {
  return (
    <Button asChild variant="link">
      <Link href={allRoutes.api.auth.signOut.path} {...props}>
        {title}
      </Link>
    </Button>
  );
};

export default SignOutLink;
