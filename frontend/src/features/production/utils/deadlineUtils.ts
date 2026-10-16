// frontend/src/features/production/utils/deadlineUtils.ts

export type DeadlineStatus = 'LATE' | 'CRITICAL' | 'NORMAL';

/**
 * Calcula o status do prazo de entrega com base na data prevista.
 * - LATE: Atrasado (dias < 0)
 * - CRITICAL: Prazo Crítico (0 a 3 dias)
 * - NORMAL: Mais de 3 dias ou sem data
 */
export function getDeadlineStatus(dataPrevisaoEntrega?: string | null): DeadlineStatus {
  if (!dataPrevisaoEntrega) return 'NORMAL';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(dataPrevisaoEntrega);
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'LATE';
  if (diffDays <= 3) return 'CRITICAL';

  return 'NORMAL';
}