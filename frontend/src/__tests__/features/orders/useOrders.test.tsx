import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useOrder, useOrders, useCancelOrder, useConvertBudget } from '../../../features/orders/hooks/useOrders';
import { ordersApi } from '../../../features/orders/services/ordersApi';
import type { Order } from '../../../features/orders/types';
import toast from 'react-hot-toast';

vi.mock('../../../features/orders/services/ordersApi');
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useOrders hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useOrder deve carregar pedido por id com sucesso', async () => {
    const mockOrder: Partial<Order> = {
      id: 'order-1',
      codigo: 'PED-2026-0001',
      status: 'WAITING_PRODUCTION',
    };

    vi.mocked(ordersApi.getOrderById).mockResolvedValue(mockOrder as Order);

    const { result } = renderHook(() => useOrder('order-1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.codigo).toBe('PED-2026-0001');
    expect(ordersApi.getOrderById).toHaveBeenCalledWith('order-1');
  });

  it('useCancelOrder deve chamar ordersApi.cancelOrder e mutar status', async () => {
    const mockCancelled: Partial<Order> = {
      id: 'order-1',
      status: 'CANCELLED',
      justificativaCancelamento: 'Cliente cancelou a obra',
    };

    vi.mocked(ordersApi.cancelOrder).mockResolvedValue(mockCancelled as Order);

    const { result } = renderHook(() => useCancelOrder('order-1'), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ justificativa: 'Cliente cancelou a obra' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(ordersApi.cancelOrder).toHaveBeenCalledWith('order-1', {
      justificativa: 'Cliente cancelou a obra',
    });
  });

  it('useOrders deve listar pedidos paginados', async () => {
    const mockPage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
    };

    vi.mocked(ordersApi.getOrders).mockResolvedValue(mockPage);

    const { result } = renderHook(() => useOrders({ page: 0, size: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.totalElements).toBe(0);
    expect(ordersApi.getOrders).toHaveBeenCalledWith({ page: 0, size: 10 });
  });

  describe('useConvertBudget (US-13.3)', () => {
    it('deve converter orçamento em pedido com sucesso quando budgetId é informado no hook', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-10',
        codigo: 'PED-2026-0010',
        orcamentoId: 'b-123',
        status: 'CREATED',
      };

      vi.mocked(ordersApi.convertBudget).mockResolvedValue(mockOrder as Order);

      const { result } = renderHook(() => useConvertBudget('b-123'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        canalAprovacao: 'WHATSAPP',
        dataPrevisaoEntrega: '2026-10-20',
        observacoes: 'Urgente',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(ordersApi.convertBudget).toHaveBeenCalledWith('b-123', {
        canalAprovacao: 'WHATSAPP',
        dataPrevisaoEntrega: '2026-10-20',
        observacoes: 'Urgente',
      });
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining('PED-2026-0010')
      );
    });

    it('deve permitir converter passando budgetId no payload da mutação', async () => {
      const mockOrder: Partial<Order> = {
        id: 'order-11',
        codigo: 'PED-2026-0011',
        orcamentoId: 'b-456',
        status: 'CREATED',
      };

      vi.mocked(ordersApi.convertBudget).mockResolvedValue(mockOrder as Order);

      const { result } = renderHook(() => useConvertBudget(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        budgetId: 'b-456',
        data: {
          canalAprovacao: 'PRESENCIAL',
          dataPrevisaoEntrega: '2026-10-25',
        },
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(ordersApi.convertBudget).toHaveBeenCalledWith('b-456', {
        canalAprovacao: 'PRESENCIAL',
        dataPrevisaoEntrega: '2026-10-25',
      });
    });

    it('deve exibir toast de erro com mensagem da API em caso de falha', async () => {
      const errorResponse = {
        response: {
          data: {
            message: 'Já existe pedido para este orçamento.',
          },
        },
      };

      vi.mocked(ordersApi.convertBudget).mockRejectedValue(errorResponse);

      const { result } = renderHook(() => useConvertBudget('b-999'), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        canalAprovacao: 'WHATSAPP',
        dataPrevisaoEntrega: '2026-10-20',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(toast.error).toHaveBeenCalledWith('Já existe pedido para este orçamento.');
    });
  });
});
