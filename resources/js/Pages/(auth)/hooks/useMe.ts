import { api } from '@/shared/api/axios';
import { useQuery } from '@tanstack/react-query';
import type { AuthUser } from '../types';

export const useMe = () => {
  return useQuery<AuthUser>({
    queryKey: ['me'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data as AuthUser;
    },
    retry: false,
    // Don't refetch on window focus — the interceptor handles silent refresh
    refetchOnWindowFocus: false,
  });
};
