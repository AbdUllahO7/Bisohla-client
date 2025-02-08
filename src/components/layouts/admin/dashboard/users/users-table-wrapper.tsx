'use client';

import { FormColumn } from '@/components/add-edit-form';

import {
  CreateUserDto,
  CreateUserSchema,
  SelectUserDto,
  UsersToRolesType,
} from '@/core/entities/models/users/users.dto';
import AdminEditForm from '../../admin-edit-form';
import DeleteIconButton from '@/components/delete-icon.button';
import Box from '@/components/box/box';
import AdminAddForm from '../../admin-add-form';
import AdminTable from '../../admin-table';
import Image from 'next/image';
import {
  useCreateUser,
  usePaginatedUsers,
} from '@/app/[locale]/admin/dashboard/users/use-actions';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import RolesSelect from './roles-select';
import { useQueryClient } from '@tanstack/react-query';

const columns: FormColumn<SelectUserDto>[] = [
  {
    key: 'id',
    header: 'ID',
    width: '100px',
    sortable: true,
  },
  {
    key: 'profileUrl',
    header: 'Profile URL',
    sortable: false,
    render: (value) =>
      value ? (
        <div className="w-[120px] h-[150px] relative flex gap-2">
          <Image
            src={value}
            alt={value}
            fill
            quality={100}
            className="rounded w-full h-full"
          />
        </div>
      ) : (
        <X className="text-danger" />
      ),
    inputConfig: {
      type: 'image',
      required: false,
    },
  },
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    inputConfig: {
      type: 'text',
      required: true,
    },
  },
  {
    key: 'usersToRoles',
    header: 'Roles',
    sortable: true,
    render: (value) => {
      return value?.map((userToRole: UsersToRolesType, key: number) => {
        return <Badge key={key}>{userToRole.role.name}</Badge>;
      });
    },
    inputConfig: {
      render: (props) => <RolesSelect {...props} />,
    },
  },
  {
    key: 'email',
    header: 'Email',
    sortable: true,
    inputConfig: {
      type: 'text',
      required: true,
    },
  },
  {
    key: 'password',
    header: 'Password',
    hidden: true,
    sortable: false,
    inputConfig: {
      type: 'text',
      required: true,
    },
  },
  {
    key: 'passwordConfirmation',
    header: 'Password Confirmation',
    hidden: true,
    sortable: false,
    inputConfig: {
      type: 'text',
      required: true,
    },
  },

  {
    key: 'createdAt',
    header: 'Created At',
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
  {
    key: 'actions',
    header: 'Actions',
    align: 'left',
    actions: true,

    render: (_, row) => (
      <div className="flex items-center justify-start gap-2">
        <AdminEditForm
          columns={columns}
          onSave={(data) => console.log('Save new data:', data)}
          updateSchema={CreateUserSchema}
          defaultValues={row}
          dialogTitle="Edit User"
        />
        <DeleteIconButton />
      </div>
    ),
  },
];

const UsersTableWrapper = () => {
  const { mutate, isPending, isError, error } = useCreateUser();
  const queryClient = useQueryClient();

  const handleCreateUser = (data: CreateUserDto) => {
    mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      },
      onError: (error) => {
        console.error('Error creating user:', error);
      },
    });
  };
  return (
    <Box variant="column" className="w-full items-start">
      <AdminAddForm<SelectUserDto, CreateUserDto>
        columns={columns}
        onSave={handleCreateUser}
        createSchema={CreateUserSchema}
        buttonTitle="Add User"
        dialogTitle="Create New User"
        dialogDescription=""
      />
      <AdminTable<SelectUserDto>
        columns={columns}
        useFetchData={usePaginatedUsers}
      />
    </Box>
  );
};

export default UsersTableWrapper;
