import { FieldError } from 'react-hook-form';
import Box from './box/box';
import Text from './text/text';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';

interface DetailedInputProps {
  type: string;
  placeholder: string;
  name: string;
  register?: Record<string, unknown>; // Accept the result of register() directly
  error: FieldError | undefined;
  caption: string;
  className?: string;
  value?: string | number | undefined;
}

const DetailedInput = (props: DetailedInputProps) => {
  const {
    type,
    placeholder,
    error,
    register,
    className,
    caption,
    name,
    value,
  } = props;
  return (
    <Box variant="column" className="w-full items-start">
      <Text variant="p">{caption}</Text>
      <Input
        {...register}
        name={name}
        type={type}
        placeholder={placeholder}
        className={cn(className, error ? 'border-red-500' : '')}
        value={value}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-1">
          {
            Array.isArray(error) ? error[0] : error // Assuming error is a FieldError
          }
        </Text>
      )}
    </Box>
  );
};

export default DetailedInput;
