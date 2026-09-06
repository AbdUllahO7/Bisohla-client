'use server';

import { ApiResponse } from '@/core/entities/interfaces/api-response.interface';
import {
  RegisterFormSchema,
  RegisterFormValues,
} from '@/core/entities/models/auth/register-form-schema';
import { redirect } from 'next/navigation';
import { SessionExpiredError } from '@/core/entities/errors/session-expired-error';
import { deleteSession, updateTokens } from '@/core/lib/web/session';
import { allRoutes } from '@/constants/routes.constant';
import { revalidatePath } from 'next/cache';
import { postReq, postAuthReq } from '@/core/lib/api';
import { BACKEND_URL } from '@/core/lib/web/constants';

export const handleRegister = async (
  state: ApiResponse<RegisterFormValues>,
  data: FormData,
) => {
  const fields = {
    email: data.get('email') as string,
    password: data.get('password') as string,
    passwordConfirmation: data.get('passwordConfirmation') as string,
    name: data.get('name') as string,
    acceptedLegal: data.get('acceptedLegal') === 'on' || data.get('acceptedLegal') === 'true',
  };

  const res = await postReq<typeof fields, RegisterFormValues>({
    url: '/auth/register',
    body: fields,
    validationSchema: RegisterFormSchema,
    errorDefaultMessage: 'Failed to register.',
  });

  // If there's an error (validation or API), preserve the form data
  // BUT don't preserve passwords for security
  if (!res.success) {
    return {
      ...res,
      data: {
        email: fields.email,
        name: fields.name,
        acceptedLegal: fields.acceptedLegal,
        password: '', // Don't preserve password
        passwordConfirmation: '', // Don't preserve password confirmation
      } as RegisterFormValues,
    };
  }

  // If successful, include the email and name for the success screen
  if (res.success) {
    //TODO: send verification email
    return {
      ...res,
      data: {
        email: fields.email,
        name: fields.name,
        acceptedLegal: fields.acceptedLegal,
        password: '',
        passwordConfirmation: '',
      } as RegisterFormValues,
    };
  }

  return res;
};  
export const validateResetPasswordToken = async (token: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fields = {};
  const res = await postReq<typeof fields, ResetPasswordResponse>({
    url: `/auth/check-reset-password-token?token=${token}`,
    errorDefaultMessage: 'Failed to send verification email.',
  });

  return res;
};

/**
 * In-flight refreshes keyed by the token being redeemed. A page renders many
 * server actions at once and they would each redeem the SAME token; the backend
 * rotates on every redemption, so without this only one would win and the rest
 * would burn grace-window replays and pollute the reuse-detection signal.
 * Keyed by token (not a single global slot) so a stale in-flight refresh can
 * never be handed to a caller that already holds a newer token.
 */
const inFlightRefreshes = new Map<string, Promise<string>>();

const refreshOnce = async (oldRefreshToken: string): Promise<string> => {
  let backendRes: Response;

  try {
    backendRes = await fetch(BACKEND_URL + '/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: oldRefreshToken }),
    });
  } catch (error) {
    // Never reached the server — the session may well still be good.
    throw new Error(
      `Refresh request failed: ${(error as Error)?.message ?? 'network error'}`,
    );
  }

  const responseData = await backendRes.json().catch(() => ({}));

  if (!backendRes.ok || !responseData?.success) {
    // Only the backend explicitly rejecting the token itself means the session
    // is over. A 5xx/429/parse failure is transient and must leave it intact,
    // or a blip of downtime signs every visitor out.
    if (backendRes.status === 401 || backendRes.status === 403) {
      await deleteSession();
      throw new SessionExpiredError(
        responseData?.message || 'Refresh token rejected',
      );
    }

    throw new Error(
      responseData?.message || `Failed to refresh token (${backendRes.status})`,
    );
  }

  const { accessToken, refreshToken } = responseData.data;

  // Rotation is unconditional server-side: dropping the new refresh token here
  // makes the NEXT refresh present a dead token and force a re-login.
  await updateTokens({ accessToken, refreshToken });

  return accessToken;
};

export const handleRefreshToken = async (
  oldRefreshToken: string,
): Promise<string> => {
  const pending = inFlightRefreshes.get(oldRefreshToken);
  if (pending) return pending;

  const attempt = refreshOnce(oldRefreshToken).finally(() => {
    inFlightRefreshes.delete(oldRefreshToken);
  });

  inFlightRefreshes.set(oldRefreshToken, attempt);

  return attempt;
};
