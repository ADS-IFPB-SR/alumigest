import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import {
  useGlasses,
  useCreateGlass,
  useUpdateGlass,
  useProfiles,
  useCreateProfile,
  useUpdateProfile,
  useHardwares,
  useCreateHardware,
  useUpdateHardware,
  useFilms,
  useCreateFilm,
  useUpdateFilm,
  useMaterialsSummary,
  useProducts,
  useProductById,
  useCreateProduct,
  useUpdateProduct,
  useInactivateProduct,
  useMaterialFamilies,
} from '@/features/catalog/hooks/useCatalog';
import { catalogApi } from '@/features/catalog/services/catalogApi';
import toast from 'react-hot-toast';

vi.mock('@/features/catalog/services/catalogApi', () => ({
  catalogApi: {
    getGlasses: vi.fn(),
    createGlass: vi.fn(),
    updateGlass: vi.fn(),
    getProfiles: vi.fn(),
    createProfile: vi.fn(),
    updateProfile: vi.fn(),
    getHardwares: vi.fn(),
    createHardware: vi.fn(),
    updateHardware: vi.fn(),
    getFilms: vi.fn(),
    createFilm: vi.fn(),
    updateFilm: vi.fn(),
    getMaterialsSummary: vi.fn(),
    getProducts: vi.fn(),
    getProductById: vi.fn(),
    createProduct: vi.fn(),
    updateProduct: vi.fn(),
    inactivateProduct: vi.fn(),
    getMaterialFamilies: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { readonly children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCatalog Hooks [Joseph Nichollas]', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  describe('Glasses', () => {
    it('useGlasses deve consultar e retornar lista de vidros', async () => {
      const mockGlasses = { content: [{ id: '1', name: 'Vidro Temperado' }] };
      vi.mocked(catalogApi.getGlasses).mockResolvedValueOnce(mockGlasses as any);

      const { result } = renderHook(() => useGlasses(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockGlasses);
    });

    it('useCreateGlass deve cadastrar com sucesso, exibir toast e invalidar cache', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      vi.mocked(catalogApi.createGlass).mockResolvedValueOnce({ id: '2' } as any);

      const { result } = renderHook(() => useCreateGlass(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Vidro Novo' } as any);
      });

      expect(toast.success).toHaveBeenCalledWith('Vidro cadastrado com sucesso!');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['glasses'] });
    });

    it('useCreateGlass deve exibir toast de erro em caso de falha', async () => {
      vi.mocked(catalogApi.createGlass).mockRejectedValueOnce({
        response: { data: { message: 'Nome já existente' } },
      });

      const { result } = renderHook(() => useCreateGlass(), {
        wrapper: createWrapper(queryClient),
      });

      try {
        await result.current.mutateAsync({ name: 'Vidro Duplicado' } as any);
      } catch {
        // esperado
      }

      expect(toast.error).toHaveBeenCalledWith('Nome já existente');
    });

    it('useUpdateGlass deve atualizar com sucesso', async () => {
      vi.mocked(catalogApi.updateGlass).mockResolvedValueOnce({ id: 1 } as any);

      const { result } = renderHook(() => useUpdateGlass(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 1, data: { name: 'Atualizado' } as any });
      });

      expect(toast.success).toHaveBeenCalledWith('Vidro atualizado com sucesso!');
    });

    it('useUpdateGlass deve exibir toast de erro em caso de falha', async () => {
      vi.mocked(catalogApi.updateGlass).mockRejectedValueOnce(new Error('Update failed'));

      const { result } = renderHook(() => useUpdateGlass(), {
        wrapper: createWrapper(queryClient),
      });

      try {
        await result.current.mutateAsync({ id: 1, data: { name: 'Falha' } as any });
      } catch {
        // esperado
      }

      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar vidro.');
    });
  });

  describe('Profiles', () => {
    it('useProfiles deve buscar lista de perfis', async () => {
      vi.mocked(catalogApi.getProfiles).mockResolvedValueOnce({ content: [{ id: 'p1' }] } as any);

      const { result } = renderHook(() => useProfiles(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.content).toHaveLength(1);
    });

    it('useCreateProfile deve cadastrar perfil', async () => {
      vi.mocked(catalogApi.createProfile).mockResolvedValueOnce({ id: 'p2' } as any);

      const { result } = renderHook(() => useCreateProfile(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Perfil Linha 25' } as any);
      });

      expect(toast.success).toHaveBeenCalledWith('Perfil cadastrado com sucesso!');
    });

    it('useCreateProfile deve tratar erro', async () => {
      vi.mocked(catalogApi.createProfile).mockRejectedValueOnce(new Error('Erro'));

      const { result } = renderHook(() => useCreateProfile(), {
        wrapper: createWrapper(queryClient),
      });

      try {
        await result.current.mutateAsync({ name: 'Perfil' } as any);
      } catch {
        // esperado
      }

      expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar perfil.');
    });

    it('useUpdateProfile deve atualizar perfil com sucesso e tratar erro', async () => {
      vi.mocked(catalogApi.updateProfile).mockResolvedValueOnce({ id: 'p1' } as any);

      const { result } = renderHook(() => useUpdateProfile(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 1, data: { name: 'Atualizado' } as any });
      });

      expect(toast.success).toHaveBeenCalledWith('Perfil atualizado com sucesso!');

      vi.mocked(catalogApi.updateProfile).mockRejectedValueOnce(new Error('Erro'));
      try {
        await result.current.mutateAsync({ id: 1, data: { name: 'Falha' } as any });
      } catch {
        // esperado
      }
      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar perfil.');
    });
  });

  describe('Hardwares', () => {
    it('useHardwares deve buscar ferragens', async () => {
      vi.mocked(catalogApi.getHardwares).mockResolvedValueOnce({ content: [] } as any);

      const { result } = renderHook(() => useHardwares(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(catalogApi.getHardwares).toHaveBeenCalled();
    });

    it('useCreateHardware deve cadastrar ferragem com sucesso e tratar erro', async () => {
      vi.mocked(catalogApi.createHardware).mockResolvedValueOnce({ id: 'h1' } as any);

      const { result } = renderHook(() => useCreateHardware(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Puxador' } as any);
      });

      expect(toast.success).toHaveBeenCalledWith('Ferragem cadastrada com sucesso!');

      vi.mocked(catalogApi.createHardware).mockRejectedValueOnce(new Error('Erro'));
      try {
        await result.current.mutateAsync({ name: 'Erro' } as any);
      } catch {
        // esperado
      }
      expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar ferragem.');
    });

    it('useUpdateHardware deve atualizar ferragem com sucesso e tratar erro', async () => {
      vi.mocked(catalogApi.updateHardware).mockResolvedValueOnce({ id: 'h1' } as any);

      const { result } = renderHook(() => useUpdateHardware(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 1, data: { name: 'Puxador Inox' } as any });
      });

      expect(toast.success).toHaveBeenCalledWith('Ferragem atualizada com sucesso!');

      vi.mocked(catalogApi.updateHardware).mockRejectedValueOnce(new Error('Erro'));
      try {
        await result.current.mutateAsync({ id: 1, data: { name: 'Erro' } as any });
      } catch {
        // esperado
      }
      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar ferragem.');
    });
  });

  describe('Films', () => {
    it('useFilms deve buscar películas', async () => {
      vi.mocked(catalogApi.getFilms).mockResolvedValueOnce({ content: [] } as any);

      const { result } = renderHook(() => useFilms(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(catalogApi.getFilms).toHaveBeenCalled();
    });

    it('useCreateFilm deve cadastrar película e tratar erro', async () => {
      vi.mocked(catalogApi.createFilm).mockResolvedValueOnce({ id: 'f1' } as any);

      const { result } = renderHook(() => useCreateFilm(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Película G5' } as any);
      });

      expect(toast.success).toHaveBeenCalledWith('Película cadastrada com sucesso!');

      vi.mocked(catalogApi.createFilm).mockRejectedValueOnce(new Error('Erro'));
      try {
        await result.current.mutateAsync({ name: 'Erro' } as any);
      } catch {
        // esperado
      }
      expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar película.');
    });

    it('useUpdateFilm deve atualizar película e tratar erro', async () => {
      vi.mocked(catalogApi.updateFilm).mockResolvedValueOnce({ id: 'f1' } as any);

      const { result } = renderHook(() => useUpdateFilm(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 1, data: { name: 'Película G20' } as any });
      });

      expect(toast.success).toHaveBeenCalledWith('Película atualizada com sucesso!');

      vi.mocked(catalogApi.updateFilm).mockRejectedValueOnce(new Error('Erro'));
      try {
        await result.current.mutateAsync({ id: 1, data: { name: 'Erro' } as any });
      } catch {
        // esperado
      }
      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar película.');
    });
  });

  describe('Materials Summary, Families and Products', () => {
    it('useMaterialsSummary deve buscar resumo de materiais', async () => {
      vi.mocked(catalogApi.getMaterialsSummary).mockResolvedValueOnce({ total: 10 } as any);

      const { result } = renderHook(() => useMaterialsSummary(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual({ total: 10 });
    });

    it('useMaterialFamilies deve buscar famílias com ou sem groupCode', async () => {
      vi.mocked(catalogApi.getMaterialFamilies).mockResolvedValueOnce(['Família 1', 'Família 2']);

      const { result } = renderHook(() => useMaterialFamilies('ALUMINUM'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(catalogApi.getMaterialFamilies).toHaveBeenCalledWith('ALUMINUM');
    });

    it('useProducts e useProductById devem buscar produtos corretamente', async () => {
      vi.mocked(catalogApi.getProducts).mockResolvedValueOnce({ content: [{ id: 'p1' }] } as any);
      vi.mocked(catalogApi.getProductById).mockResolvedValueOnce({ id: 'p1', name: 'Janela 2 Folhas' } as any);

      const { result: resList } = renderHook(() => useProducts(), {
        wrapper: createWrapper(queryClient),
      });
      await waitFor(() => expect(resList.current.isSuccess).toBe(true));

      const { result: resDetail } = renderHook(() => useProductById('p1'), {
        wrapper: createWrapper(queryClient),
      });
      await waitFor(() => expect(resDetail.current.isSuccess).toBe(true));
      expect(catalogApi.getProductById).toHaveBeenCalledWith('p1');
    });

    it('useCreateProduct deve cadastrar produto e tratar erro', async () => {
      vi.mocked(catalogApi.createProduct).mockResolvedValueOnce({ id: 'prod-new' } as any);

      const { result } = renderHook(() => useCreateProduct(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ name: 'Janela' } as any);
      });

      expect(toast.success).toHaveBeenCalledWith('Produto cadastrado com sucesso!');

      vi.mocked(catalogApi.createProduct).mockRejectedValueOnce(new Error('Erro'));
      try {
        await result.current.mutateAsync({ name: 'Erro' } as any);
      } catch {
        // esperado
      }
      expect(toast.error).toHaveBeenCalledWith('Erro ao cadastrar produto.');
    });

    it('useUpdateProduct deve atualizar produto e tratar erro', async () => {
      vi.mocked(catalogApi.updateProduct).mockResolvedValueOnce({ id: 'prod-1' } as any);

      const { result } = renderHook(() => useUpdateProduct(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync({ id: 'prod-1', data: { name: 'Janela Atualizada' } as any });
      });

      expect(toast.success).toHaveBeenCalledWith('Produto atualizado com sucesso!');

      vi.mocked(catalogApi.updateProduct).mockRejectedValueOnce(new Error('Erro'));
      try {
        await result.current.mutateAsync({ id: 'prod-1', data: { name: 'Erro' } as any });
      } catch {
        // esperado
      }
      expect(toast.error).toHaveBeenCalledWith('Erro ao atualizar produto.');
    });

    it('useInactivateProduct deve inativar produto e tratar erro', async () => {
      vi.mocked(catalogApi.inactivateProduct).mockResolvedValueOnce(undefined as any);

      const { result } = renderHook(() => useInactivateProduct(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync('prod-1');
      });

      expect(toast.success).toHaveBeenCalledWith('Produto inativado com sucesso!');

      vi.mocked(catalogApi.inactivateProduct).mockRejectedValueOnce(new Error('Erro'));
      try {
        await result.current.mutateAsync('prod-1');
      } catch {
        // esperado
      }
      expect(toast.error).toHaveBeenCalledWith('Erro ao inativar produto.');
    });
  });
});
