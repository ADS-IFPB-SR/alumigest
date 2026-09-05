import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '../services/catalogApi';
import type { GlassDTO, ProfileDTO, HardwareDTO, FilmDTO, ProductRequest } from '../types';
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
    onError: (error: any) => {
      console.error('Erro ao cadastrar vidro:', error);
      const message = error?.response?.data?.message || 'Erro ao cadastrar vidro.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao atualizar vidro:', error);
      const message = error?.response?.data?.message || 'Erro ao atualizar vidro.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao cadastrar perfil:', error);
      const message = error?.response?.data?.message || 'Erro ao cadastrar perfil.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao atualizar perfil:', error);
      const message = error?.response?.data?.message || 'Erro ao atualizar perfil.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao cadastrar ferragem:', error);
      const message = error?.response?.data?.message || 'Erro ao cadastrar ferragem.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao atualizar ferragem:', error);
      const message = error?.response?.data?.message || 'Erro ao atualizar ferragem.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao cadastrar película:', error);
      const message = error?.response?.data?.message || 'Erro ao cadastrar película.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao atualizar película:', error);
      const message = error?.response?.data?.message || 'Erro ao atualizar película.';
      toast.error(message);
    },
  });
};

// --- Product Categories ---
export const useProductCategories = () => {
  return useQuery({
    queryKey: ['productCategories'],
    queryFn: catalogApi.getProductCategories,
  });
};

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) => catalogApi.createProductCategory(data),
    onSuccess: () => {
      toast.success('Categoria cadastrada com sucesso!');
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
    },
    onError: (error: any) => {
      console.error('Erro ao cadastrar categoria:', error);
      const message = error?.response?.data?.message || 'Erro ao cadastrar categoria.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao cadastrar produto:', error);
      const message = error?.response?.data?.message || 'Erro ao cadastrar produto.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao atualizar produto:', error);
      const message = error?.response?.data?.message || 'Erro ao atualizar produto.';
      toast.error(message);
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
    onError: (error: any) => {
      console.error('Erro ao inativar produto:', error);
      toast.error('Erro ao inativar produto.');
    },
  });
};

