import { ApiResponse } from '@/interfaces/api-response.interface';
import Text, { TextProps } from '@/components/text/text';
import { cn } from '@/lib/utils';

interface FormStateMessageProps extends TextProps {
  state: ApiResponse;
}

const FormStateMessage = ({
  state,
  className,
  ...props
}: FormStateMessageProps) => {
  return (
    state.message && (
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
    )
  );
};

export default FormStateMessage;
