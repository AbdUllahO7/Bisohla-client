import { ApiResponse } from '@/interfaces/api-response.interface';
import Text, { TextProps } from '@/components/text/text';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/routing';
import { allRoutes } from '@/constants/routes.constant';
import { useLocale } from 'next-intl'; // or wherever your useLocale comes from
import Box from './box/box';

interface FormStateMessageProps extends TextProps {
  state: ApiResponse<unknown>;
}

const FormStateMessage = ({
  state,
  className,
  ...props
}: FormStateMessageProps) => {
  const locale = useLocale();
  const isRTL = locale === "ar";

  // Translation function for validation failed message
  const getLocalizedMessage = (message: string): string => {
    if (message === 'Validation failed') {
      const translations: Record<string, string> = {
        en: 'Validation failed',
        ar: 'فشل في التحقق',
        // Add more languages as needed
      };
      return translations[locale] || message;
    }
    return message;
  };

  // Get the display message
  const displayMessage = state.message 
    ? getLocalizedMessage(state.message)
    : 'An error occurred';

  return (
    state.message && (
      <Box>
        <Text
          className={cn(
            'my-2',
            state.success ? 'text-success' : 'text-danger',
            className,
          )}
          dir={isRTL ? 'rtl' : 'ltr'}
          {...props}
        >
          {displayMessage}
        </Text>
        {state?.errors?.verifyEmail &&
        state?.errors?.verifyEmail === 'email_not_verified' ? (
          <Text variant="link">
            <Link href={allRoutes.auth.children.verifyEmail.path}>
              {isRTL ? 'تحقق من البريد الإلكتروني' : 'Verify Email'}
            </Link>
          </Text>
        ) : null}
      </Box>
    )
  );
};

export default FormStateMessage;