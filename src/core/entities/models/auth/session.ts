import { JWTPayload } from 'jose';

export interface UserSession {
  user: {
    id: number;
    name: string;
    roles: string[];
    permissions: string[];
  };
}

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

