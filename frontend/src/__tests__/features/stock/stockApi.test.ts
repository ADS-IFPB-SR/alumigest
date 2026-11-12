import { describe, it, expect, vi, beforeEach } from 'vitest';
import { stockApi } from '@/features/stock/api/stockApi';
import { api } from '@/lib/api';
import type { StockItem, StockMovement, StockMovementRequest } from '@/features/stock/types';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('stockApi — Client HTTP de Estoque & Almoxarifado (US-21)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('listBalances deve chamar GET /api/v1/stock com parâmetros e retornar saldos', async () => {
    const mockItems: StockItem[] = [
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
        alertStatus: 'IN_STOCK',
      },
    ];

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockItems });

    const result = await stockApi.listBalances({ category: 'GLASS' });

    expect(api.get).toHaveBeenCalledWith('/api/v1/stock', {
      params: { category: 'GLASS' },
    });
    expect(result).toEqual(mockItems);
  });

  it('getBalance deve chamar GET /api/v1/stock/materials/:id e retornar o item', async () => {
    const mockItem: StockItem = {
      id: 's2',
      materialId: 'm2',
      materialSku: 'ALU-001',
      materialName: 'Perfil U',
      category: 'PROFILE',
      unitMeasure: 'barras',
      physicalQuantity: 10,
      reservedQuantity: 2,
      availableQuantity: 8,
      minimumStock: 4,
      alertStatus: 'IN_STOCK',
    };

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockItem });

    const result = await stockApi.getBalance('m2');

    expect(api.get).toHaveBeenCalledWith('/api/v1/stock/materials/m2');
    expect(result).toEqual(mockItem);
  });

  it('listMovements deve chamar GET /api/v1/stock/movements com filtro opcional de material', async () => {
    const mockMovements: StockMovement[] = [
      {
        id: 'mov1',
        stockItemId: 's1',
        materialId: 'm1',
        materialSku: 'VID-001',
        materialName: 'Vidro 8mm',
        type: 'PURCHASE_ENTRY',
        quantity: 25,
        previousPhysicalQuantity: 0,
        newPhysicalQuantity: 25,
        createdAt: '2026-11-12T10:00:00Z',
      },
    ];

    vi.mocked(api.get).mockResolvedValueOnce({ data: mockMovements });

    const result = await stockApi.listMovements('m1');

    expect(api.get).toHaveBeenCalledWith('/api/v1/stock/movements', {
      params: { materialId: 'm1' },
    });
    expect(result).toEqual(mockMovements);
  });

  it('registerMovement deve chamar POST /api/v1/stock/movements com payload', async () => {
    const payload: StockMovementRequest = {
      materialId: 'm1',
      type: 'MANUAL_ADJUSTMENT',
      quantity: 5,
      reason: 'Inventário inicial',
      registeredBy: 'almoxarife',
    };

    const mockResponse: StockMovement = {
      id: 'mov2',
      stockItemId: 's1',
      materialId: 'm1',
      materialSku: 'VID-001',
      materialName: 'Vidro 8mm',
      type: 'MANUAL_ADJUSTMENT',
      quantity: 5,
      previousPhysicalQuantity: 20,
      newPhysicalQuantity: 25,
      createdAt: '2026-11-12T11:00:00Z',
    };

    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await stockApi.registerMovement(payload);

    expect(api.post).toHaveBeenCalledWith('/api/v1/stock/movements', payload);
    expect(result).toEqual(mockResponse);
  });

  it('reserveForOrder deve chamar POST /api/v1/stock/reserve-for-order/:orderId', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({});

    await stockApi.reserveForOrder('order-123');

    expect(api.post).toHaveBeenCalledWith('/api/v1/stock/reserve-for-order/order-123');
  });

  it('consumeForOrder deve chamar POST /api/v1/stock/consume-for-order/:orderId', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({});

    await stockApi.consumeForOrder('order-123');

    expect(api.post).toHaveBeenCalledWith('/api/v1/stock/consume-for-order/order-123');
  });

  it('cancelReservationsForOrder deve chamar POST /api/v1/stock/cancel-reservations/:orderId', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({});

    await stockApi.cancelReservationsForOrder('order-123');

    expect(api.post).toHaveBeenCalledWith('/api/v1/stock/cancel-reservations/order-123');
  });
});
