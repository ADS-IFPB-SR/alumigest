import type { BudgetStatus } from '../types';
import { BUDGET_STATUS_CONFIG } from '../types';

interface StatusBadgeProps {
  status: BudgetStatus;
  showIcon?: boolean;
  className?: string;
}

const STATUS_STYLES: Record<BudgetStatus, string> = {
  DRAFT: 'bg-surface-container-high text-on-surface-variant border-outline-variant/60',
  SENT: 'bg-[#dbeafe] text-[#1e40af] border-[#93c5fd] dark:bg-[#1e3a5f] dark:text-[#93c5fd] dark:border-[#1e3a5f]',
  APPROVED: 'bg-success/10 text-success border-success/30',
  REJECTED: 'bg-error-container text-on-error-container border-error/30',
  CANCELLED: 'bg-surface-container-highest text-on-surface-variant border-outline/40',
};

export function StatusBadge({ status, showIcon = true, className = '' }: StatusBadgeProps) {
  const config = BUDGET_STATUS_CONFIG[status] || BUDGET_STATUS_CONFIG.DRAFT;
  const styles = STATUS_STYLES[config.key] || STATUS_STYLES.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-xs px-sm py-xs rounded-md text-xs font-semibold font-label border whitespace-nowrap transition-colors ${styles} ${className}`}
    >
      {showIcon && (
        <span className="material-symbols-outlined text-[14px]">
          {config.icon}
        </span>
      )}
      {config.label}
    </span>
  );
}
