import type { BudgetStatus } from '../types';

export interface BudgetStatusTheme {
  key: BudgetStatus;
  label: string;
  icon: string;
  /**
   * Classes para renderização em Badges (StatusBadge, listagens, tabelas e cards).
   */
  badge: string;
  /**
   * Classes para renderização da etapa ATIVA no Stepper/Pipeline.
   */
  stepperActive: string;
  /**
   * Classes para renderização da etapa CONCLUÍDA no Stepper/Pipeline.
   */
  stepperCompleted: string;
  /**
   * Classes para renderização da etapa FUTURA/NÃO-ATINGIDA no Stepper/Pipeline.
   */
  stepperUpcoming: string;
  /**
   * Classes para itens de menu/dropdown de ações secundárias.
   */
  menuAction: string;
}

export const BUDGET_STATUS_THEMES: Record<BudgetStatus, BudgetStatusTheme> = {
  DRAFT: {
    key: 'DRAFT',
    label: 'Rascunho',
    icon: 'edit_note',
    badge: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    stepperActive: 'bg-[#f1f5f9] text-[#334155] border-[#cbd5e1] dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600 shadow-2xs ring-2 ring-slate-400/20 font-bold',
    stepperCompleted: 'text-[#475569] bg-slate-100/80 border-slate-200 dark:text-slate-400 dark:bg-slate-800/40 hover:bg-slate-200/70 font-semibold',
    stepperUpcoming: 'text-on-surface-variant/60 hover:text-on-surface hover:bg-surface-container font-medium border-transparent',
    menuAction: 'text-[#334155] dark:text-slate-300 hover:bg-[#f1f5f9] dark:hover:bg-slate-800',
  },
  SENT: {
    key: 'SENT',
    label: 'Enviado',
    icon: 'send',
    badge: 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] dark:bg-[#1e3a5f] dark:text-[#93c5fd] dark:border-[#1e3a5f]',
    stepperActive: 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] dark:bg-[#1e3a5f] dark:text-[#93c5fd] dark:border-[#1e3a5f] shadow-2xs ring-2 ring-blue-400/25 font-bold',
    stepperCompleted: 'text-[#1e40af] bg-[#dbeafe]/60 border-blue-200 dark:text-blue-300 dark:bg-blue-950/50 hover:bg-[#dbeafe] font-semibold',
    stepperUpcoming: 'text-on-surface-variant/60 hover:text-[#1e40af] hover:bg-[#dbeafe]/30 font-medium border-transparent',
    menuAction: 'text-[#1e40af] dark:text-blue-300 hover:bg-[#dbeafe]/50 dark:hover:bg-blue-950/40',
  },
  APPROVED: {
    key: 'APPROVED',
    label: 'Aprovado',
    icon: 'check_circle',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    stepperActive: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs ring-2 ring-emerald-400/25 font-bold',
    stepperCompleted: 'text-emerald-700 bg-emerald-50/80 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-950/50 hover:bg-emerald-100 font-semibold',
    stepperUpcoming: 'text-on-surface-variant/60 hover:text-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 font-medium border-transparent',
    menuAction: 'text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40',
  },
  REJECTED: {
    key: 'REJECTED',
    label: 'Rejeitado',
    icon: 'cancel',
    badge: 'bg-[#fee2e2] text-[#991b1b] border-[#fca5a5] dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800',
    stepperActive: 'bg-[#fee2e2] text-[#991b1b] border-[#fca5a5] dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800 shadow-2xs font-bold',
    stepperCompleted: '',
    stepperUpcoming: '',
    menuAction: 'text-[#991b1b] dark:text-rose-300 hover:bg-[#fee2e2]/50 dark:hover:bg-rose-950/40',
  },
  CANCELLED: {
    key: 'CANCELLED',
    label: 'Cancelado',
    icon: 'block',
    badge: 'bg-[#e2e8f0] text-[#334155] border-[#cbd5e1] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
    stepperActive: 'bg-[#e2e8f0] text-[#334155] border-[#cbd5e1] dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 shadow-2xs font-bold',
    stepperCompleted: '',
    stepperUpcoming: '',
    menuAction: 'text-[#334155] dark:text-slate-300 hover:bg-[#e2e8f0]/60 dark:hover:bg-slate-800',
  },
  EXPIRED: {
    key: 'EXPIRED',
    label: 'Expirado',
    icon: 'warning',
    badge: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800',
    stepperActive: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800 shadow-2xs font-bold',
    stepperCompleted: '',
    stepperUpcoming: '',
    menuAction: 'text-rose-700 dark:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/40',
  },
};

/**
 * Obtém a configuração de tema e estilo de um status de orçamento de forma segura com fallback para DRAFT.
 */
export function getBudgetStatusTheme(status?: BudgetStatus | string | null): BudgetStatusTheme {
  if (!status || typeof status !== 'string') {
    return BUDGET_STATUS_THEMES.DRAFT;
  }

  const normalizedKey = status.toUpperCase() as BudgetStatus;
  if (Object.prototype.hasOwnProperty.call(BUDGET_STATUS_THEMES, normalizedKey)) {
    return BUDGET_STATUS_THEMES[normalizedKey];
  }

  return BUDGET_STATUS_THEMES.DRAFT;
}