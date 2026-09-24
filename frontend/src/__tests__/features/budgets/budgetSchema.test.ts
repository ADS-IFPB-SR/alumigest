import { describe, it, expect } from 'vitest';
import {
  budgetItemSchema,
  DiscountTypeEnum,
  PaymentConditionEnum,
  createBudgetFormSchema,
  budgetFormSchema,
} from '../../../features/budgets/schemas/budgetSchema';

describe('budgetSchema - Validações do Formulário de Orçamento [Joseph Nichollas]', () => {
  describe('budgetItemSchema', () => {
    it('deve aceitar um item válido com medidas opcionais', () => {
      const valid = {
        productId: 'prod-123',
        quantity: 2,
        widthMm: 1200,
        heightMm: 2100,
      };
      const result = budgetItemSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar item com productId vazio ou quantidade zero', () => {
      const invalid = {
        productId: '',
        quantity: 0,
      };
      const result = budgetItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.productId).toContain('Produto inválido.');
        expect(errors.quantity).toContain('A quantidade deve ser maior que zero.');
      }
    });

    it('deve rejeitar item com largura ou altura menores que 1 quando informados', () => {
      const invalid = {
        productId: 'prod-1',
        quantity: 1,
        widthMm: 0,
        heightMm: -10,
      };
      const result = budgetItemSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe('Enums de Desconto e Condição de Pagamento', () => {
    it('deve aceitar os tipos válidos de desconto', () => {
      for (const type of ['PERCENTUAL', 'VALOR_FIXO', 'PERCENTAGE', 'FIXED']) {
        expect(DiscountTypeEnum.safeParse(type).success).toBe(true);
      }
      expect(DiscountTypeEnum.safeParse('INVALIDO').success).toBe(false);
    });

    it('deve aceitar as condições de pagamento mapeadas e string vazia', () => {
      for (const cond of ['A_VISTA_PIX', 'ENTRADA_50_SALDO_ENTREGA', 'CARTAO_12X', 'A_COMBINAR', '']) {
        expect(PaymentConditionEnum.safeParse(cond).success).toBe(true);
      }
      expect(PaymentConditionEnum.safeParse('CONDICAO_INVALIDA').success).toBe(false);
    });
  });

  describe('createBudgetFormSchema e budgetFormSchema', () => {
    const validBaseData = {
      customerId: 'cli-001',
      items: [
        {
          productId: 'prod-window',
          quantity: 1,
          widthMm: 1000,
          heightMm: 1000,
        },
      ],
      laborCost: 100,
      discountType: 'PERCENTUAL' as const,
      discountInput: 10,
      paymentCondition: 'A_VISTA_PIX',
      commercialConditions: 'Prazo 15 dias',
      notes: 'Observação teste',
      validUntil: '2099-12-31',
    };

    it('deve validar com sucesso um orçamento completo com data futura', () => {
      const schema = createBudgetFormSchema(1000);
      const result = schema.safeParse(validBaseData);
      expect(result.success).toBe(true);
    });

    it('deve rejeitar quando customerId estiver vazio', () => {
      const schema = createBudgetFormSchema();
      const result = schema.safeParse({ ...validBaseData, customerId: '' });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.customerId).toContain('Selecione um cliente para o orçamento.');
      }
    });

    it('deve rejeitar quando a lista de itens estiver vazia', () => {
      const schema = createBudgetFormSchema();
      const result = schema.safeParse({ ...validBaseData, items: [] });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.items).toContain('Adicione ao menos um item ao orçamento.');
      }
    });

    it('deve rejeitar custo de mão de obra negativo', () => {
      const schema = createBudgetFormSchema();
      const result = schema.safeParse({ ...validBaseData, laborCost: -50 });
      expect(result.success).toBe(false);
    });

    it('deve rejeitar quando commercialConditions ultrapassar 500 caracteres', () => {
      const schema = createBudgetFormSchema();
      const result = schema.safeParse({
        ...validBaseData,
        commercialConditions: 'a'.repeat(501),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.commercialConditions).toContain(
          'Os detalhes do pagamento não podem exceder 500 caracteres.'
        );
      }
    });

    it('deve rejeitar data de validade no passado', () => {
      const schema = createBudgetFormSchema();
      const result = schema.safeParse({
        ...validBaseData,
        validUntil: '2020-01-01',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.validUntil).toContain(
          'A data de validade não pode ser anterior a hoje.'
        );
      }
    });

    it('deve rejeitar data de validade com formato inválido', () => {
      const schema = createBudgetFormSchema();
      const result = schema.safeParse({
        ...validBaseData,
        validUntil: 'data-invalida',
      });
      expect(result.success).toBe(false);
    });

    it('deve aceitar validUntil vazio ou não informado', () => {
      const schema = createBudgetFormSchema();
      expect(schema.safeParse({ ...validBaseData, validUntil: '' }).success).toBe(true);
      expect(schema.safeParse({ ...validBaseData, validUntil: undefined }).success).toBe(true);
    });

    it('superRefine: Rejeita desconto percentual maior que 100%', () => {
      const schema = createBudgetFormSchema(1000);
      const result = schema.safeParse({
        ...validBaseData,
        discountType: 'PERCENTUAL',
        discountInput: 105,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.discountInput).toContain(
          'O desconto percentual não pode ser maior que 100%.'
        );
      }
    });

    it('superRefine: Rejeita desconto em valor fixo maior que o subtotal', () => {
      const subtotal = 500;
      const schema = createBudgetFormSchema(subtotal);
      const result = schema.safeParse({
        ...validBaseData,
        discountType: 'VALOR_FIXO',
        discountInput: 550,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.discountInput).toContain(
          'O desconto fixo não pode ser superior ao subtotal (R$ 500.00).'
        );
      }
    });

    it('superRefine: Permite desconto fixo igual ou menor que o subtotal', () => {
      const subtotal = 500;
      const schema = createBudgetFormSchema(subtotal);
      const result = schema.safeParse({
        ...validBaseData,
        discountType: 'VALOR_FIXO',
        discountInput: 500,
      });
      expect(result.success).toBe(true);
    });

    it('budgetFormSchema padrão deve instanciar com subtotal 0 sem falhas', () => {
      expect(budgetFormSchema).toBeDefined();
    });
  });
});
