import React from 'react';
import type { StockDisplayAlertStatus } from '../types';
import { formatStockQuantity } from '../utils/stockPresentation';

export type StockAlertBadgeVariant = 'default' | 'kanban' | 'catalog';

export interface StockAlertBadgeProps {
  status: StockDisplayAlertStatus;
  availableQuantity?: number;
  unitMeasure?: string;
  className?: string;
  variant?: StockAlertBadgeVariant;
  label?: string;
  tooltip?: string;
  title?: string;
}

interface BadgeStyleConfig {
  readonly testId: string;
  readonly containerClass: string;
  readonly dotClass: string;
}

const BADGE_STYLES: Readonly<Record<StockDisplayAlertStatus, BadgeStyleConfig>> = {
  NEED_PURCHASE: {
    testId: 'badge-stock-need-purchase',
    containerClass:
      'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
    dotClass: 'bg-rose-500 animate-pulse',
  },
  ORDER_POINT: {
    testId: 'badge-stock-order-point',
    containerClass:
      'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
    dotClass: 'bg-amber-500',
  },
  IN_STOCK: {
    testId: 'badge-stock-in-stock',
    containerClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
    dotClass: 'bg-emerald-500',
  },
  NO_BALANCE: {
    testId: 'badge-stock-no-balance',
    containerClass:
      'bg-surface-container text-on-surface-variant border-outline-variant',
    dotClass: 'bg-slate-400 dark:bg-slate-500',
  },
};

function resolveBadgeLabel(
  status: StockDisplayAlertStatus,
  variant: StockAlertBadgeVariant,
  availableQuantity?: number,
  unitMeasure = '',
  customLabel?: string
): string {
  if (customLabel) {
    return customLabel;
  }

  if (status === 'NO_BALANCE') {
    return 'Sem Saldo';
  }

  if (status === 'ORDER_POINT') {
    return 'Ponto de Pedido';
  }

  if (status === 'IN_STOCK') {
    if (variant === 'kanban') {
      return 'Insumos Disponíveis';
    }
    return variant === 'catalog' ? 'Em Estoque' : 'Em Dia';
  }

  // NEED_PURCHASE
  if (variant === 'kanban') {
    return 'Falta Insumo / Comprar';
  }

  if (variant === 'catalog') {
    if (availableQuantity !== undefined && availableQuantity < 0) {
      return `Falta ${formatStockQuantity(Math.abs(availableQuantity), unitMeasure)}`;
    }
    return 'Falta Insumo';
  }

  if (availableQuantity !== undefined && availableQuantity < 0) {
    const absQty = Math.abs(availableQuantity);
    const unit = unitMeasure ? ` ${unitMeasure}` : '';
    return `Comprar (${absQty}${unit})`;
  }

  return 'Comprar';
}

export const StockAlertBadge: React.FC<StockAlertBadgeProps> = ({
  status,
  availableQuantity,
  unitMeasure = '',
  className = '',
  variant = 'default',
  label,
  tooltip,
  title,
}) => {
  const [showHoverTooltip, setShowHoverTooltip] = React.useState(false);
  const effectiveTooltip = tooltip || title;
  const style = BADGE_STYLES[status];
  const resolvedLabel = resolveBadgeLabel(
    status,
    variant,
    availableQuantity,
    unitMeasure,
    label
  );

  return (
    <span
      data-testid={style.testId}
      title={effectiveTooltip}
      onMouseEnter={() => setShowHoverTooltip(true)}
      onMouseLeave={() => setShowHoverTooltip(false)}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${style.containerClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`} aria-hidden="true" />
      <span>{resolvedLabel}</span>
      {showHoverTooltip && effectiveTooltip && (
        <span
          role="tooltip"
          data-testid="stock-alert-tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1.5 text-[11px] font-normal bg-slate-900 text-white rounded-md shadow-lg z-50 whitespace-pre pointer-events-none text-left min-w-max"
        >
          {effectiveTooltip}
        </span>
      )}
    </span>
  );
};
