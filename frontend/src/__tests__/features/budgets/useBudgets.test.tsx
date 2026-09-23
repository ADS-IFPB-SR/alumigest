import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { useApplyDiscount, useDownloadPdfTecnico } from '../../../features/budgets/hooks/useBudgets';
import { budgetsApi } from '../../../features/budgets/services/budgetsApi';
import type { DiscountRequest, Budget } from '../../../features/budgets/types';
import toast from 'react-hot-toast';


vi.mock('../../../features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    applyDiscount: vi.fn(),
    downloadPdfTecnico: vi.fn(),
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

describe('useApplyDiscount Hook', () => {
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

  it('deve aplicar desconto com sucesso, disparar toast e invalidar as query keys relevantes', async () => {
    const budgetId = 'budget-123';
    const discountData: DiscountRequest = {
      discountType: 'PERCENTUAL',
      value: 10,
      paymentCondition: 'A_VISTA_PIX',
      paymentNotes: 'Desconto à vista',
    };

    const mockResponse: Budget = {
      id: budgetId,
      code: 'ORC-2026-001',
      customerName: 'Cliente Teste',
      status: 'DRAFT',
      createdAt: '2026-09-15T10:00:00Z',
      validUntil: '2026-09-30T23:59:59Z',
      subtotal: 1000,
      discountPercent: 10,
      discountValue: 100,
      total: 900,
      itemCount: 1,
      items: [],
    };

    vi.mocked(budgetsApi.applyDiscount).mockResolvedValueOnce(mockResponse);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useApplyDiscount(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: budgetId, data: discountData });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(budgetsApi.applyDiscount).toHaveBeenCalledTimes(1);
    expect(budgetsApi.applyDiscount).toHaveBeenCalledWith(budgetId, discountData);

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budget', budgetId] });

    expect(toast.success).toHaveBeenCalledWith('Condições comerciais aplicadas com sucesso!');
  });

  it('deve exibir toast de erro e manter o estado de erro quando a API falhar', async () => {
    const budgetId = 'budget-error';
    const discountData: DiscountRequest = {
      discountType: 'VALOR_FIXO',
      value: 50,
      paymentCondition: 'CARTAO_12X',
    };

    const errorMessage = 'O orçamento já se encontra aprovado.';
    vi.mocked(budgetsApi.applyDiscount).mockRejectedValueOnce({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useApplyDiscount(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: budgetId, data: discountData });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(budgetsApi.applyDiscount).toHaveBeenCalledWith(budgetId, discountData);
    expect(toast.error).toHaveBeenCalledWith(errorMessage);
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('deve exibir mensagem de erro padrão quando a exceção não contiver resposta detalhada', async () => {
    const budgetId = 'budget-generic-err';
    const discountData: DiscountRequest = {
      discountType: 'PERCENTUAL',
      value: 5,
      paymentCondition: 'A_COMBINAR',
    };

    vi.mocked(budgetsApi.applyDiscount).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useApplyDiscount(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: budgetId, data: discountData });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith('Erro ao aplicar desconto e condições comerciais.');
  });
});

describe('useDownloadPdfTecnico Hook', () => {
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

  it('deve chamar downloadPdfTecnico e disparar toast de sucesso', async () => {
    vi.mocked(budgetsApi.downloadPdfTecnico as any).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useDownloadPdfTecnico(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'orc-1', code: 'ORC-2026-001' });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(budgetsApi.downloadPdfTecnico).toHaveBeenCalledWith('orc-1', 'ORC-2026-001');
    expect(toast.success).toHaveBeenCalledWith('PDF da Ficha Técnica baixado com sucesso!');
  });

  it('deve exibir toast de erro quando a API falhar', async () => {
    vi.mocked(budgetsApi.downloadPdfTecnico as any).mockRejectedValueOnce({
      response: { data: { message: 'Orçamento cancelado.' } },
    });

    const { result } = renderHook(() => useDownloadPdfTecnico(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'orc-err' });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(toast.error).toHaveBeenCalledWith('Orçamento cancelado.');
  });
});

