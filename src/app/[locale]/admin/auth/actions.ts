import { allRoutes } from '@/constants/routes.constant';
import { ApiResponse } from '@/core/entities/api/success.response';
import { LoginDto, LoginResponse } from '@/core/entities/models/auth/login.dto';
import { getInjection } from '@/di/container';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export const signInAction = async (
  state: ApiResponse<LoginResponse>,
  formData: FormData,
): Promise<ApiResponse<LoginResponse>> => {
  const fields = {
    email: formData.get('email'),
    password: formData.get('password'),
  };

  const authController = getInjection('IAuthController');

  const res = await authController.login(fields as LoginDto);

  if (res.success) {
    revalidatePath('/');
    redirect(allRoutes.user.children.dashboard.path);
  }

  return res;
};
