import { TrashIcon } from 'lucide-react';
import { Button, ButtonProps } from './ui/button';

const DeleteIconButton = ({ ...props }: ButtonProps) => {
  return (
    <Button variant="outline" size="icon" {...props}>
      <TrashIcon className="text-danger" />
    </Button>
  );
};

export default DeleteIconButton;
