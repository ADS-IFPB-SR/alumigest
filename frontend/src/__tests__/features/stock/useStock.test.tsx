import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useStockBalances,
  useStockItem,
  useStockMovements,
  useRegisterStockMovement,
  useReserveStockForOrder,
} from '@/features/stock/hooks/useStock';
import { stockApi } from '@/features/stock/api/stockApi';
import toast from 'react-hot-toast';

vi.mock('@/features/stock/api/stockApi', () => ({
  stockApi: {
    listBalances: vi.fn(),
    getBalance: vi.fn(),
    listMovements: vi.fn(),
    registerMovement: vi.fn(),
    reserveForOrder: vi.fn(),
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

describe('useStock Hooks — Testes de Integração com TanStack Query', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('useStockBalances deve consultar a lista de saldos', async () => {
    const mockData = [
      {
        id: 's1',
        materialId: 'm1',
        materialSku: 'VID-001',
        materialName: 'Vidro 8mm',
        category: 'GLASS',
        unitMeasure: 'm²',
        physicalQuantity: 25,
        reservedQuantity: 7,
        availableQuantity: 18,
        minimumStock: 5,
        alertStatus: 'IN_STOCK' as const,
      },
    ];

    vi.mocked(stockApi.listBalances).mockResolvedValueOnce(mockData);

    const { result } = renderHook(() => useStockBalances({ category: 'GLASS' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.listBalances).toHaveBeenCalledWith({ category: 'GLASS' });
    expect(result.current.data).toEqual(mockData);
  });

  it('useStockItem deve buscar o saldo de um material quando materialId for fornecido', async () => {
    const mockItem = {
      id: 's1',
      materialId: 'm1',
      materialSku: 'VID-001',
      materialName: 'Vidro 8mm',
      category: 'GLASS',
      unitMeasure: 'm²',
      physicalQuantity: 25,
      reservedQuantity: 7,
      availableQuantity: 18,
      minimumStock: 5,
      alertStatus: 'IN_STOCK' as const,
    };

    vi.mocked(stockApi.getBalance).mockResolvedValueOnce(mockItem);

    const { result } = renderHook(() => useStockItem('m1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.getBalance).toHaveBeenCalledWith('m1');
    expect(result.current.data).toEqual(mockItem);
  });

  it('useStockMovements deve buscar a lista de movimentações', async () => {
    const mockMovements = [
      {
        id: 'mov1',
        stockItemId: 's1',
        materialId: 'm1',
        materialSku: 'VID-001',
        materialName: 'Vidro 8mm',
        type: 'PURCHASE_ENTRY' as const,
        quantity: 25,
        previousPhysicalQuantity: 0,
        newPhysicalQuantity: 25,
        createdAt: '2026-11-12T10:00:00Z',
      },
    ];

    vi.mocked(stockApi.listMovements).mockResolvedValueOnce(mockMovements);

    const { result } = renderHook(() => useStockMovements('m1'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.listMovements).toHaveBeenCalledWith('m1');
    expect(result.current.data).toEqual(mockMovements);
  });

  it('useRegisterStockMovement deve disparar mutação e exibir toast de sucesso', async () => {
    const payload = {
      materialId: 'm1',
      type: 'MANUAL_ADJUSTMENT' as const,
      quantity: 5,
    };

    const mockResponse = {
      id: 'mov1',
      stockItemId: 's1',
      materialId: 'm1',
      materialSku: 'VID-001',
      materialName: 'Vidro 8mm',
      type: 'MANUAL_ADJUSTMENT' as const,
      quantity: 5,
      previousPhysicalQuantity: 20,
      newPhysicalQuantity: 25,
      createdAt: '2026-11-12T10:00:00Z',
    };

    vi.mocked(stockApi.registerMovement).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useRegisterStockMovement(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.registerMovement).toHaveBeenCalledWith(payload);
    expect(toast.success).toHaveBeenCalledWith('Movimentação registrada com sucesso no Kardex!');
  });

  it('useReserveStockForOrder deve disparar reserva de materiais', async () => {
    vi.mocked(stockApi.reserveForOrder).mockResolvedValueOnce();

    const { result } = renderHook(() => useReserveStockForOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('order-999');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.reserveForOrder).toHaveBeenCalledWith('order-999');
  });
});
