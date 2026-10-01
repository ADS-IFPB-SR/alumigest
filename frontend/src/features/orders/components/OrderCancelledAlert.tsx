import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface OrderCancelledAlertProps {
  justificativa?: string | null;
}

export const OrderCancelledAlert: React.FC<OrderCancelledAlertProps> = ({ justificativa }) => {
  if (!justificativa) return null;

  return (
    <div
      className="p-4 rounded-xl border border-rose-200 bg-rose-50 flex items-start gap-3 shadow-xs"
      data-testid="order-cancelled-alert"
    >
      <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
      <div>
        <h4 className="text-sm font-semibold text-rose-900">Pedido Cancelado</h4>
        <p className="text-sm text-rose-700 mt-1">
          <span className="font-medium">Motivo: </span>
          {justificativa}
        </p>
      </div>
    </div>
  );
};
