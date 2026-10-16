import React from 'react';
import { Calendar, Eye, AlertCircle, Clock, Package } from 'lucide-react';
import type { Order, OrderSummary } from '../../orders/types';
import { formatDate } from '../../orders/utils/formatDate'; // Ajuste o caminho exato do seu util de datas
import { getDeadlineStatus } from '../utils/deadlineUtils';

interface OrderProductionCardProps {
  order: Order | OrderSummary;
  onClickDetails: (orderId: string) => void;
}

export const OrderProductionCard: React.FC<OrderProductionCardProps> = ({
  order,
  onClickDetails
}) => {

  // 1. Delega a regra de negócio para o utilitário
  const deadlineStatus = getDeadlineStatus(order.dataPrevisaoEntrega);

  // 2. Mapeia o status puramente técnico para a configuração visual
  const alertConfig = {
    LATE: {
      label: 'Atrasado',
      color: 'bg-rose-100 text-rose-700 border-rose-200',
      icon: <AlertCircle className="w-3 h-3 mr-1" />
    },
    CRITICAL: {
      label: 'Prazo Crítico',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: <Clock className="w-3 h-3 mr-1" />
    },
    NORMAL: null
  }[deadlineStatus];

  // Identifica total de peças lidando tanto com Order quanto com OrderSummary
  const totalPecas = 'quantidadeItens' in order
    ? order.quantidadeItens
    : (order.items?.reduce((acc, item) => acc + (item.quantidade || 1), 0) || 0);

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing relative group flex flex-col gap-3"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', order.id);
        e.dataTransfer.effectAllowed = 'move';
        e.currentTarget.classList.add('opacity-50', 'scale-[0.98]');
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('opacity-50', 'scale-[0.98]');
      }}
    >
      {/* Header: Código e Alerta de Prazo */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-slate-900 text-sm">{order.codigo}</span>
          {order.orcamentoCodigo && (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {order.orcamentoCodigo}
            </span>
          )}
        </div>

        {alertConfig && (
          <span className={`flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${alertConfig.color}`}>
            {alertConfig.icon}
            {alertConfig.label}
          </span>
        )}
      </div>

      {/* Cliente e Resumo de Itens */}
      <div>
        <p className="text-sm font-bold text-slate-800 leading-snug truncate">
          {order.clienteNome}
        </p>

        <div className="space-y-1 mt-2">
          {'items' in order && order.items && order.items.length > 0 ? (
            order.items.map((item) => (
              <p key={item.id} className="text-xs text-slate-600 truncate flex gap-1.5">
                <span className="font-semibold text-slate-500">{item.quantidade}x</span>
                <span>{item.descricao}</span>
              </p>
            ))
          ) : (
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2">
              <Package className="w-3.5 h-3.5 text-slate-400" />
              <span>Contém {totalPecas} {totalPecas === 1 ? 'esquadria' : 'esquadrias'}</span>
            </p>
          )}
        </div>
      </div>

      {/* Footer: Data de Aprovação formatada com o Util global */}
      <div className="flex items-center justify-between mt-1 pt-3 border-t border-slate-100 text-xs text-slate-500">
        <div className="flex items-center gap-1.5" title="Data de Conversão do Pedido">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">{formatDate(order.dataAprovacao)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-1 rounded bg-slate-100 text-slate-600 font-bold text-[10px] border border-slate-200"
            title="Total de Peças Físicas para Produção"
          >
            {totalPecas} {totalPecas === 1 ? 'PEÇA' : 'PEÇAS'}
          </span>

          <button
            type="button"
            onClick={() => onClickDetails(order.id)}
            className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Abrir Detalhes da O.S."
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};