import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useOrder, useOrders, useCancelOrder } from '../../../features/orders/hooks/useOrders';
import { ordersApi } from '../../../features/orders/services/ordersApi';
import type { Order } from '../../../features/orders/types';

vi.mock('../../../features/orders/services/ordersApi');

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
});

