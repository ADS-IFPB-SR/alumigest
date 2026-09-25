import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import { useApplyDiscount } from '../../../features/budgets/hooks/useBudgets';
import { budgetsApi } from '../../../features/budgets/services/budgetsApi';
import type { DiscountRequest, Budget } from '../../../features/budgets/types';
import toast from 'react-hot-toast';

vi.mock('../../../features/budgets/services/budgetsApi', () => ({
  budgetsApi: {
    applyDiscount: vi.fn(),
    getBudgets: vi.fn(),
    getBudget: vi.fn(),
    createBudget: vi.fn(),
    updateBudget: vi.fn(),
    deleteBudget: vi.fn(),
    updateBudgetStatus: vi.fn(),
    getWindowTemplates: vi.fn(),
    getStatusCounts: vi.fn(),
    getWhatsAppSummary: vi.fn(),
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

describe('useBudgets Queries e Mutations [Joseph Nichollas]', () => {
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

  it('useBudgets: Deve carregar lista paginada de orçamentos', async () => {
    const filters = { page: 0, size: 10, search: 'teste' };
    const mockPage = {
      content: [{ id: '1', code: 'ORC-001', customerName: 'Cliente A' }],
      totalElements: 1,
      totalPages: 1,
      page: 0,
      size: 10,
      isFirst: true,
      isLast: true,
    };
    budgetsApi.getBudgets = vi.fn().mockResolvedValueOnce(mockPage);

    const { useBudgets } = await import('../../../features/budgets/hooks/useBudgets');
    const { result } = renderHook(() => useBudgets(filters), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(budgetsApi.getBudgets).toHaveBeenCalledWith(filters);
    expect(result.current.data?.content).toHaveLength(1);
  });

  it('useBudget: Deve buscar orçamento por ID', async () => {
    const mockDetail = { id: 'budget-1', code: 'ORC-001', customerName: 'Cliente A' };
    budgetsApi.getBudget = vi.fn().mockResolvedValueOnce(mockDetail);

    const { useBudget } = await import('../../../features/budgets/hooks/useBudgets');
    const { result } = renderHook(() => useBudget('budget-1'), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(budgetsApi.getBudget).toHaveBeenCalledWith('budget-1');
    expect(result.current.data?.code).toBe('ORC-001');
  });

  it('useCreateBudget: Sucesso invalida lista e exibe toast', async () => {
    budgetsApi.createBudget = vi.fn().mockResolvedValueOnce({ id: 'new-id' });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { useCreateBudget } = await import('../../../features/budgets/hooks/useBudgets');
    const { result } = renderHook(() => useCreateBudget(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ customerId: 'cli-1', items: [] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toast.success).toHaveBeenCalledWith('Orçamento criado com sucesso!');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] });
  });

  it('useUpdateBudget: Sucesso invalida lista e detalhe e exibe toast', async () => {
    budgetsApi.updateBudget = vi.fn().mockResolvedValueOnce({ id: 'upd-id' });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { useUpdateBudget } = await import('../../../features/budgets/hooks/useBudgets');
    const { result } = renderHook(() => useUpdateBudget(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'upd-id', data: { customerId: 'cli-1', items: [] } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toast.success).toHaveBeenCalledWith('Orçamento atualizado com sucesso!');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budget', 'upd-id'] });
  });

  it('useDeleteBudget: Sucesso exclui, exibe toast e invalida lista', async () => {
    budgetsApi.deleteBudget = vi.fn().mockResolvedValueOnce(true);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { useDeleteBudget } = await import('../../../features/budgets/hooks/useBudgets');
    const { result } = renderHook(() => useDeleteBudget(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate('del-id');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toast.success).toHaveBeenCalledWith('Orçamento excluído com sucesso!');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] });
  });

  it('useUpdateBudgetStatus: Sucesso atualiza status e invalida queries', async () => {
    budgetsApi.updateBudgetStatus = vi.fn().mockResolvedValueOnce({ id: 'status-id', status: 'SENT' });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { useUpdateBudgetStatus } = await import('../../../features/budgets/hooks/useBudgets');
    const { result } = renderHook(() => useUpdateBudgetStatus(), {
      wrapper: createWrapper(queryClient),
    });

    result.current.mutate({ id: 'status-id', status: 'SENT' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(toast.success).toHaveBeenCalledWith('Status do orçamento atualizado com sucesso!');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budgets'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['budget', 'status-id'] });
  });

  describe('useWhatsAppSummary Hook', () => {
    it('deve buscar o resumo formatado quando enabled for true', async () => {
      const summaryText = 'Resumo oficial do orçamento para WhatsApp';
      budgetsApi.getWhatsAppSummary = vi.fn().mockResolvedValueOnce(summaryText);

      const { useWhatsAppSummary } = await import('../../../features/budgets/hooks/useBudgets');
      const { result } = renderHook(() => useWhatsAppSummary('b1', true), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toBe(summaryText);
      expect(budgetsApi.getWhatsAppSummary).toHaveBeenCalledWith('b1');
    });

    it('não deve disparar a query quando enabled for false', async () => {
      budgetsApi.getWhatsAppSummary = vi.fn();

      const { useWhatsAppSummary } = await import('../../../features/budgets/hooks/useBudgets');
      const { result } = renderHook(() => useWhatsAppSummary('b1', false), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(budgetsApi.getWhatsAppSummary).not.toHaveBeenCalled();
    });
  });
});

