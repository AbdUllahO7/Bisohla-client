import { z } from 'zod';
import { selectRoleSchema } from '../permissions/roles.dto';




// Define profile schema based on our DTO
export const profileFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }).max(50, {
    message: "Name must not be longer than 50 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  phone: z.string().nullable().optional(),
  bio: z.string().max(160).optional(),
  // We'll handle password separately
  password: z.string().min(8).max(255).nullable().optional(),
  passwordConfirmation: z.string().min(8).max(255).nullable().optional(),
  profileUrl: z.string().nullable().optional()
})
  .refine((data) => {
    if (data.password && !data.passwordConfirmation) return false;
    if (!data.password && data.passwordConfirmation) return false;
    if (data.password && data.passwordConfirmation && data.password !== data.passwordConfirmation) return false;
    return true;
  }, {
    message: "Passwords do not match",
    path: ["passwordConfirmation"],
  });

export type ProfileFormValues = z.infer<typeof profileFormSchema>


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
  roles: z.array(usersToRolesSchema).optional(),
  usersToRoles: z.array(usersToRolesSchema).optional(),
  createdAt: z.string(),
  profileUrl: z.string().optional(),
  phone: z.string().optional().nullable(),
});

export type SelectUserDto = z.infer<typeof selectUserSchema>;

export const selectUserWithTransformedRolesSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(50),
  roles: z.array(selectRoleSchema).optional(),
  usersToRoles: z.array(usersToRolesSchema).optional(),
  createdAt: z.string(),
  profileUrl: z.string().optional(),
});

export type SelectUserWithTransformedRolesType = z.infer<
  typeof selectUserWithTransformedRolesSchema
>;

export const CreateUserSchema = selectUserSchema
  .omit({
    id: true,
    createdAt: true,
    profileUrl: true,
    roles: true,
  })
  .extend({
    password: z.string().min(8).max(255),
    passwordConfirmation: z.string().min(8).max(255),
    profileUrl: z.string().optional(),
    roles: z.array(z.number()),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password confirmation must match the password',
    path: ['passwordConfirmation'], // Target the password_confirmation field for the error
  });
// .extend({
// });

export type CreateUserDto = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = selectUserSchema
  .omit({
    id: true,
    createdAt: true,
    profileUrl: true,
    roles: true,
  })
  .extend({
    password: z.string().min(8).max(255).optional(),
    passwordConfirmation: z.string().min(8).max(255).optional(),
    profileUrl: z.string().optional().nullable(),
    roles: z.array(z.number()),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password confirmation must match the password',
    path: ['passwordConfirmation'], // Target the password_confirmation field for the error
  });
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>;

export type CreateUserResponse = SelectUserDto;
export type UpdateUserResponse = SelectUserDto;
