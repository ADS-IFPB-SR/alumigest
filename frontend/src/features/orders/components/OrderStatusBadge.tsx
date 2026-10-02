import React from 'react';
import { type OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '../types';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  // Faz o fallback de segurança para 'CRIADO' caso venha um status inválido
  const { bg, text, border } = ORDER_STATUS_COLORS[status] || ORDER_STATUS_COLORS.CRIADO;
  const label = ORDER_STATUS_LABELS[status] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-label font-bold border ${bg} ${text} ${border} whitespace-nowrap`}>
      {label}
    </span>
  );
}