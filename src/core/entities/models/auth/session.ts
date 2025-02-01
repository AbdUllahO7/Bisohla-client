import { JWTPayload } from 'jose';

export interface Session extends JWTPayload {
  user: {
    id: number;
    name: string;
    roles: string[];
    permissions: string[];
  };
  accessToken: string;
  refreshToken: string;
}
