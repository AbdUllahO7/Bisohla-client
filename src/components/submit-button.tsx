import { useFormStatus } from 'react-dom';
import { Button, ButtonProps } from './ui/button';
import { cn } from '@/lib/utils';

interface SubmitButtonProps extends ButtonProps {
  title: string;
  submittingTitle?: string;
  className?: string;
}

const SubmitButton = ({
  title,
  submittingTitle,
  className,
  ...props
}: SubmitButtonProps) => {
  const { pending: isSubmitting } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn('w-full', className)}
      {...props}
    >
      {isSubmitting ? submittingTitle || 'Submitting...' : title}
    </Button>
  );
};

export default SubmitButton;
