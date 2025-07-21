import { useFormStatus } from 'react-dom';
import { Button, ButtonProps } from './ui/button';
import { cn } from '@/lib/utils';
import { useLocale } from 'next-intl';

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
  const locale = useLocale();
  return (
    <Button
      type="submit"
      disabled={isSubmitting}
      className={cn('w-full', className)}
      {...props}
    >
      {isSubmitting
        ? submittingTitle || locale === 'en'
          ? 'Submitting...'
          : 'ارسال...'
        : title}
    </Button>
  );
};

export default SubmitButton;
