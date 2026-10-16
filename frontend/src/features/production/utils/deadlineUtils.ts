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

  let deadline: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dataPrevisaoEntrega)) {
    const [year, month, day] = dataPrevisaoEntrega.split('-').map(Number);
    deadline = new Date(year, month - 1, day);
  } else {
    deadline = new Date(dataPrevisaoEntrega);
  }

  if (Number.isNaN(deadline.getTime())) return 'NORMAL';
  deadline.setHours(0, 0, 0, 0);

  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'LATE';
  if (diffDays <= 3) return 'CRITICAL';

  return 'NORMAL';
}