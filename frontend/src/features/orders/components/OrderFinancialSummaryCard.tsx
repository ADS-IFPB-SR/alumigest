import React from 'react';
import { DollarSign, CreditCard } from 'lucide-react';
import type { Order } from '../types';
import { formatBRL } from '../../budgets/utils/calculations';

interface OrderFinancialSummaryCardProps {
  order: Order;
}

export const OrderFinancialSummaryCard: React.FC<OrderFinancialSummaryCardProps> = ({ order }) => {
  return (
    <div
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs space-y-4"
      data-testid="order-financial-summary-card"
    >
      <h3 className="font-semibold text-on-surface flex items-center gap-2 border-b border-outline-variant pb-3 text-sm sm:text-base">
        <DollarSign className="w-4 h-4 text-primary" />
        Resumo Financeiro Congelado
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-on-surface-variant">
          <span>Valor Bruto:</span>
          <span className="font-data-mono font-medium">{formatBRL(order.valorBruto)}</span>
        </div>

        {order.valorDesconto > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>Desconto Comercial:</span>
            <span className="font-data-mono font-medium">- {formatBRL(order.valorDesconto)}</span>
          </div>
        )}

        {order.taxaInstalacao > 0 && (
          <div className="flex justify-between text-on-surface-variant">
            <span>Taxa de Instalação:</span>
            <span className="font-data-mono font-medium">+ {formatBRL(order.taxaInstalacao)}</span>
          </div>
        )}

        {order.taxaFrete > 0 && (
          <div className="flex justify-between text-on-surface-variant">
            <span>Taxa de Frete:</span>
            <span className="font-data-mono font-medium">+ {formatBRL(order.taxaFrete)}</span>
          </div>
        )}

        <div className="border-t border-outline-variant pt-2 flex justify-between items-baseline font-bold text-base text-on-surface">
          <span>Valor Líquido:</span>
          <span className="text-primary font-data-mono text-lg">{formatBRL(order.valorLiquido)}</span>
        </div>
      </div>

      {(order.condicaoPagamento || order.observacoesPagamento) && (
        <div className="border-t border-outline-variant pt-3 space-y-1 text-xs">
          <div className="flex items-center gap-1.5 font-semibold text-on-surface">
            <CreditCard className="w-3.5 h-3.5 text-on-surface-variant" />
            <span>Condição de Pagamento:</span>
          </div>
          {order.condicaoPagamento && (
            <p className="text-on-surface font-medium">{order.condicaoPagamento}</p>
          )}
          {order.observacoesPagamento && (
            <p className="text-on-surface-variant italic">{order.observacoesPagamento}</p>
          )}
        </div>
      )}
    </div>
  );
};
