import { z } from 'zod';
import { selectRoleSchema } from '../permissions/roles.dto';

export const usersToRolesSchema = z.object({
  id: z.number(),
  userId: z.number(),
  roleId: z.number(),
  role: selectRoleSchema,
});

export type UsersToRolesType = z.infer<typeof usersToRolesSchema>;

export const selectUserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(50),
  usersToRoles: z.array(usersToRolesSchema).optional(),
  createdAt: z.string(),
  profileUrl: z.string().nullable(),
});

export const CreateUserSchema = selectUserSchema
  .omit({
    id: true,
    createdAt: true,
    profileUrl: true,
    // usersToRoles: true,
  })
  .extend({
    password: z.string().min(8).max(255),
    passwordConfirmation: z.string().min(8).max(255),
    profileUrl: z.instanceof(File),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password confirmation must match the password',
    path: ['passwordConfirmation'], // Target the password_confirmation field for the error
  });
// .extend({
// });

export type SelectUserDto = z.infer<typeof selectUserSchema>;

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export type UpdateUserDto = z.infer<typeof CreateUserSchema>;

export type CreateUserResponse = SelectUserDto;
