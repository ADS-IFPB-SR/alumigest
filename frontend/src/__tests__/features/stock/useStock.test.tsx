import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useStockBalances,
  useStockItem,
  useStockMovements,
  useKardex,
  useRegisterStockMovement,
  useReserveStockForOrder,
  useConsumeStockForOrder,
  useCancelStockReservationsForOrder,
  useStockAlertForOrder,
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
    consumeForOrder: vi.fn(),
    cancelReservationsForOrder: vi.fn(),
    getOrderStockAlert: vi.fn(),
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

  it('useRegisterStockMovement deve disparar mutação, exibir toast e invalidar stock-order-alert', async () => {
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

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useRegisterStockMovement(), {
      wrapper: ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    result.current.mutate(payload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.registerMovement).toHaveBeenCalledWith(payload);
    expect(toast.success).toHaveBeenCalledWith('Movimentação registrada com sucesso no Kardex!');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['stock-balances'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['stock-item'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['stock-movements'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['stock-order-alert'] });
  });

  it('useReserveStockForOrder deve disparar reserva de materiais e invalidar queries de estoque', async () => {
    vi.mocked(stockApi.reserveForOrder).mockResolvedValueOnce();

    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useReserveStockForOrder(), { wrapper });

    result.current.mutate('order-999');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.reserveForOrder).toHaveBeenCalledWith('order-999');
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['stock-balances'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['stock-item'] });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['stock-movements'] });
  });

  it('useConsumeStockForOrder deve disparar baixa física e exibir toast de sucesso', async () => {
    vi.mocked(stockApi.consumeForOrder).mockResolvedValueOnce();

    const { result } = renderHook(() => useConsumeStockForOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('order-consume-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.consumeForOrder).toHaveBeenCalledWith('order-consume-1');
    expect(toast.success).toHaveBeenCalledWith('Baixa física de materiais registrada com sucesso!');
  });

  it('useCancelStockReservationsForOrder deve estornar reservas e exibir toast de sucesso', async () => {
    vi.mocked(stockApi.cancelReservationsForOrder).mockResolvedValueOnce();

    const { result } = renderHook(() => useCancelStockReservationsForOrder(), {
      wrapper: createWrapper(),
    });

    result.current.mutate('order-cancel-1');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(stockApi.cancelReservationsForOrder).toHaveBeenCalledWith('order-cancel-1');
    expect(toast.success).toHaveBeenCalledWith('Reservas de estoque estornadas com sucesso!');
  });

  it('useKardex deve buscar movimentações quando materialId estiver definido e enabled=true', async () => {
    const mockMovements = [
      {
        id: 'mov-k1',
        stockItemId: 's1',
        materialId: 'm-kardex',
        materialSku: 'VID-008',
        materialName: 'Vidro 8mm',
        type: 'PURCHASE_ENTRY' as const,
        quantity: 10,
        previousPhysicalQuantity: 0,
        newPhysicalQuantity: 10,
        createdAt: '2026-11-18T10:00:00Z',
      },
    ];

    vi.mocked(stockApi.listMovements).mockResolvedValueOnce(mockMovements);

    const { result } = renderHook(() => useKardex('m-kardex', true), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(stockApi.listMovements).toHaveBeenCalledWith('m-kardex');
    expect(result.current.data).toEqual(mockMovements);
  });

  it('useKardex não deve disparar requisição quando gaveta estiver fechada ou sem materialId', () => {
    renderHook(() => useKardex('m-closed', false), { wrapper: createWrapper() });
    renderHook(() => useKardex(undefined, true), { wrapper: createWrapper() });

    expect(stockApi.listMovements).not.toHaveBeenCalled();
  });

  describe('useStockAlertForOrder (US-21.4)', () => {
    it('deve buscar e retornar o status Make-to-Order da O.S.', async () => {
      const mockAlert = {
        alertStatus: 'NEED_PURCHASE' as const,
        missingMaterials: [
          {
            materialName: 'Perfil U 50x50',
            materialSku: 'ALU-001',
            availableQuantity: -2,
            reservedQuantity: 5,
            unitMeasure: 'barras',
          },
        ],
      };

      vi.mocked(stockApi.getOrderStockAlert).mockResolvedValueOnce(mockAlert);

      const { result } = renderHook(() => useStockAlertForOrder('order-uuid-alert'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.data).toBeDefined());

      expect(stockApi.getOrderStockAlert).toHaveBeenCalledWith('order-uuid-alert');
      expect(result.current.data).toEqual(mockAlert);
    });

    it('não deve disparar a query quando orderId for indefinido', () => {
      const { result } = renderHook(() => useStockAlertForOrder(undefined), {
        wrapper: createWrapper(),
      });

      expect(stockApi.getOrderStockAlert).not.toHaveBeenCalled();
      expect(result.current.data).toBeUndefined();
    });

    it('deve retornar undefined com segurança sem lançar erro quando renderizado fora de um QueryClientProvider', () => {
      // Sem wrapper QueryClientProvider
      const { result } = renderHook(() => useStockAlertForOrder('order-without-provider'));

      expect(result.current.data).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
