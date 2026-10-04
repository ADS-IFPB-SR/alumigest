import React from 'react';

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

  const label = ORDER_STATUS_LABELS[status] || status;

  return (
      {label}
    </span>
  );