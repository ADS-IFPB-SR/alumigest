import { describe, it, expect } from 'vitest';
import { BUDGET_STATUS_THEMES, getBudgetStatusTheme } from '../../../features/budgets/utils/statusTheme';
import type { BudgetStatus } from '../../../features/budgets/types';

describe('statusTheme', () => {
  it('should define all 5 budget statuses in BUDGET_STATUS_THEMES', () => {
    const statuses: BudgetStatus[] = ['DRAFT', 'SENT', 'APPROVED', 'REJECTED', 'CANCELLED'];

    statuses.forEach((st) => {
      expect(BUDGET_STATUS_THEMES[st]).toBeDefined();
      expect(BUDGET_STATUS_THEMES[st].key).toBe(st);
      expect(BUDGET_STATUS_THEMES[st].label).toBeTruthy();
      expect(BUDGET_STATUS_THEMES[st].icon).toBeTruthy();
      expect(BUDGET_STATUS_THEMES[st].badge).toBeTruthy();
    });
  });

  it('should have exact semantic icons for each status', () => {
    expect(BUDGET_STATUS_THEMES.DRAFT.icon).toBe('edit_note');
    expect(BUDGET_STATUS_THEMES.SENT.icon).toBe('send');
    expect(BUDGET_STATUS_THEMES.APPROVED.icon).toBe('check_circle');
    expect(BUDGET_STATUS_THEMES.REJECTED.icon).toBe('cancel');
    expect(BUDGET_STATUS_THEMES.CANCELLED.icon).toBe('block');
  });

  it('should return DRAFT theme as fallback when given invalid status', () => {
    // @ts-expect-error testing invalid status fallback
    expect(getBudgetStatusTheme('INVALID_STATUS')).toEqual(BUDGET_STATUS_THEMES.DRAFT);
    expect(getBudgetStatusTheme(null)).toEqual(BUDGET_STATUS_THEMES.DRAFT);
    expect(getBudgetStatusTheme(undefined)).toEqual(BUDGET_STATUS_THEMES.DRAFT);
  });
});
