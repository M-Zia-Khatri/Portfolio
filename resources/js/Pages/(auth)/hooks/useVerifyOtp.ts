import { api } from '@/shared/api/axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAccessToken } from '../utils/tokenManager';

interface VerifyOtpPayload {
  email: string;
  otp: string;
}

interface VerifyOtpResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

export const useVerifyOtp = () => {
  const queryClient = useQueryClient();

  return useMutation<VerifyOtpResponse, Error, VerifyOtpPayload>({
    mutationFn: async (body) => {
      const res = await api.post('/auth/verify-otp', body);
      return res.data.data;
    },
    onSuccess: (data) => {
      // 1. Store the short-lived access token in memory
      setAccessToken(data.accessToken);

      // 2. Invalidate useMe so AuthProvider re-fetches GET /auth/me and
      //    syncs the user into the Zustand store → isAuthenticated becomes true
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
};
