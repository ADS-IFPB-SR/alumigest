import type { BudgetStatus } from '../types';
import { getBudgetStatusTheme } from '../utils/statusTheme';

interface StatusBadgeProps {
  readonly status: BudgetStatus;
  readonly showIcon?: boolean;
  readonly className?: string;
}


export function StatusBadge({ status, showIcon = true, className = '' }: StatusBadgeProps) {
  const theme = getBudgetStatusTheme(status);

  return (
    <span
      className={`inline-flex items-center gap-xs px-sm py-xs rounded-md text-xs font-semibold font-label border whitespace-nowrap transition-colors ${theme.badge} ${className}`}
    >
      {showIcon && (
        <span className="material-symbols-outlined text-[14px]">
          {theme.icon}
        </span>
      )}
      {theme.label}
    </span>
  );
}

