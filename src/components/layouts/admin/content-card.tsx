import Box from '@/components/box/box';
import { cn } from '@/lib/utils';
import { PropsWithChildren } from 'react';

const ContentCard = ({
  children,
  className,
}: { className?: string } & PropsWithChildren) => {
  return (
    <Box
      variant="column"
      className={cn(
        'bg-white w-full h-full p-4 shadow-md roudned-md border border-gray-100',
        className,
      )}
    >
      {children}
    </Box>
  );
};

export default ContentCard;
