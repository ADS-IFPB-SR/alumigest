import { describe, it, expect, vi, beforeEach } from 'vitest';
import { budgetsApi } from '../../../features/budgets/services/budgetsApi';
import { api } from '../../../lib/api';
import type { DiscountRequest, BudgetItemCreateRequest } from '../../../features/budgets/types';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('budgetsApi Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('applyDiscount', () => {
    it('deve chamar PUT /api/budgets/${id}/discount com payload mapeado a partir de campos camelCase', async () => {
      const budgetId = 'budget-uuid-123';
      const discountData: DiscountRequest = {
        discountType: 'PERCENTUAL',
        value: 10,
        paymentCondition: 'A_VISTA_PIX',
        paymentNotes: 'Desconto à vista aprovado pela gerência',
        validUntil: '2026-10-31T23:59:59Z',
      };

      const backendMockResponse = {
        data: {
          id: budgetId,
          code: 'ORC-2026-001',
          clientId: 'client-1',
          clientName: 'João da Silva',
          status: 'DRAFT',
          createdAt: '2026-10-01T10:00:00Z',
          validUntil: '2026-10-31T23:59:59Z',
          subtotal: 1000,
          discountPercent: 10,
          discountValue: 100,
          total: 900,
          items: [],
        },
      };

      vi.mocked(api.put).mockResolvedValueOnce(backendMockResponse);

      const result = await budgetsApi.applyDiscount(budgetId, discountData);

      expect(api.put).toHaveBeenCalledWith(
        `/api/budgets/${budgetId}/discount`,
        {
          tipoDesconto: 'PERCENTUAL',
          valor: 10,
          condicaoPagamento: 'A_VISTA_PIX',
          observacoesPagamento: 'Desconto à vista aprovado pela gerência',
          dataValidade: '2026-10-31',
        },
        { baseURL: '' }
      );

      expect(result.id).toBe(budgetId);
      expect(result.code).toBe('ORC-2026-001');
      expect(result.subtotal).toBe(1000);
      expect(result.discountPercent).toBe(10);
      expect(result.discountValue).toBe(100);
      expect(result.total).toBe(900);
    });

    it('deve chamar PUT /api/budgets/${id}/discount aceitando propriedades em português', async () => {
      const budgetId = 'budget-uuid-456';
      const discountData: DiscountRequest = {
        tipoDesconto: 'VALOR_FIXO',
        valor: 150,
        condicaoPagamento: 'CARTAO_12X',
        observacoesPagamento: 'Parcelamento sem juros',
        dataValidade: '2026-11-15',
      };

      const backendMockResponse = {
        data: {
          id: budgetId,
          code: 'ORC-2026-002',
          clientId: 'client-2',
          clientName: 'Maria Santos',
          status: 'DRAFT',
          subtotal: 2000,
          discountPercent: 7.5,
          discountValue: 150,
          total: 1850,
          items: [],
        },
      };

      vi.mocked(api.put).mockResolvedValueOnce(backendMockResponse);

      const result = await budgetsApi.applyDiscount(budgetId, discountData);

      expect(api.put).toHaveBeenCalledWith(
        `/api/budgets/${budgetId}/discount`,
        {
          tipoDesconto: 'VALOR_FIXO',
          valor: 150,
          condicaoPagamento: 'CARTAO_12X',
          observacoesPagamento: 'Parcelamento sem juros',
          dataValidade: '2026-11-15',
        },
        { baseURL: '' }
      );

      expect(result.discountValue).toBe(150);
      expect(result.total).toBe(1850);
    });

    it('deve propagar erro caso a chamada PUT falhe', async () => {
      const budgetId = 'budget-err';
      const discountData: DiscountRequest = {
        discountType: 'PERCENTUAL',
        value: 15,
        paymentCondition: 'A_VISTA_PIX',
      };

      vi.mocked(api.put).mockRejectedValueOnce(new Error('Orçamento não pode ser alterado pois já está Aprovado'));

      await expect(budgetsApi.applyDiscount(budgetId, discountData)).rejects.toThrow(
        'Orçamento não pode ser alterado pois já está Aprovado'
      );
    });
  });

  describe('addBudgetItem', () => {
    it('deve chamar POST /api/budgets/${id}/items com payload serializado e retornar BudgetItem mapeado', async () => {
      const budgetId = 'budget-uuid-789';
      const itemRequest: BudgetItemCreateRequest = {
        productId: 'prod-window-1',
        templateType: 'SLIDING_DOOR_2F',
        templateConfig: {
          templateType: 'SLIDING_DOOR_2F',
          aluminumColor: 'Preto',
          glassFinish: 'Fumê',
        },
        handleConfig: {
          handleType: 'BAR_TUBULAR',
          position: 'RIGHT',
        },
        drillingConfig: {
          holeCount: 2,
        },
        widthMm: 1200,
        heightMm: 2100,
        quantity: 2,
        laborCost: 150,
        notes: 'Instalação no 2º andar',
        options: [
          {
            materialId: 'mat-glass-1',
            quantity: 2,
            categoryType: 'GLASS',
          },
        ],
      };

      const backendMockResponse = {
        data: {
          id: 'item-uuid-999',
          productId: 'prod-window-1',
          productName: 'Porta de Correr 2 Folhas Suprema',
          templateType: 'SLIDING_DOOR_2F',
          templateConfig: JSON.stringify({
            templateType: 'SLIDING_DOOR_2F',
            aluminumColor: 'Preto',
            glassFinish: 'Fumê',
          }),
          handleConfig: JSON.stringify({
            handleType: 'BAR_TUBULAR',
            position: 'RIGHT',
          }),
          drillingConfig: JSON.stringify({
            holeCount: 2,
          }),
          widthMm: 1200,
          heightMm: 2100,
          quantity: 2,
          laborCost: 150,
          subtotal: 1200,
          notes: 'Instalação no 2º andar',
          options: [
            {
              id: 'opt-1',
              materialId: 'mat-glass-1',
              materialName: 'Vidro Temperado 8mm',
              categoryType: 'GLASS',
              unitMeasure: 'M2',
              quantity: 2.52,
              unitPrice: 200,
              totalPrice: 504,
            },
          ],
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce(backendMockResponse);

      const result = await budgetsApi.addBudgetItem(budgetId, itemRequest);

      expect(api.post).toHaveBeenCalledWith(
        `/api/budgets/${budgetId}/items`,
        {
          productId: 'prod-window-1',
          widthMm: 1200,
          heightMm: 2100,
          quantity: 2,
          laborCost: 150,
          templateType: 'SLIDING_DOOR_2F',
          templateConfig: JSON.stringify(itemRequest.templateConfig),
          handleConfig: JSON.stringify(itemRequest.handleConfig),
          drillingConfig: JSON.stringify(itemRequest.drillingConfig),
          notes: 'Instalação no 2º andar',
          options: [
            {
              materialId: 'mat-glass-1',
              quantity: 2,
              categoryType: 'GLASS',
            },
          ],
        },
        { baseURL: '' }
      );

      expect(result.tempId).toBe('item-uuid-999');
      expect(result.productId).toBe('prod-window-1');
      expect(result.productName).toBe('Porta de Correr 2 Folhas Suprema');
      expect(result.widthMm).toBe(1200);
      expect(result.heightMm).toBe(2100);
      expect(result.quantity).toBe(2);
      expect(result.laborCost).toBe(150);
      expect(result.subtotal).toBe(1200);
      expect(result.options).toHaveLength(1);
      expect(result.options[0].materialName).toBe('Vidro Temperado 8mm');
      expect(result.templateConfig).toEqual({
        templateType: 'SLIDING_DOOR_2F',
        aluminumColor: 'Preto',
        glassFinish: 'Fumê',
      });
      expect(result.handleConfig.handleType).toBe('BAR_TUBULAR');
      expect(result.drillingConfig.holeCount).toBe(2);
    });

    it('deve aceitar campos width e height alternativos no request e defaults de configs', async () => {
      const budgetId = 'budget-uuid-abc';
      const itemRequest: BudgetItemCreateRequest = {
        productId: 'prod-simple-1',
        width: 800,
        height: 600,
        quantity: 1,
      };

      const backendMockResponse = {
        data: {
          id: 'item-simple-1',
          productId: 'prod-simple-1',
          widthMm: 800,
          heightMm: 600,
          quantity: 1,
          laborCost: 0,
          subtotal: 350,
          options: [],
        },
      };

      vi.mocked(api.post).mockResolvedValueOnce(backendMockResponse);

      const result = await budgetsApi.addBudgetItem(budgetId, itemRequest);

      expect(api.post).toHaveBeenCalledWith(
        `/api/budgets/${budgetId}/items`,
        expect.objectContaining({
          productId: 'prod-simple-1',
          widthMm: 800,
          heightMm: 600,
          quantity: 1,
          laborCost: 0,
        }),
        { baseURL: '' }
      );

      expect(result.widthMm).toBe(800);
      expect(result.heightMm).toBe(600);
      expect(result.subtotal).toBe(350);
      expect(result.handleConfig.handleType).toBe('PUXADOR_H');
      expect(result.drillingConfig.holeCount).toBe(0);
    });

    it('deve propagar erro caso a chamada POST falhe', async () => {
      const budgetId = 'budget-err-item';
      const itemRequest: BudgetItemCreateRequest = {
        productId: 'prod-1',
        quantity: 1,
      };

      vi.mocked(api.post).mockRejectedValueOnce(new Error('Falha ao adicionar item ao orçamento'));

      await expect(budgetsApi.addBudgetItem(budgetId, itemRequest)).rejects.toThrow(
        'Falha ao adicionar item ao orçamento'
      );
    });
  });

  describe('CRUD e operações auxiliares', () => {
    it('deve chamar getBudget e retornar o detalhe mapeado', async () => {
      const budgetId = 'budget-get-1';
      vi.mocked(api.get).mockResolvedValueOnce({
        data: {
          id: budgetId,
          code: 'ORC-001',
          clientId: 'cli-1',
          clientName: 'Cliente Teste',
          status: 'DRAFT',
          total: 500,
          items: [],
        },
      });

      const result = await budgetsApi.getBudget(budgetId);
      expect(api.get).toHaveBeenCalledWith(`/api/orcamentos/${budgetId}`, { baseURL: '' });
      expect(result.id).toBe(budgetId);
      expect(result.customerName).toBe('Cliente Teste');
    });

    it('deve chamar previewItemCalculation com payload correto', async () => {
      const payload = {
        widthMm: 1000,
        heightMm: 2000,
        quantity: 1,
        options: [],
      };

      vi.mocked(api.post).mockResolvedValueOnce({
        data: {
          physicalAreaM2: 2,
          physicalPerimeterM: 6,
          options: [],
        },
      });

      const result = await budgetsApi.previewItemCalculation(payload);
      expect(api.post).toHaveBeenCalledWith(
        '/api/orcamentos/items/preview-calculation',
        payload,
        { baseURL: '' }
      );
      expect(result.physicalAreaM2).toBe(2);
    });
  });
});
