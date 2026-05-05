import { api } from '@/shared/api/axios';

interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
}

// The HttpOnly refresh token cookie is sent automatically by the browser
// (withCredentials: true is set on the axios instance). No body required.
export const refreshTokenApi = async (): Promise<RefreshResponse> => {
  const res = await api.post('/auth/refresh');
  return res.data.data;
};
