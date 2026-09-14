import { describe, it, expect } from 'vitest';
import { getBudgetStatusTheme, BUDGET_STATUS_THEMES } from '../../../features/budgets/utils/statusTheme';

describe('statusTheme', () => {
  it('deve retornar a configuração correta de tema para o estado EXPIRED', () => {
    const expiredTheme = getBudgetStatusTheme('EXPIRED');
    expect(expiredTheme.key).toBe('EXPIRED');
    expect(expiredTheme.label).toBe('Expirado');
    expect(expiredTheme.badge).toContain('bg-rose-50');
    expect(expiredTheme.badge).toContain('text-rose-700');
    expect(expiredTheme.badge).toContain('border-rose-200');
  });

  it('deve tratar entradas minúsculas/indefinidas com fallback correto para DRAFT', () => {
    const expiredLower = getBudgetStatusTheme('expired' as any);
    expect(expiredLower.key).toBe('EXPIRED');

    const nullStatus = getBudgetStatusTheme(null);
    expect(nullStatus.key).toBe('DRAFT');

    const invalidStatus = getBudgetStatusTheme('INVALID_STATUS' as any);
    expect(invalidStatus.key).toBe('DRAFT');
  });

  it('deve manter todas as chaves de BUDGET_STATUS_THEMES consistentes', () => {
    const keys = Object.keys(BUDGET_STATUS_THEMES);
    expect(keys).toContain('EXPIRED');
    expect(keys).toContain('DRAFT');
    expect(keys).toContain('SENT');
    expect(keys).toContain('APPROVED');
    expect(keys).toContain('REJECTED');
    expect(keys).toContain('CANCELLED');
  });
});