import React from 'react';
import { ExternalLink, User, Phone, MapPin, CheckSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Order } from '../types';
import { APPROVAL_CHANNEL_LABELS } from '../types';
import { formatDate } from '../utils/formatDate';

interface OrderOriginBudgetCardProps {
  order: Order;
}

export const OrderOriginBudgetCard: React.FC<OrderOriginBudgetCardProps> = ({ order }) => {
  const channelLabel = APPROVAL_CHANNEL_LABELS[order.canalAprovacao] || order.canalAprovacao;

  return (
    <div
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs space-y-4"
      data-testid="order-origin-budget-card"
    >
      <div className="flex items-center justify-between border-b border-outline-variant pb-3">
        <h3 className="font-semibold text-on-surface flex items-center gap-2 text-sm sm:text-base">
          <CheckSquare className="w-4 h-4 text-primary" />
          Origem & Aprovação Comercial
        </h3>
        <Link
          to={`/orcamentos/${order.orcamentoId}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-dark transition-colors"
          title="Ver proposta orçamentária de origem"
        >
          {order.orcamentoCodigo || 'Ver Orçamento'}
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-on-surface-variant block text-xs font-medium uppercase tracking-wider">
            Canal de Aprovação
          </span>
          <span className="font-medium text-on-surface">{channelLabel}</span>
        </div>

        <div>
          <span className="text-on-surface-variant block text-xs font-medium uppercase tracking-wider">
            Data de Aprovação
          </span>
          <span className="font-medium text-on-surface">{formatDate(order.dataAprovacao)}</span>
        </div>
      </div>

      <div className="border-t border-outline-variant pt-3 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-on-surface">
          <User className="w-4 h-4 text-on-surface-variant shrink-0" />
          <span className="font-medium">{order.clienteNome}</span>
        </div>

        {order.clienteTelefone && (
          <div className="flex items-center gap-2 text-on-surface-variant">
            <Phone className="w-4 h-4 shrink-0" />
            <span>{order.clienteTelefone}</span>
          </div>
        )}

        {order.clienteEndereco && (
          <div className="flex items-start gap-2 text-on-surface-variant">
            <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{order.clienteEndereco}</span>
          </div>
        )}
      </div>
    </div>
  );
};
