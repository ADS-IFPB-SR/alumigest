import { describe, it, expect } from 'vitest';
import {
  formatCurrencyInput,
  parseCurrencyString,
  formatUppercase,
  formatInteger,
  formatWeightInput,
  parseWeightString,
} from '@/utils/formatters';

describe('formatters utility [Joseph Nichollas]', () => {
  describe('formatCurrencyInput', () => {
    it('deve retornar string vazia para entrada vazia ou inválida', () => {
      expect(formatCurrencyInput('')).toBe('');
      expect(formatCurrencyInput('abc')).toBe('');
    });

    it('deve formatar valores numéricos em moeda pt-BR', () => {
      expect(formatCurrencyInput('100')).toBe('1,00');
      expect(formatCurrencyInput('125050')).toBe('1.250,50');
      expect(formatCurrencyInput('50')).toBe('0,50');
    });

    it('deve limitar a 10 dígitos', () => {
      const result = formatCurrencyInput('1234567890123');
      expect(result).toBeDefined();
    });
  });

  describe('parseCurrencyString', () => {
    it('deve retornar 0 para string vazia ou sem dígitos', () => {
      expect(parseCurrencyString('')).toBe(0);
      expect(parseCurrencyString('abc')).toBe(0);
    });

    it('deve converter valor formatado para float correto', () => {
      expect(parseCurrencyString('1.250,50')).toBe(1250.5);
      expect(parseCurrencyString('100')).toBe(1);
    });
  });

  describe('formatUppercase', () => {
    it('deve converter string para maiúsculas', () => {
      expect(formatUppercase('teste')).toBe('TESTE');
      expect(formatUppercase('AlumiGest')).toBe('ALUMIGEST');
    });
  });

  describe('formatInteger', () => {
    it('deve remover todos os caracteres não numéricos', () => {
      expect(formatInteger('abc123def456')).toBe('123456');
      expect(formatInteger('10.5')).toBe('105');
      expect(formatInteger('text')).toBe('');
    });
  });

  describe('formatWeightInput', () => {
    it('deve retornar string vazia para entrada vazia ou inválida', () => {
      expect(formatWeightInput('')).toBe('');
      expect(formatWeightInput('abc')).toBe('');
    });

    it('deve formatar peso com 3 casas decimais pt-BR', () => {
      expect(formatWeightInput('1500')).toBe('1,500');
      expect(formatWeightInput('250')).toBe('0,250');
    });

    it('deve limitar a 7 dígitos', () => {
      const result = formatWeightInput('1234567890');
      expect(result).toBeDefined();
    });
  });

  describe('parseWeightString', () => {
    it('deve retornar 0 para string vazia ou sem dígitos', () => {
      expect(parseWeightString('')).toBe(0);
      expect(parseWeightString('abc')).toBe(0);
    });

    it('deve converter peso formatado para número correto', () => {
      expect(parseWeightString('1,500')).toBe(1.5);
      expect(parseWeightString('250')).toBe(0.25);
    });
  });
});
