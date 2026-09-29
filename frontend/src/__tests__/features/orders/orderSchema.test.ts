import { describe, it, expect } from 'vitest';
import { convertOrderSchema, cancelOrderSchema } from '@/features/orders/schemas';

describe('Orders Schemas — Testes Formais de QA', () => {
  describe('convertOrderSchema', () => {
    it('[Partição de Equivalência] deve validar com sucesso dados válidos de conversão', () => {
      const validData = {
        canalAprovacao: 'WHATSAPP' as const,
        dataPrevisaoEntrega: '2026-10-15',
        observacoes: 'Cliente confirmou medição pela manhã.',
      };

      const result = convertOrderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('[Partição de Equivalência] deve rejeitar canal de aprovação inválido', () => {
      const invalidData = {
        canalAprovacao: 'SINAL_DE_FUMACA',
        dataPrevisaoEntrega: '2026-10-15',
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
        dataPrevisaoEntrega: '2026-10-20',
      };
      const resultValid = convertOrderSchema.safeParse(validDate);
      expect(resultValid.success).toBe(true);
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
