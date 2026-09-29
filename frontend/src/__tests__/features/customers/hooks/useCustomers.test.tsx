import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { useCustomers, useCustomer, useCreateCustomer } from '@/features/customers/hooks/useCustomers';
import { customersApi } from '@/features/customers/services/customersApi';
import toast from 'react-hot-toast';

vi.mock('@/features/customers/services/customersApi', () => ({
  customersApi: {
    getCustomers: vi.fn(),
    getCustomerById: vi.fn(),
    createCustomer: vi.fn(),
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

describe('useCustomers Hooks', () => {
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

  describe('useCustomers Query', () => {
    it('deve buscar clientes com parâmetros fornecidos', async () => {
      const mockResult = {
        content: [{ id: '1', nomeCompleto: 'João Silva', personType: 'FISICA', documento: '123', ativo: true }],
        page: { size: 20, number: 0, totalElements: 1, totalPages: 1 },
      };
      vi.mocked(customersApi.getCustomers).mockResolvedValueOnce(mockResult as any);

      const params = { busca: 'João', ativo: true };
      const { result } = renderHook(() => useCustomers(params), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(customersApi.getCustomers).toHaveBeenCalledWith(params);
      expect(result.current.data).toEqual(mockResult);
    });
  });

  describe('useCustomer Query (Single)', () => {
    it('deve buscar cliente por ID quando fornecido', async () => {
      const mockCustomer = { id: 'cust-10', nomeCompleto: 'Maria Souza', personType: 'FISICA', documento: '456', ativo: true };
      vi.mocked(customersApi.getCustomerById).mockResolvedValueOnce(mockCustomer as any);

      const { result } = renderHook(() => useCustomer('cust-10'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(customersApi.getCustomerById).toHaveBeenCalledWith('cust-10');
      expect(result.current.data).toEqual(mockCustomer);
    });

    it('não deve executar a query quando id for indefinido (enabled: false)', () => {
      const { result } = renderHook(() => useCustomer(undefined), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(customersApi.getCustomerById).not.toHaveBeenCalled();
    });
  });

  describe('useCreateCustomer Mutation', () => {
    it('deve criar cliente, disparar toast de sucesso e invalidar query de clientes', async () => {
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const payload = { nomeCompleto: 'Novo Cliente', personType: 'FISICA' as const };
      vi.mocked(customersApi.createCustomer).mockResolvedValueOnce({ id: 'new-id', ...payload, documento: '', ativo: true });

      const { result } = renderHook(() => useCreateCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      await act(async () => {
        await result.current.mutateAsync(payload);
      });

      expect(customersApi.createCustomer).toHaveBeenCalledWith(payload);
      expect(toast.success).toHaveBeenCalledWith('Cliente cadastrado com sucesso!');
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['customers'] });
    });

    it('deve disparar toast de erro com a mensagem do backend em caso de falha', async () => {
      vi.mocked(customersApi.createCustomer).mockRejectedValueOnce({
        response: { data: { message: 'Documento já cadastrado.' } },
      });

      const { result } = renderHook(() => useCreateCustomer(), {
        wrapper: createWrapper(queryClient),
      });

      try {
        await result.current.mutateAsync({ nomeCompleto: 'Duplicado', personType: 'FISICA' });
      } catch {
        // esperado
      }

      expect(toast.error).toHaveBeenCalledWith('Documento já cadastrado.');
    });
  });
});
