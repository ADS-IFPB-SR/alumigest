import React from 'react';
import type { StockAlertStatus } from '../types';

interface StockAlertBadgeProps {
  status: StockAlertStatus;
  availableQuantity?: number;
  unitMeasure?: string;
  className?: string;
}

export const StockAlertBadge: React.FC<StockAlertBadgeProps> = ({
  status,
  availableQuantity,
  unitMeasure = '',
  className = '',
}) => {
  if (status === 'NEED_PURCHASE') {
    let deficitLabel = '';
    if (availableQuantity !== undefined && availableQuantity < 0) {
      const absQty = Math.abs(availableQuantity);
      const unit = unitMeasure ? ` ${unitMeasure}` : '';
      deficitLabel = ` (${absQty}${unit})`;
    }

    return (
      <span
        data-testid="badge-stock-need-purchase"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span>Comprar{deficitLabel}</span>
      </span>
    );
  }

  if (status === 'ORDER_POINT') {
    return (
      <span
        data-testid="badge-stock-order-point"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        <span>Ponto de Pedido</span>
      </span>
    );
  }

  return (
    <span
      data-testid="badge-stock-in-stock"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>Em Dia</span>
    </span>
  );
};
