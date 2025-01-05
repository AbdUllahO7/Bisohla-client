interface LoginResponse {
  id: number;
  name: string;
  roles: string[];
  permissions: string[];
  accessToken: string;
  refreshToken: string;
}
