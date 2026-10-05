import { describe, it, expect } from 'vitest';
import { formatDate } from '../../../features/orders/utils/formatDate';

describe('formatDate', () => {
  it('deve formatar data no formato YYYY-MM-DD sem deslocamento de fuso horário', () => {
    expect(formatDate('2026-10-04')).toBe('04/10/2026');
    expect(formatDate('2026-01-01')).toBe('01/01/2026');
    expect(formatDate('2026-12-31')).toBe('31/12/2026');
  });

  it('deve retornar traço para valores nulos, vazios ou indefinidos', () => {
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
  });

  it('deve formatar datas ISO com horário corretamente', () => {
    const formatted = formatDate('2026-10-04T15:30:00Z');
    expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('deve retornar a string original se for uma data inválida', () => {
    expect(formatDate('data-invalida')).toBe('data-invalida');
  });
});
