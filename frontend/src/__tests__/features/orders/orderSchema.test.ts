import { describe, it, expect } from 'vitest';
import {
  convertOrderSchema,
  orderConvertSchema,
  cancelOrderSchema,
  getDefaultDeliveryDate,
  getMinDeliveryDate,
  formatToDateInput,
} from '@/features/orders/schemas';

describe('Orders Schemas — Testes Formais de QA', () => {
  describe('convertOrderSchema e orderConvertSchema (US-13.3)', () => {
    it('[Partição de Equivalência] deve validar com sucesso dados válidos de conversão', () => {
      const validData = {
        canalAprovacao: 'WHATSAPP' as const,
        dataPrevisaoEntrega: getDefaultDeliveryDate(15),
        observacoes: 'Cliente confirmou medição pela manhã.',
      };

      const result = convertOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);

      // Valida alias
      const aliasResult = orderConvertSchema.safeParse(validData);
      expect(aliasResult.success).toBe(true);
    });

    it('[Partição de Equivalência] deve rejeitar canal de aprovação inválido', () => {
      const invalidData = {
        canalAprovacao: 'SINAL_DE_FUMACA',
        dataPrevisaoEntrega: getDefaultDeliveryDate(15),
      };

      const result = convertOrderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('canal de aprovação válido');
      }
    });

    it('[Análise de Valor Limite] deve rejeitar data vazia e aceitar data válida', () => {
      const emptyDate = {
        canalAprovacao: 'PRESENCIAL' as const,
        dataPrevisaoEntrega: '',
      };

      const resultEmpty = convertOrderSchema.safeParse(emptyDate);
      expect(resultEmpty.success).toBe(false);

      const validDate = {
        canalAprovacao: 'PRESENCIAL' as const,
        dataPrevisaoEntrega: getDefaultDeliveryDate(5),
      };
      const resultValid = convertOrderSchema.safeParse(validDate);
      expect(resultValid.success).toBe(true);
    });

    it('[Análise de Valor Limite] deve rejeitar data retroativa (anterior a hoje)', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = formatToDateInput(yesterday);

      const result = convertOrderSchema.safeParse({
        canalAprovacao: 'TELEFONE' as const,
        dataPrevisaoEntrega: yesterdayStr,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('não pode ser retroativa');
      }
    });

    it('[Análise de Valor Limite] deve aceitar data de hoje como data mínima permitida', () => {
      const todayStr = getMinDeliveryDate();

      const result = convertOrderSchema.safeParse({
        canalAprovacao: 'EMAIL' as const,
        dataPrevisaoEntrega: todayStr,
      });

      expect(result.success).toBe(true);
    });

    it('deve calcular corretamente data padrão de +15 dias corridos', () => {
      const defaultDate = getDefaultDeliveryDate(15);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + 15);
      expect(defaultDate).toBe(formatToDateInput(expectedDate));
    });
  });

  describe('cancelOrderSchema', () => {
    it('[Análise de Valor Limite] deve rejeitar justificativa com 9 caracteres (fronteira inferior inválida)', () => {
      const result = cancelOrderSchema.safeParse({
        justificativa: '123456789',
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('pelo menos 10 caracteres');
      }
    });

    it('[Análise de Valor Limite] deve aceitar justificativa com exatamente 10 caracteres (fronteira inferior válida)', () => {
      const result = cancelOrderSchema.safeParse({
        justificativa: '1234567890',
      });

      expect(result.success).toBe(true);
    });

    it('[Partição de Equivalência] deve rejeitar justificativa em branco ou vazia', () => {
      const result = cancelOrderSchema.safeParse({
        justificativa: '         ',
      });

      expect(result.success).toBe(false);
    });
  });
});
