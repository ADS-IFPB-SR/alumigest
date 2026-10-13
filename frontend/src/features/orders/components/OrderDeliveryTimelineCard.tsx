import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import type { Order } from '../types';
import { formatDate } from '../utils/formatDate';

interface OrderDeliveryTimelineCardProps {
  order: Order;
}

export const OrderDeliveryTimelineCard: React.FC<OrderDeliveryTimelineCardProps> = ({ order }) => {
  return (
    <div
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs space-y-4"
      data-testid="order-delivery-timeline-card"
    >
      <h3 className="font-semibold text-on-surface flex items-center gap-2 border-b border-outline-variant pb-3 text-sm sm:text-base">
        <Clock className="w-4 h-4 text-primary" />
        Cronograma de Entrega
      </h3>

      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-on-surface-variant flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-on-surface-variant" />
            Previsão de Entrega:
          </span>
          <span className="font-semibold text-on-surface font-data-mono">
            {formatDate(order.dataPrevisaoEntrega)}
          </span>
        </div>

        {order.dataConclusao && (
          <div className="flex items-center justify-between text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
            <span className="flex items-center gap-1.5 font-medium text-xs">
              <CheckCircle2 className="w-4 h-4" />
              Concluído em:
            </span>
            <span className="font-bold font-data-mono">
              {formatDate(order.dataConclusao)}
            </span>
          </div>
        )}

        {order.observacoes && (
          <div className="pt-2 border-t border-outline-variant text-xs text-on-surface-variant">
            <span className="font-semibold block mb-0.5">Observações Operacionais:</span>
            <p className="bg-surface-container-high/40 p-2.5 rounded-md text-on-surface whitespace-pre-line">
              {order.observacoes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
