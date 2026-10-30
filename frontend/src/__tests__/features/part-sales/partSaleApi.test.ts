import { describe, it, expect, vi, beforeEach } from 'vitest';
import { partSaleApi } from '@/features/part-sales/services/partSaleApi';
import { api } from '@/lib/api';
import type {
  CalculatePartItemPayload,
  CreatePartSaleRequest,
  PartSaleResponse,
} from '@/features/part-sales/types';

vi.mock('@/lib/api', () => ({
  api: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('partSaleApi [US-46.1] - API Service Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calculateItem deve chamar POST /part-sales/calculate-item com o payload', async () => {
    const mockPayload: CalculatePartItemPayload = {
      category: 'HARDWARE',
      quantity: 4,
      unitPrice: 25.0,
    };
    const mockResult = {
      calculatedUnitMeasure: 4,
      unitPrice: 25.0,
      totalPrice: 100.0,
    };

    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResult });

    const result = await partSaleApi.calculateItem(mockPayload);

    expect(api.post).toHaveBeenCalledWith('/part-sales/calculate-item', mockPayload);
    expect(result).toEqual(mockResult);
  });

  it('create deve chamar POST /part-sales e retornar a venda criada', async () => {
    const mockRequest: CreatePartSaleRequest = {
      clientId: 'c123',
      status: 'DRAFT',
      discountAmount: 10,
      items: [
        {
          materialType: 'HARDWARE',
          referenceId: 'mat-1',
          quantity: 2,
          unitPrice: 30,
        },
      ],
    };

    const mockResponse: PartSaleResponse = {
      id: 'sale-1',
      code: 'VP-2026-0001',
      clientId: 'c123',
      clientName: 'Cliente Teste',
      status: 'DRAFT',
      subtotalAmount: 60,
      discountAmount: 10,
      totalAmount: 50,
      items: [],
      createdAt: '2026-10-29T10:00:00Z',
      updatedAt: '2026-10-29T10:00:00Z',
    };

    vi.mocked(api.post).mockResolvedValueOnce({ data: mockResponse });

    const result = await partSaleApi.create(mockRequest);

    expect(api.post).toHaveBeenCalledWith('/part-sales', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('getById deve chamar GET /part-sales/{id}', async () => {
    const mockResponse = { id: 'sale-1', code: 'VP-2026-0001' } as PartSaleResponse;
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockResponse });

    const result = await partSaleApi.getById('sale-1');

    expect(api.get).toHaveBeenCalledWith('/part-sales/sale-1');
    expect(result).toEqual(mockResponse);
  });

  it('list deve chamar GET /part-sales', async () => {
    const mockList = [{ id: 'sale-1' }] as PartSaleResponse[];
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockList });

    const result = await partSaleApi.list();

    expect(api.get).toHaveBeenCalledWith('/part-sales');
    expect(result).toEqual(mockList);
  });

  it('updateStatus deve chamar PATCH /part-sales/{id}/status com o novo status', async () => {
    const mockResponse = { id: 'sale-1', status: 'APPROVED' } as PartSaleResponse;
    vi.mocked(api.patch).mockResolvedValueOnce({ data: mockResponse });

    const result = await partSaleApi.updateStatus('sale-1', 'APPROVED');

    expect(api.patch).toHaveBeenCalledWith('/part-sales/sale-1/status', { status: 'APPROVED' });
    expect(result).toEqual(mockResponse);
  });
});

