import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../services/catalogApi';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO } from '../types';
import toast from 'react-hot-toast';

// --- Glasses ---
export const useGlasses = () => {
  return useQuery({
    queryKey: ['glasses'],
    queryFn: catalogApi.getGlasses,
  });
};

export const useCreateGlass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<GlassDTO, 'id'>) => catalogApi.createGlass(data),
    onSuccess: () => {
      toast.success('Vidro cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
    },
    onError: (error) => {
      console.error('Erro ao cadastrar vidro:', error);
      toast.error('Erro ao cadastrar vidro.');
    },
  });
};

export const useUpdateGlass = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: GlassDTO }) => catalogApi.updateGlass(id, data),
    onSuccess: () => {
      toast.success('Vidro atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['glasses'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar vidro:', error);
      toast.error('Erro ao atualizar vidro.');
    },
  });
};

// --- Profiles ---
export const useProfiles = () => {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: catalogApi.getProfiles,
  });
};

export const useCreateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<ProfileDTO, 'id'>) => catalogApi.createProfile(data),
    onSuccess: () => {
      toast.success('Perfil cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (error) => {
      console.error('Erro ao cadastrar perfil:', error);
      toast.error('Erro ao cadastrar perfil.');
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProfileDTO }) => catalogApi.updateProfile(id, data),
    onSuccess: () => {
      toast.success('Perfil atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil.');
    },
  });
};

// --- Hardware ---
export const useHardwares = () => {
  return useQuery({
    queryKey: ['hardwares'],
    queryFn: catalogApi.getHardwares,
  });
};

export const useCreateHardware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<HardwareDTO, 'id'>) => catalogApi.createHardware(data),
    onSuccess: () => {
      toast.success('Ferragem cadastrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['hardwares'] });
    },
    onError: (error) => {
      console.error('Erro ao cadastrar ferragem:', error);
      toast.error('Erro ao cadastrar ferragem.');
    },
  });
};

export const useUpdateHardware = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: HardwareDTO }) => catalogApi.updateHardware(id, data),
    onSuccess: () => {
      toast.success('Ferragem atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['hardwares'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar ferragem:', error);
      toast.error('Erro ao atualizar ferragem.');
    },
  });
};

// --- Films ---
export const useFilms = () => {
  return useQuery({
    queryKey: ['films'],
    queryFn: catalogApi.getFilms,
  });
};

export const useCreateFilm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<FilmDTO, 'id'>) => catalogApi.createFilm(data),
    onSuccess: () => {
      toast.success('Película cadastrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['films'] });
    },
    onError: (error) => {
      console.error('Erro ao cadastrar película:', error);
      toast.error('Erro ao cadastrar película.');
    },
  });
};

export const useUpdateFilm = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: FilmDTO }) => catalogApi.updateFilm(id, data),
    onSuccess: () => {
      toast.success('Película atualizada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['films'] });
    },
    onError: (error) => {
      console.error('Erro ao atualizar película:', error);
      toast.error('Erro ao atualizar película.');
    },
  });
};
