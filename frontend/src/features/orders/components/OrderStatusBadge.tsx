import React from 'react';
import type { OrderStatus } from '../types';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, className = '' }) => {
  const label = ORDER_STATUS_LABELS[status] || status;
  const { bg, text, border } = ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS.CREATED || {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-label font-bold border ${bg} ${text} ${border} whitespace-nowrap ${className}`}
      data-testid="order-status-badge"
    >
      {label}
    </span>
  );
};