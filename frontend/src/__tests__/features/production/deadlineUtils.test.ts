import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getDeadlineStatus } from '../../../features/production/utils/deadlineUtils';

describe('deadlineUtils - getDeadlineStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fixa a data atual como 16/10/2026 às 10:00:00 local
    vi.setSystemTime(new Date(2026, 9, 16, 10, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Partição de Equivalência (EP) - Entradas vazias ou inválidas', () => {
    it('deve retornar "NORMAL" quando a data for nula', () => {
      expect(getDeadlineStatus(null)).toBe('NORMAL');
    });

    it('deve retornar "NORMAL" quando a data for undefined', () => {
      expect(getDeadlineStatus(undefined)).toBe('NORMAL');
    });

    it('deve retornar "NORMAL" quando a data for string vazia', () => {
      expect(getDeadlineStatus('')).toBe('NORMAL');
    });

    it('deve retornar "NORMAL" quando a string de data for inválida', () => {
      expect(getDeadlineStatus('data-invalida')).toBe('NORMAL');
    });
  });

  describe('Análise de Valor Limite (BVA) & Transições de Status', () => {
    it('deve retornar "LATE" quando a data for ontem (-1 dia)', () => {
      expect(getDeadlineStatus('2026-10-15')).toBe('LATE');
    });

    it('deve retornar "LATE" quando a data estiver muito no passado (-10 dias)', () => {
      expect(getDeadlineStatus('2026-10-06')).toBe('LATE');
    });

    it('deve retornar "CRITICAL" quando a data for exatamente hoje (0 dias restantes)', () => {
      expect(getDeadlineStatus('2026-10-16')).toBe('CRITICAL');
    });

    it('deve retornar "CRITICAL" quando a data for amanhã (+1 dia)', () => {
      expect(getDeadlineStatus('2026-10-17')).toBe('CRITICAL');
    });

    it('deve retornar "CRITICAL" quando a data for daqui a 2 dias (+2 dias)', () => {
      expect(getDeadlineStatus('2026-10-18')).toBe('CRITICAL');
    });

    it('deve retornar "CRITICAL" na fronteira máxima de prazo crítico (+3 dias)', () => {
      expect(getDeadlineStatus('2026-10-19')).toBe('CRITICAL');
    });

    it('deve retornar "NORMAL" na fronteira imediata superior ao prazo crítico (+4 dias)', () => {
      expect(getDeadlineStatus('2026-10-20')).toBe('NORMAL');
    });

    it('deve retornar "NORMAL" para prazos futuros distantes (+15 dias)', () => {
      expect(getDeadlineStatus('2026-10-31')).toBe('NORMAL');
    });
  });

  describe('Suporte a formatos ISO com horário', () => {
    it('deve processar corretamente formato ISO completo', () => {
      expect(getDeadlineStatus('2026-10-17T23:59:59')).toBe('CRITICAL');
      expect(getDeadlineStatus('2026-10-15T08:00:00')).toBe('LATE');
      expect(getDeadlineStatus('2026-10-25T14:30:00')).toBe('NORMAL');
    });
  });
});
