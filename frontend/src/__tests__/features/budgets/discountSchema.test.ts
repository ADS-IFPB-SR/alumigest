import { describe, it, expect } from 'vitest';
import {
  discountSchema,
  createDiscountSchema,
  DiscountTypeEnum,
  PaymentConditionEnum,
} from '../../../features/budgets/schemas/discountSchema';

describe('discountSchema (Validação Zod de Descontos e Condições Comerciais)', () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  describe('Validação de Desconto Percentual', () => {
    it('deve aceitar desconto percentual entre 0% e 100%', () => {
      const validPayload = {
        discountType: 'PERCENTUAL',
        discountValue: 15,
        paymentCondition: 'A_VISTA_PIX',
      };

      const result = discountSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('deve aceitar desconto percentual de exatamente 0% e 100%', () => {
      expect(
        discountSchema.safeParse({
          discountType: 'PERCENTUAL',
          discountValue: 0,
          paymentCondition: 'CARTAO_12X',
        }).success
      ).toBe(true);

      expect(
        discountSchema.safeParse({
          discountType: 'PERCENTUAL',
          discountValue: 100,
          paymentCondition: 'A_COMBINAR',
        }).success
      ).toBe(true);
    });

    it('deve rejeitar desconto percentual maior que 100%', () => {
      const result = discountSchema.safeParse({
        discountType: 'PERCENTUAL',
        discountValue: 100.5,
        paymentCondition: 'A_VISTA_PIX',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O desconto percentual não pode ser maior que 100%.'
        );
        expect(result.error.issues[0].path).toContain('discountValue');
      }
    });

    it('deve rejeitar desconto percentual negativo', () => {
      const result = discountSchema.safeParse({
        discountType: 'PERCENTUAL',
        discountValue: -5,
        paymentCondition: 'A_VISTA_PIX',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O valor do desconto não pode ser negativo.'
        );
      }
    });
  });

  describe('Validação de Desconto por Valor Fixo', () => {
    it('deve aceitar desconto em valor fixo positivo', () => {
      const result = discountSchema.safeParse({
        discountType: 'VALOR_FIXO',
        discountValue: 250.0,
        paymentCondition: 'ENTRADA_50_SALDO_ENTREGA',
      });

      expect(result.success).toBe(true);
    });

    it('deve rejeitar desconto em valor fixo negativo', () => {
      const result = discountSchema.safeParse({
        discountType: 'VALOR_FIXO',
        discountValue: -50,
        paymentCondition: 'A_VISTA_PIX',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'O valor do desconto não pode ser negativo.'
        );
      }
    });

    it('deve rejeitar valor fixo superior ao subtotal quando teto é informado via createDiscountSchema', () => {
      const customSchema = createDiscountSchema(500);

      // Desconto dentro do limite (<= 500)
      expect(
        customSchema.safeParse({
          discountType: 'VALOR_FIXO',
          discountValue: 500,
          paymentCondition: 'A_VISTA_PIX',
        }).success
      ).toBe(true);

      // Desconto acima do limite (> 500)
      const result = customSchema.safeParse({
        discountType: 'VALOR_FIXO',
        discountValue: 500.01,
        paymentCondition: 'A_VISTA_PIX',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          'O desconto fixo não pode ser superior ao valor total do orçamento (R$ 500.00).'
        );
        expect(result.error.issues[0].path).toContain('discountValue');
      }
    });
  });

  describe('Validação de Condições de Pagamento e Observações', () => {
    it('deve aceitar todas as 4 opções oficiais de condições de pagamento', () => {
      const conditions = [
        'A_VISTA_PIX',
        'ENTRADA_50_SALDO_ENTREGA',
        'CARTAO_12X',
        'A_COMBINAR',
      ] as const;

      for (const cond of conditions) {
        const res = discountSchema.safeParse({
          discountType: 'PERCENTUAL',
          discountValue: 5,
          paymentCondition: cond,
        });
        expect(res.success).toBe(true);
      }
    });

    it('deve rejeitar condição de pagamento inválida', () => {
      const result = discountSchema.safeParse({
        discountType: 'PERCENTUAL',
        discountValue: 5,
        paymentCondition: 'BOLETO_30_DIAS',
      });

      expect(result.success).toBe(false);
    });

    it('deve aceitar observações de pagamento opcionais ou com até 500 caracteres', () => {
      expect(
        discountSchema.safeParse({
          discountType: 'PERCENTUAL',
          discountValue: 0,
          paymentCondition: 'A_VISTA_PIX',
          paymentNotes: '',
        }).success
      ).toBe(true);

      expect(
        discountSchema.safeParse({
          discountType: 'PERCENTUAL',
          discountValue: 0,
          paymentCondition: 'A_VISTA_PIX',
          paymentNotes: 'a'.repeat(500),
        }).success
      ).toBe(true);
    });

    it('deve rejeitar observações de pagamento com mais de 500 caracteres', () => {
      const result = discountSchema.safeParse({
        discountType: 'PERCENTUAL',
        discountValue: 0,
        paymentCondition: 'A_VISTA_PIX',
        paymentNotes: 'a'.repeat(501),
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'As observações de pagamento não podem exceder 500 caracteres.'
        );
      }
    });
  });

  describe('Validação da Data de Validade da Proposta (validUntil)', () => {
    it('deve aceitar quando validUntil não for preenchida (opcional)', () => {
      const result = discountSchema.safeParse({
        discountType: 'PERCENTUAL',
        discountValue: 10,
        paymentCondition: 'A_VISTA_PIX',
      });

      expect(result.success).toBe(true);
    });

    it('deve aceitar validUntil no futuro ou na data de hoje', () => {
      const result = discountSchema.safeParse({
        discountType: 'PERCENTUAL',
        discountValue: 10,
        paymentCondition: 'A_VISTA_PIX',
        validUntil: tomorrowStr,
      });

      expect(result.success).toBe(true);
    });

    it('deve rejeitar validUntil no passado', () => {
      const result = discountSchema.safeParse({
        discountType: 'PERCENTUAL',
        discountValue: 10,
        paymentCondition: 'A_VISTA_PIX',
        validUntil: yesterdayStr,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          'A data de validade não pode ser anterior a hoje.'
        );
      }
    });
  });

  describe('Exportações e Enums', () => {
    it('deve exportar os enums do Zod para uso desacoplado', () => {
      expect(DiscountTypeEnum.options).toEqual(['PERCENTUAL', 'VALOR_FIXO']);
      expect(PaymentConditionEnum.options).toEqual([
        'A_VISTA_PIX',
        'ENTRADA_50_SALDO_ENTREGA',
        'CARTAO_12X',
        'A_COMBINAR',
      ]);
    });
  });
});
