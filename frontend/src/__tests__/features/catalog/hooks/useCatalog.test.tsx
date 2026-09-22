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
  useHardwares,
  useFilms,
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
    getFilms: vi.fn(),
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

describe('useCatalog Hooks', () => {
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

  describe('useGlasses and Mutations', () => {
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

      await act(async () => {
        try {
          await result.current.mutateAsync({ name: 'Vidro Duplicado' } as any);
        } catch {
          // esperado
        }
      });

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
  });

  describe('useProfiles, useHardwares, useFilms', () => {
    it('useProfiles deve buscar lista de perfis', async () => {
      vi.mocked(catalogApi.getProfiles).mockResolvedValueOnce({ content: [{ id: 'p1' }] } as any);

      const { result } = renderHook(() => useProfiles(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.content.length).toBe(1);
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

    it('useHardwares deve buscar ferragens', async () => {
      vi.mocked(catalogApi.getHardwares).mockResolvedValueOnce({ content: [] } as any);

      const { result } = renderHook(() => useHardwares(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(catalogApi.getHardwares).toHaveBeenCalled();
    });

    it('useFilms deve buscar películas', async () => {
      vi.mocked(catalogApi.getFilms).mockResolvedValueOnce({ content: [] } as any);

      const { result } = renderHook(() => useFilms(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(catalogApi.getFilms).toHaveBeenCalled();
    });
  });
});
