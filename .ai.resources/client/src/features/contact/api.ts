import { api } from '@/shared/api/axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Contact } from './types';
import type { ContactFormData } from './schema/contact.schema';

export const contactKeys = {
  all: ['contacts'] as const,
};

export const submitContactForm = async (payload: ContactFormData): Promise<Contact> => {
  const response = await api.post<Contact>('/contact', payload);
  return response.data;
};

export const useContacts = () => {
  return useQuery<Contact[]>({
    queryKey: contactKeys.all,
    queryFn: async () => {
      const response = await api.get('/contact');
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      if (data?.contacts && Array.isArray(data.contacts)) return data.contacts;
      return [];
    },
  });
};

export const useDeleteContact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/contact/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactKeys.all });
    },
  });
};