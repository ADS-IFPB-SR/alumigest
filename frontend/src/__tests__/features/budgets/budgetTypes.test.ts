import { describe, it, expect } from 'vitest';
import type {
  Budget,
  BudgetItem,
  BudgetItemOption,
  BudgetCreateRequest,
  BudgetItemCreateRequest,
  DiscountRequest,
  StatusChangeRequest,
  BudgetSummary,
  BudgetStatus,
  DiscountType,
  PaymentCondition,
} from '../../../features/budgets/types/budget';
import { calculateBudgetNetTotal } from '../../../features/budgets/types/budget';

describe('[US-09.28] Interfaces TypeScript e Contratos de Orçamentos (budget.ts)', () => {
  describe('Tipagem e Modelagem de Dados', () => {
    it('deve instanciar e manipular corretamente a interface BudgetCreateRequest', () => {
      const createPayload: BudgetCreateRequest = {
        clientId: 'c1234567-0000-0000-0000-000000000001',
        observacoes: 'Entrega preferencial pela manhã',
        items: [
          {
            productId: 'p1234567-0000-0000-0000-000000000001',
            descricao: 'Janela 2 Folhas de Correr',
            larguraMm: 1200,
            alturaMm: 1000,
            quantidade: 2,
            corAluminio: 'BRANCO',
            tipoVidro: 'INCOLOR_6MM',
            orientacaoAbertura: 'LEFT_TO_RIGHT',
            valorUnitario: 450.0,
          },
        ],
      };

      expect(createPayload.clientId).toBe('c1234567-0000-0000-0000-000000000001');
      expect(createPayload.items).toHaveLength(1);
      expect(createPayload.items?.[0].quantidade).toBe(2);
      expect(createPayload.items?.[0].valorUnitario).toBe(450.0);
    });

    it('deve instanciar BudgetItem e BudgetItemOption com integridade dimensional e de preços', () => {
      const option: BudgetItemOption = {
        id: 'opt-1',
        materialId: 'mat-1',
        materialName: 'Perfil Linha Suprema',
        categoryType: 'PROFILE',
        unitMeasure: 'METRO',
        selectedColor: 'PRETO',
        quantity: 8.4,
        unitPrice: 42.5,
        totalPrice: 357.0,
      };

      const item: BudgetItem = {
        id: 'item-1',
        productId: 'prod-1',
        productName: 'Porta de Giro 1 Folha',
        widthMm: 800,
        heightMm: 2100,
        quantity: 1,
        unitPrice: 950.0,
        laborCost: 150.0,
        subtotal: 950.0,
        notes: 'Fechadura rolete inclusa',
        options: [option],
      };

      expect(item.productName).toBe('Porta de Giro 1 Folha');
      expect(item.widthMm).toBe(800);
      expect(item.heightMm).toBe(2100);
      expect(item.unitPrice).toBe(950.0);
      expect(item.options).toHaveLength(1);
      expect(item.options[0].totalPrice).toBe(357.0);
    });

    it('deve validar estrutura de DiscountRequest com tipos compatíveis da US-09', () => {
      const discountReqPercent: DiscountRequest = {
        tipoDesconto: 'PERCENTUAL',
        valor: 10,
        condicaoPagamento: 'A_VISTA_PIX',
        observacoesPagamento: 'Desconto de 10% para pagamento via PIX no fechamento',
        dataValidade: '2026-10-15',
      };

      const discountReqFixo: DiscountRequest = {
        discountType: 'VALOR_FIXO',
        value: 150.0,
        paymentCondition: 'CARTAO_12X',
        paymentNotes: 'Parcelamento em até 12x sem juros',
        validUntil: '2026-10-20',
      };

      expect(discountReqPercent.tipoDesconto).toBe('PERCENTUAL');
      expect(discountReqPercent.condicaoPagamento).toBe('A_VISTA_PIX');
      expect(discountReqFixo.discountType).toBe('VALOR_FIXO');
      expect(discountReqFixo.value).toBe(150.0);
    });

    it('deve estruturar StatusChangeRequest com as transições válidas de BudgetStatus', () => {
      const validStatuses: BudgetStatus[] = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];

      validStatuses.forEach((status) => {
        const req: StatusChangeRequest = { novoStatus: status };
        expect(req.novoStatus).toBe(status);
      });
    });

    it('deve mapear um modelo completo de Budget com totais e condições comerciais', () => {
      const fullBudget: Budget = {
        id: 'b-001',
        code: 'ORC-2026-0001',
        clientId: 'cli-001',
        clientName: 'Vidraçaria Modelo',
        subtotal: 2000.0,
        discountPercent: 10.0,
        discountValue: 200.0,
        total: 1800.0,
        valorLiquido: 1800.0,
        paymentCondition: 'ENTRADA_50_SALDO_ENTREGA',
        paymentConditionLabel: '50% Entrada + 50% na Entrega',
        status: 'APPROVED',
        statusLabel: 'Aprovado',
        validUntil: '2026-09-30T23:59:59Z',
        createdAt: '2026-09-14T10:00:00Z',
        items: [],
        totalItems: 2,
        itemCount: 2,
      };

      expect(fullBudget.code).toBe('ORC-2026-0001');
      expect(fullBudget.subtotal).toBe(2000.0);
      expect(fullBudget.discountValue).toBe(200.0);
      expect(fullBudget.valorLiquido).toBe(1800.0);
      expect(fullBudget.paymentCondition).toBe('ENTRADA_50_SALDO_ENTREGA');
    });

    it('deve validar tipos e estruturas de BudgetSummary, DiscountType e PaymentCondition', () => {
      const summary: BudgetSummary = {
        id: 'sum-01',
        code: 'ORC-2026-0002',
        customerName: 'Cliente Rápido',
        clientName: 'Cliente Rápido',
        status: 'DRAFT',
        createdAt: '2026-09-14T12:00:00Z',
        validUntil: '2026-09-29T23:59:59Z',
        subtotal: 1200.0,
        discountPercent: 5.0,
        discountValue: 60.0,
        total: 1140.0,
        valorLiquido: 1140.0,
        itemCount: 1,
        totalItems: 1,
        paymentCondition: 'A_VISTA_PIX',
      };

      const validDiscountTypes: DiscountType[] = ['PERCENTUAL', 'VALOR_FIXO'];
      const validPaymentConditions: PaymentCondition[] = [
        'A_VISTA_PIX',
        'ENTRADA_50_SALDO_ENTREGA',
        'CARTAO_12X',
        'A_COMBINAR',
      ];

      expect(summary.code).toBe('ORC-2026-0002');
      expect(summary.valorLiquido).toBe(1140.0);
      expect(validDiscountTypes).toContain('PERCENTUAL');
      expect(validPaymentConditions).toContain(summary.paymentCondition);
    });
  });

  describe('Critério Específico de Aceitação: Recálculo do valorLiquido', () => {
    it('[Validação Específica] deve criar orçamento com itens, aplicar desconto de 10% e verificar recálculo do valorLiquido', () => {
      // 1. Simula itens adicionados ao orçamento
      const itens: BudgetItemCreateRequest[] = [
        {
          productId: 'p-1',
          descricao: 'Janela 2 Folhas Correr 1200x1000mm',
          larguraMm: 1200,
          alturaMm: 1000,
          quantidade: 2,
          valorUnitario: 450.0, // 2 x 450 = 900.00
        },
        {
          productId: 'p-2',
          descricao: 'Porta de Giro 800x2100mm',
          larguraMm: 800,
          alturaMm: 2100,
          quantidade: 1,
          valorUnitario: 600.0, // 1 x 600 = 600.00
        },
      ];

      // 2. Calcula o subtotal bruto acumulado
      const subtotal = itens.reduce((acc, item) => acc + item.quantidade * item.valorUnitario, 0);
      expect(subtotal).toBe(1500.0);

      // 3. Aplica desconto percentual de 10%
      const resultado = calculateBudgetNetTotal(subtotal, 'PERCENTUAL', 10);

      // 4. Verifica recálculo do valorLiquido e valor do desconto
      expect(resultado.discountAmount).toBe(150.0); // 10% de 1500 = 150
      expect(resultado.valorLiquido).toBe(1350.0); // 1500 - 150 = 1350
    });

    it('deve calcular corretamente desconto em valor fixo (R$)', () => {
      const subtotal = 2500.0;
      const resultado = calculateBudgetNetTotal(subtotal, 'VALOR_FIXO', 300.0);

      expect(resultado.discountAmount).toBe(300.0);
      expect(resultado.valorLiquido).toBe(2200.0);
    });

    it('deve limitar o desconto ao valor do subtotal caso seja superior', () => {
      const subtotal = 500.0;
      const resultado = calculateBudgetNetTotal(subtotal, 'VALOR_FIXO', 750.0);

      expect(resultado.discountAmount).toBe(500.0);
      expect(resultado.valorLiquido).toBe(0.0);
    });

    it('deve tratar desconto negativo ou subtotal zerado de forma segura', () => {
      const resultadoZero = calculateBudgetNetTotal(0, 'PERCENTUAL', 10);
      expect(resultadoZero.discountAmount).toBe(0);
      expect(resultadoZero.valorLiquido).toBe(0);

      const resultadoNegativo = calculateBudgetNetTotal(1000, 'VALOR_FIXO', -50);
      expect(resultadoNegativo.discountAmount).toBe(0);
      expect(resultadoNegativo.valorLiquido).toBe(1000);
    });
  });
});
