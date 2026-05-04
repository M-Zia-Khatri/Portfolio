import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createSkill, deleteSkill, fetchSkills, updateSkill } from './skills.api';

export const useSkillsData = () => {
  return useQuery({
    queryKey: ['skills'],
    queryFn: () => fetchSkills(),
  });
};

export const useSkillsCodeData = () => {
  return useQuery({
    queryKey: ['skills-code'],
    queryFn: () => fetchSkills('code'),
  });
};

export const useCreateSkill = (onError?: (err: unknown) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newSkill: unknown) => createSkill(newSkill),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
    onError,
  });
};

export const useUpdateSkill = (onError?: (err: unknown) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: unknown }) => updateSkill(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
    onError,
  });
};

export const useDeleteSkill = (onError?: (err: unknown) => void) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSkill(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['skills'] }),
    onError,
  });
};
