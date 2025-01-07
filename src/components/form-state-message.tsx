import { ApiResponse } from '@/interfaces/api-response.interface';
import Text, { TextProps } from '@/components/text/text';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { allRoutes } from '@/constants/routes.constant';
import Box from './box/box';

interface FormStateMessageProps extends TextProps {
  state: ApiResponse<unknown>;
}

const FormStateMessage = ({
  state,
  className,
  ...props
}: FormStateMessageProps) => {
  return (
    state.message && (
      <Box>
        <Text
          className={cn(
            'my-2',
            state.success ? 'text-success' : 'text-danger',
            className,
          )}
          {...props}
        >
          {state?.message ?? 'An error occurred'}
        </Text>
        {state?.errors?.verifyEmail &&
        state?.errors?.verifyEmail === 'email_not_verified' ? (
          <Text variant="link">
            <Link href={allRoutes.auth.children.verifyEmail.path}>
              Verify Email
            </Link>
          </Text>
        ) : null}
      </Box>
    )
  );
};

export default FormStateMessage;
