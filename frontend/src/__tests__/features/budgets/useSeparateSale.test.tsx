import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { useCreateSeparateSale } from '../../../features/budgets/hooks/useSeparateSale';
import { api } from '../../../lib/api';
import toast from 'react-hot-toast';

vi.mock('../../../lib/api', () => ({
  api: {
    post: vi.fn(),
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
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('useSeparateSale Hook [Joseph Nichollas]', () => {
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

  it('deve adicionar venda avulsa com sucesso, exibir toast e invalidar query budgets', async () => {
    const saleData = {
      productId: 'prod-item-1',
      description: 'Chapa de Vidro Avulsa',
      quantity: 1,
      unitPrice: 250,
      widthMm: 1000,
      heightMm: 1000,
    };

    vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'sale-1', ...saleData } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateSeparateSale(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate(saleData as any);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(api.post).toHaveBeenCalledWith('/budgets/separate-sale', saleData);
    expect(toast.success).toHaveBeenCalledWith('Venda de parte adicionada ao orçamento!');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] });
  });

  it('deve exibir toast de erro com a mensagem do backend em caso de falha', async () => {
    vi.mocked(api.post).mockRejectedValueOnce({
      response: {
        data: {
          message: 'Estoque insuficiente para o insumo.',
        },
      },
    });

    const { result } = renderHook(() => useCreateSeparateSale(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      productId: 'prod-item-1',
      description: 'Insumo',
      quantity: 100,
      unitPrice: 10,
    } as any);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith('Estoque insuficiente para o insumo.');
  });

  it('deve exibir mensagem de erro genérica quando o backend não retornar detalhes', async () => {
    vi.mocked(api.post).mockRejectedValueOnce(new Error('Falha de rede'));

    const { result } = renderHook(() => useCreateSeparateSale(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({
      productId: 'prod-item-1',
      description: 'Insumo',
      quantity: 1,
      unitPrice: 10,
    } as any);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith('Erro ao processar a requisição.');
  });
});
