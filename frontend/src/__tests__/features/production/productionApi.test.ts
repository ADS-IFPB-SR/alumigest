import { describe, it, expect, vi, beforeEach } from 'vitest';
import { api } from '../../../lib/api';
import { productionApi } from '../../../features/production/services/productionApi';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('productionApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProductionOrders', () => {
    it('deve extrair a propriedade content em respostas paginadas', async () => {
      const mockOrders = [{ id: '1', code: 'ORD-001', status: 'WAITING_PRODUCTION' }];
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { content: mockOrders, page: { totalElements: 1 } },
      });

      const result = await productionApi.getProductionOrders();

      expect(api.get).toHaveBeenCalledWith('/orders', { params: { size: 100 } });
      expect(result).toEqual(mockOrders);
    });

    it('deve retornar o array diretamente caso a API devolva um array', async () => {
      const mockOrders = [{ id: '1', code: 'ORD-001', status: 'IN_PRODUCTION' }];
      vi.mocked(api.get).mockResolvedValueOnce({ data: mockOrders });

      const result = await productionApi.getProductionOrders();

      expect(result).toEqual(mockOrders);
    });
  });

  describe('updateProductionStatus', () => {
    it('deve chamar o endpoint /orders/:id/production-status com os dados corretos', async () => {
      const mockResponse = { id: '1', status: 'IN_PRODUCTION' };
      vi.mocked(api.patch).mockResolvedValueOnce({ data: mockResponse });

      const result = await productionApi.updateProductionStatus({
        orderId: '1',
        status: 'IN_PRODUCTION',
      });

      expect(api.patch).toHaveBeenCalledWith('/orders/1/production-status', {
        status: 'IN_PRODUCTION',
      });
      expect(result).toEqual(mockResponse);
    });
  });
});