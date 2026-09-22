import { describe, it, expect, vi, beforeEach } from 'vitest';
import { customersApi } from '@/features/customers/services/customersApi';
import { api } from '@/lib/api';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('customersApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Técnica: Análise do Valor Limite (BVA) e EP - Parâmetro de Busca', () => {
    it('Limite Inferior: busca com menos de 2 caracteres NÃO deve ser enviada nos query params', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { content: [], size: 20, page: 0, totalElements: 0, totalPages: 0 },
      });

      await customersApi.getCustomers({ busca: 'a' });

      expect(api.get).toHaveBeenCalledWith('/api/clientes', {
        baseURL: '',
        params: { page: 0, size: 20 },
      });
    });

    it('Limite Válido: busca com 2 ou mais caracteres deve ser incluída com trim()', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { content: [], size: 20, page: 0, totalElements: 0, totalPages: 0 },
      });

      await customersApi.getCustomers({ busca: '  joao  ', ativo: true });

      expect(api.get).toHaveBeenCalledWith('/api/clientes', {
        baseURL: '',
        params: { page: 0, size: 20, busca: 'joao', ativo: true },
      });
    });

    it('deve usar valores de paginação customizados quando fornecidos', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          content: [{ id: '1', nomeCompleto: 'Maria' }],
          size: 10,
          page: 2,
          totalElements: 25,
          totalPages: 3,
        },
      });

      const result = await customersApi.getCustomers({ page: 2, size: 10 });

      expect(api.get).toHaveBeenCalledWith('/api/clientes', {
        baseURL: '',
        params: { page: 2, size: 10 },
      });
      expect(result.content).toHaveLength(1);
      expect(result.page.totalPages).toBe(3);
    });
  });

  describe('createCustomer & getCustomerById', () => {
    it('createCustomer deve disparar POST para /api/clientes', async () => {
      const payload = {
        nomeCompleto: 'Carlos Silva',
        personType: 'FISICA' as const,
        documento: '12345678901',
      };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: { id: 'cust-1', ...payload, ativo: true },
      });

      const result = await customersApi.createCustomer(payload);

      expect(api.post).toHaveBeenCalledWith('/api/clientes', payload, { baseURL: '' });
      expect(result.id).toBe('cust-1');
      expect(result.nomeCompleto).toBe('Carlos Silva');
    });

    it('getCustomerById deve disparar GET para /api/clientes/:id', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { id: 'cust-2', nomeCompleto: 'Ana Paula', personType: 'FISICA', ativo: true },
      });

      const result = await customersApi.getCustomerById('cust-2');

      expect(api.get).toHaveBeenCalledWith('/api/clientes/cust-2', { baseURL: '' });
      expect(result.nomeCompleto).toBe('Ana Paula');
    });
  });
});
