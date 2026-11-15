import React from 'react';
import type { StockAlertStatus } from '../types';

export interface StockAlertBadgeProps {
  status: StockAlertStatus;
  availableQuantity?: number;
  unitMeasure?: string;
  className?: string;
  variant?: 'default' | 'kanban';
  label?: string;
  tooltip?: string;
  title?: string;
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

  if (status === 'NEED_PURCHASE') {
    let defaultLabel = variant === 'kanban' ? 'Falta Insumo / Comprar' : 'Comprar';
    if (label) {
      defaultLabel = label;
    } else if (variant === 'default' && availableQuantity !== undefined && availableQuantity < 0) {
      const absQty = Math.abs(availableQuantity);
      const unit = unitMeasure ? ` ${unitMeasure}` : '';
      defaultLabel = `Comprar (${absQty}${unit})`;
    }

    return (
      <span
        data-testid="badge-stock-need-purchase"
        title={effectiveTooltip}
        onMouseEnter={() => setShowHoverTooltip(true)}
        onMouseLeave={() => setShowHoverTooltip(false)}
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 cursor-default ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span>{defaultLabel}</span>
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
  }

  if (status === 'ORDER_POINT') {
    const defaultLabel = label || 'Ponto de Pedido';
    return (
      <span
        data-testid="badge-stock-order-point"
        title={effectiveTooltip}
        onMouseEnter={() => setShowHoverTooltip(true)}
        onMouseLeave={() => setShowHoverTooltip(false)}
        className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 cursor-default ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>{defaultLabel}</span>
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
  }

  const defaultLabel = label || (variant === 'kanban' ? 'Insumos Disponíveis' : 'Em Dia');
  return (
    <span
      data-testid="badge-stock-in-stock"
      title={effectiveTooltip}
      onMouseEnter={() => setShowHoverTooltip(true)}
      onMouseLeave={() => setShowHoverTooltip(false)}
      className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>{defaultLabel}</span>
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
