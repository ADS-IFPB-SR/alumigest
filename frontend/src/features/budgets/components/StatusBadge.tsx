import React from 'react';
import type { BudgetStatus } from '../types';
import { getBudgetStatusTheme } from '../utils/statusTheme';

interface StatusBadgeProps {
  status: BudgetStatus | string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const theme = getBudgetStatusTheme(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${theme.badge} ${className}`}
    >
      {showIcon && (
        <span className="material-symbols-outlined text-[14px] mr-1 select-none">
          {theme.icon}
        </span>
      )}
      {theme.label}
    </span>
  );
};

export default StatusBadge;