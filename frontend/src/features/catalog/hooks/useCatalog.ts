import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { catalogApi } from '../services/catalogApi';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO, ProductRequest } from '../types';
import toast from 'react-hot-toast';

interface ApiErrorResponse {
  message?: string;
  status?: number;
}

function extractErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    return axiosErr.response?.data?.message || fallback;
  }
  return fallback;
}

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
    onError: (error: unknown) => {
      console.error('Erro ao cadastrar vidro:', error);
      toast.error(extractErrorMessage(error, 'Erro ao cadastrar vidro.'));
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
    onError: (error: unknown) => {
      console.error('Erro ao atualizar vidro:', error);
      toast.error(extractErrorMessage(error, 'Erro ao atualizar vidro.'));
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
    onError: (error: unknown) => {
      console.error('Erro ao cadastrar perfil:', error);
      toast.error(extractErrorMessage(error, 'Erro ao cadastrar perfil.'));
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
    onError: (error: unknown) => {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(extractErrorMessage(error, 'Erro ao atualizar perfil.'));
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
    onError: (error: unknown) => {
      console.error('Erro ao cadastrar ferragem:', error);
      toast.error(extractErrorMessage(error, 'Erro ao cadastrar ferragem.'));
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
    onError: (error: unknown) => {
      console.error('Erro ao atualizar ferragem:', error);
      toast.error(extractErrorMessage(error, 'Erro ao atualizar ferragem.'));
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
    onError: (error: unknown) => {
      console.error('Erro ao cadastrar película:', error);
      toast.error(extractErrorMessage(error, 'Erro ao cadastrar película.'));
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
    onError: (error: unknown) => {
      console.error('Erro ao atualizar película:', error);
      toast.error(extractErrorMessage(error, 'Erro ao atualizar película.'));
    },
  });
};

// --- Material Summary ---
export const useMaterialsSummary = () => {
  return useQuery({
    queryKey: ['materialsSummary'],
    queryFn: catalogApi.getMaterialsSummary,
  });
};

// --- Products ---
export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: catalogApi.getProducts,
  });
};

export const useProductById = (id: string | undefined) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => catalogApi.getProductById(id!),
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductRequest) => catalogApi.createProduct(data),
    onSuccess: () => {
      toast.success('Produto cadastrado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao cadastrar produto:', error);
      toast.error(extractErrorMessage(error, 'Erro ao cadastrar produto.'));
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProductRequest }) => catalogApi.updateProduct(id, data),
    onSuccess: () => {
      toast.success('Produto atualizado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao atualizar produto:', error);
      toast.error(extractErrorMessage(error, 'Erro ao atualizar produto.'));
    },
  });
};

export const useInactivateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => catalogApi.inactivateProduct(id),
    onSuccess: () => {
      toast.success('Produto inativado com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: unknown) => {
      console.error('Erro ao inativar produto:', error);
      toast.error('Erro ao inativar produto.');
    },
  });
};
