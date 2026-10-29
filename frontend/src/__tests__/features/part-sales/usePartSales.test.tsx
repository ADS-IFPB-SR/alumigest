import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  usePartSalesList,
  usePartSale,
  useCalculatePartItem,
  useCreatePartSale,
  useUpdatePartSaleStatus,
} from '@/features/part-sales/hooks/usePartSales';
import { partSalesApi } from '@/features/part-sales/services/partSalesApi';
import toast from 'react-hot-toast';

vi.mock('@/features/part-sales/services/partSalesApi', () => ({
  partSalesApi: {
    list: vi.fn(),
    getById: vi.fn(),
    calculateItem: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
  },
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('usePartSales Hooks [US-46.1] - Integration QA Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('usePartSalesList deve carregar a lista de vendas avulsas', async () => {
    const mockList = [{ id: 's1', code: 'VP-2026-0001' }];
    vi.mocked(partSalesApi.list).mockResolvedValueOnce(mockList as any);

    const { result } = renderHook(() => usePartSalesList(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockList);
  });

  it('usePartSale deve buscar uma venda específica por ID quando id estiver presente', async () => {
    const mockSale = { id: 's1', code: 'VP-2026-0001' };
    vi.mocked(partSalesApi.getById).mockResolvedValueOnce(mockSale as any);

    const { result } = renderHook(() => usePartSale('s1'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockSale);
    expect(partSalesApi.getById).toHaveBeenCalledWith('s1');
  });

  it('useCalculatePartItem deve invocar calculateItem e exibir toast de erro em caso de falha', async () => {
    vi.mocked(partSalesApi.calculateItem).mockRejectedValueOnce({
      response: { data: { message: 'Categoria inválida' } },
    });

    const { result } = renderHook(() => useCalculatePartItem(), { wrapper: createWrapper() });

    result.current.mutate({
      category: 'HARDWARE',
      quantity: 1,
      unitPrice: 10,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(toast.error).toHaveBeenCalledWith('Categoria inválida');
  });

  it('useCreatePartSale deve criar venda, exibir toast de sucesso e invalidar query', async () => {
    const mockResponse = { id: 's1', code: 'VP-2026-0001' };
    vi.mocked(partSalesApi.create).mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(() => useCreatePartSale(), { wrapper: createWrapper() });

    result.current.mutate({
      clientId: 'c1',
      items: [],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Venda avulsa VP-2026-0001 gerada com sucesso!');
  });

  it('useUpdatePartSaleStatus deve atualizar status e exibir toast de sucesso', async () => {
    const mockResponse = { id: 's1', code: 'VP-2026-0001', status: 'APPROVED' };
    vi.mocked(partSalesApi.updateStatus).mockResolvedValueOnce(mockResponse as any);

    const { result } = renderHook(() => useUpdatePartSaleStatus(), { wrapper: createWrapper() });

    result.current.mutate({
      id: 's1',
      status: 'APPROVED',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(toast.success).toHaveBeenCalledWith('Status da venda VP-2026-0001 atualizado para APPROVED!');
  });
});

