'use client';

import Box from '@/components/box/box';
import Text from '@/components/text/text';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SelectRoleDto } from '@/core/entities/models/permissions/roles.dto';
import { useRoles } from '@/hooks/use-server/user-roles';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface RolesSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

const RolesSelect = ({
  value,
  onChange,
  error,
  placeholder = 'Select a role',
  disabled = false,
}: RolesSelectProps) => {
  const {
    data: rolesData,
    isPending,
    isError,
  } = useRoles({ page: 1, pageSize: 20 });

  const roles = rolesData?.data?.data ?? [];
  // console.log(rolesData);

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load roles. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  if (isPending) {
    return <Skeleton className="h-10 w-full" />;
  }

  return (
    <Box variant="column" className="w-full space-y-2">
      <Select
        onValueChange={onChange}
        value={value}
        disabled={disabled || roles.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {roles.map((role: SelectRoleDto) => (
            <SelectItem
              key={role.id}
              value={role.name}
              className="cursor-pointer"
            >
              {role.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <Text variant="small" className="text-destructive">
          {error}
        </Text>
      )}

      {roles.length === 0 && !isPending && !isError && (
        <Text variant="small" className="text-muted-foreground">
          No roles available
        </Text>
      )}
    </Box>
  );
};

export default RolesSelect;
