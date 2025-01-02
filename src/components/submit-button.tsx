import { useFormStatus } from 'react-dom';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface SubmitButtonProps {
  title: string;
  submittingTitle?: string;
  className?: string;
}

const SubmitButton = ({
  title,
  submittingTitle,
  className,
}: SubmitButtonProps) => {
  const { pending: isSubmitting } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn('w-full', className)}
    >
      {isSubmitting ? submittingTitle || 'Submitting...' : title}
    </Button>
  );
};

export default SubmitButton;
