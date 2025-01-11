interface LoginResponse {
  message: string;
  id: number;
  name: string;
  roles: string[];
  permissions: string[];
  accessToken: string;
  refreshToken: string;
}

interface SignoutResponse {
  message: string;
}

interface SendEmailVerificationResponse {
  message: string;
  success: boolean;
}

interface SendEmailResponse {
  message: string;
  success: boolean;
}

interface ResetPasswordResponse {
  message: string;
}
