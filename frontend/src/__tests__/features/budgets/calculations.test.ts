import { describe, it, expect } from 'vitest';
import { calcItemSubtotal, formatBRL } from '../../../features/budgets/utils/calculations';

describe('calculations.ts', () => {
  describe('calcItemSubtotal', () => {
    it('deve calcular o subtotal de materiais multiplicado pela quantidade e somado à mão de obra', () => {
      const options = [
        { quantity: 2, unitPrice: 50 }, // 100
        { quantity: 1.5, unitPrice: 100 }, // 150
      ];
      const laborCost = 80;
      const quantity = 2; // (100 + 150) * 2 + 80 = 500 + 80 = 580

      const result = calcItemSubtotal(options, laborCost, quantity);
      expect(result).toBe(580);
    });

    it('deve usar quantidade 1 como fallback se a quantidade de esquadrias for zero, negativa ou inválida', () => {
      const options = [{ quantity: 2, unitPrice: 30 }]; // 60
      const laborCost = 40;

      // @ts-expect-error testando fallback de quantidade 0
      expect(calcItemSubtotal(options, laborCost, 0)).toBe(100);
      expect(calcItemSubtotal(options, laborCost, -5)).toBe(100);
    });

    it('deve ignorar opções de insumo com quantidade negativa, zero ou indefinida', () => {
      const options = [
        { quantity: 0, unitPrice: 50 },
        { quantity: -2, unitPrice: 50 },
        { unitPrice: 50 }, // quantity undefined
        { quantity: 3, unitPrice: 20 }, // 60
      ];
      const laborCost = 15;
      const quantity = 1;

      expect(calcItemSubtotal(options, laborCost, quantity)).toBe(75);
    });

    it('deve tratar mão de obra nula, negativa ou ausente como 0', () => {
      const options = [{ quantity: 1, unitPrice: 120 }];
      // @ts-expect-error testando fallback de laborCost nulo
      expect(calcItemSubtotal(options, null, 1)).toBe(120);
      // @ts-expect-error testando fallback de laborCost undefined
      expect(calcItemSubtotal(options, undefined, 1)).toBe(120);
      expect(calcItemSubtotal(options, 0, 1)).toBe(120);
    });

    it('deve arredondar com precisão para 2 casas decimais evitando dízimas de ponto flutuante', () => {
      const options = [
        { quantity: 0.33, unitPrice: 10.15 }, // 3.3495
        { quantity: 0.67, unitPrice: 5.05 },  // 3.3835
      ];
      const laborCost = 12.33;
      const quantity = 3;

      const result = calcItemSubtotal(options, laborCost, quantity);
      expect(result).toBe(32.53);
    });
  });

  describe('formatBRL', () => {
    it('deve formatar valores monetários em formato de moeda brasileira BRL', () => {
      const formatted = formatBRL(1250.5);
      expect(formatted).toMatch(/R\$\s*1\.250,50/);
    });

    it('deve formatar zero corretamente', () => {
      const formatted = formatBRL(0);
      expect(formatted).toMatch(/R\$\s*0,00/);
    });

    it('deve formatar números fracionários pequenos mantendo 2 casas decimais', () => {
      const formatted = formatBRL(0.05);
      expect(formatted).toMatch(/R\$\s*0,05/);
    });

    it('deve formatar números grandes com separador de milhar', () => {
      const formatted = formatBRL(1000000);
      expect(formatted).toMatch(/R\$\s*1\.000\.000,00/);
    });
  });
});
