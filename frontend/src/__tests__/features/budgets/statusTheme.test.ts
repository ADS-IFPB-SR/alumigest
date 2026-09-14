import { describe, it, expect } from 'vitest';
import { getBudgetStatusTheme, BUDGET_STATUS_THEMES } from '../../../features/budgets/utils/statusTheme';
import type { BudgetStatus } from '../../../features/budgets/types';

describe('statusTheme', () => {
  it('deve retornar a configuração correta de tema para o estado EXPIRED', () => {
    const expiredTheme = getBudgetStatusTheme('EXPIRED');
    expect(expiredTheme.key).toBe('EXPIRED');
    expect(expiredTheme.label).toBe('Expirado');
    expect(expiredTheme.icon).toBe('warning');
    expect(expiredTheme.badge).toContain('bg-rose-50');
    expect(expiredTheme.badge).toContain('text-rose-700');
    expect(expiredTheme.badge).toContain('border-rose-200');
  });

  it('deve tratar entradas minúsculas, indefinidas ou tipos inválidos com fallback correto', () => {
    const expiredLower = getBudgetStatusTheme('expired' as any);
    expect(expiredLower.key).toBe('EXPIRED');

    const nullStatus = getBudgetStatusTheme(null);
    expect(nullStatus.key).toBe('DRAFT');

    const undefinedStatus = getBudgetStatusTheme(undefined);
    expect(undefinedStatus.key).toBe('DRAFT');

    const invalidStatus = getBudgetStatusTheme('INVALID_STATUS' as any);
    expect(invalidStatus.key).toBe('DRAFT');

    const numberStatus = getBudgetStatusTheme(123 as any);
    expect(numberStatus.key).toBe('DRAFT');

    const objectStatus = getBudgetStatusTheme({} as any);
    expect(objectStatus.key).toBe('DRAFT');
  });

  it('deve manter todas as 6 chaves de BUDGET_STATUS_THEMES consistentes e completas', () => {
    const statuses: BudgetStatus[] = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'CANCELLED', 'EXPIRED'];

    statuses.forEach((st) => {
      expect(BUDGET_STATUS_THEMES[st]).toBeDefined();
      expect(BUDGET_STATUS_THEMES[st].key).toBe(st);
      expect(BUDGET_STATUS_THEMES[st].label).toBeTruthy();
      expect(BUDGET_STATUS_THEMES[st].icon).toBeTruthy();
      expect(BUDGET_STATUS_THEMES[st].badge).toBeTruthy();
    });
  });

  it('deve ter os ícones semânticos exatos para cada status', () => {
    expect(BUDGET_STATUS_THEMES.DRAFT.icon).toBe('edit_note');
    expect(BUDGET_STATUS_THEMES.SENT.icon).toBe('send');
    expect(BUDGET_STATUS_THEMES.APPROVED.icon).toBe('check_circle');
    expect(BUDGET_STATUS_THEMES.REJECTED.icon).toBe('cancel');
    expect(BUDGET_STATUS_THEMES.CANCELLED.icon).toBe('block');
    expect(BUDGET_STATUS_THEMES.EXPIRED.icon).toBe('warning');
  });
});