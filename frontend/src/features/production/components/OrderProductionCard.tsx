import React from 'react';
import { Calendar, Eye, AlertCircle, Clock, Package, ChevronRight } from 'lucide-react';
import type { Order, OrderSummary } from '../../orders/types';
import { normalizeProductionStatus, type ProductionStatus } from '../types';
import { formatDate } from '../../orders/utils/formatDate';
import { getDeadlineStatus } from '../utils/deadlineUtils';

/** Mapa de próxima etapa na máquina de estados de produção */
const NEXT_STATUS_MAP: Partial<Record<ProductionStatus, { status: ProductionStatus; label: string }>> = {
  WAITING_PRODUCTION: { status: 'IN_PRODUCTION', label: 'Iniciar Produção' },
  IN_PRODUCTION:      { status: 'COMPLETED',     label: 'Finalizar' },
};

interface OrderProductionCardProps {
  order: Order | OrderSummary;
  onClickDetails: (orderId: string) => void;
  /** Callback opcional para mover o card para a próxima etapa via botão (fallback touch/mobile) */
  onMoveOrder?: (orderId: string, newStatus: ProductionStatus) => void;
}

export const OrderProductionCard: React.FC<OrderProductionCardProps> = ({
  order,
  onClickDetails,
  onMoveOrder,
}) => {
  // 1. Descobre o status atual normalizado primeiro
  const currentNormalized = normalizeProductionStatus(order.status);
  const nextStep = currentNormalized ? NEXT_STATUS_MAP[currentNormalized] ?? null : null;

  // 2. Regra de negócio de prazo de entrega
  // Se já está concluído, cancela qualquer alerta de atraso
  const deadlineStatus = currentNormalized === 'COMPLETED' 
    ? 'NORMAL' 
    : getDeadlineStatus(order.dataPrevisaoEntrega);

  // 3. Mapeamento de prioridade/urgência baseado no prazo real
  const alertConfig = {
    LATE: {
      label: 'Atrasado',
      color: 'bg-rose-100 text-rose-700 border-rose-300',
      icon: <AlertCircle className="w-3 h-3 mr-1" />,
    },
    CRITICAL: {
      label: 'Prazo Crítico',
      color: 'bg-amber-100 text-amber-800 border-amber-300',
      icon: <Clock className="w-3 h-3 mr-1" />,
    },
    NORMAL: null,
  }[deadlineStatus];

  // Identifica total de peças lidando tanto com Order quanto com OrderSummary
  const totalPecas = 'quantidadeItens' in order && typeof order.quantidadeItens === 'number'
    ? order.quantidadeItens
    : ('items' in order && order.items?.reduce((acc, item) => acc + (item.quantidade || 1), 0)) || 0;

  // Extrai iniciais do cliente para avatar fabril
  const clientInitials = (order.clienteNome || 'OS')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <div
      data-testid="order-production-card"
      aria-label={`Ordem de serviço ${order.codigo}`}
      className="bg-white rounded-xl border border-slate-300 p-3.5 shadow-xs hover:shadow-md hover:border-slate-400 transition cursor-grab active:cursor-grabbing relative group flex flex-col gap-2"
      draggable
      onDragStart={(e) => {
        if (e.dataTransfer) {
          e.dataTransfer.setData('text/plain', order.id);
          const normalizedStatus = normalizeProductionStatus(order.status);
          if (normalizedStatus) {
            e.dataTransfer.setData('sourceStatus', normalizedStatus);
          }
          e.dataTransfer.effectAllowed = 'move';
        }
        e.currentTarget.classList.add('opacity-50', 'scale-[0.98]');
      }}
      onDragEnd={(e) => {
        e.currentTarget.classList.remove('opacity-50', 'scale-[0.98]');
      }}
    >
      {/* 1. Header: Código da OS, Orçamento Origem e Alerta de Prazo */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-950 text-sm tracking-tight">{order.codigo}</span>
          {order.orcamentoCodigo && (
            <span className="text-[10px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">
              {order.orcamentoCodigo}
            </span>
          )}
        </div>

        {alertConfig && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${alertConfig.color}`}
          >
            {alertConfig.icon}
            {alertConfig.label}
          </span>
        )}
      </div>

      {/* 2. Cliente e Esquadrias com Container Destacado */}
      <div className="space-y-0.5">
        <p className="text-xs sm:text-sm font-bold text-slate-950 leading-snug truncate">
          {order.clienteNome}
        </p>

        <div className="bg-slate-50/90 border border-slate-200 rounded-lg p-2 space-y-0.5 mt-0.5">
          {'items' in order && order.items && order.items.length > 0 ? (
            <>
              {order.items.slice(0, 2).map((item) => (
                <p key={item.id} className="text-xs text-slate-800 truncate flex gap-1.5">
                  <span className="font-bold text-slate-950">{item.quantidade}x</span>
                  <span>{item.descricao}</span>
                </p>
              ))}
              {order.items.length > 2 && (
                <p className="text-[10px] text-slate-600 font-medium italic">
                  + {order.items.length - 2} outro(s) item(ns)
                </p>
              )}
            </>
          ) : (
            <p className="text-xs text-slate-800 font-medium flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              <span>Contém {totalPecas} {totalPecas === 1 ? 'esquadria' : 'esquadrias'}</span>
            </p>
          )}
        </div>
      </div>

      {/* 3. Rodapé do Card: Data de Aprovação, Badges e Botão Detalhes */}
      <div className="flex items-center justify-between flex-wrap gap-y-2 pt-2 border-t border-slate-200 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-900" title="Data de Aprovação do Pedido">
          <Calendar className="w-3.5 h-3.5 text-slate-700 shrink-0" />
          <span className="font-semibold text-slate-900">{formatDate(order.dataAprovacao)}</span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded bg-slate-100 text-slate-900 font-bold text-[10px] border border-slate-300 shadow-2xs"
            title="Total de esquadrias físicas nesta O.S."
          >
            {totalPecas} {totalPecas === 1 ? 'PEÇA' : 'PEÇAS'}
          </span>

          <button
            type="button"
            onClick={() => onClickDetails(order.id)}
            aria-label={`Visualizar detalhes da ordem de serviço ${order.codigo}`}
            className="p-1 hover:text-slate-950 text-slate-600 rounded transition hover:bg-slate-100"
            title="Ver Ficha Técnica / Detalhes da O.S."
          >
            <Eye className="w-4 h-4 text-slate-700 hover:text-slate-950" />
          </button>

          <span
            className="w-6 h-6 rounded-full bg-slate-200 text-slate-900 font-bold border border-slate-400 flex items-center justify-center text-[10px] shrink-0"
            title={`Cliente: ${order.clienteNome}`}
          >
            {clientInitials}
          </span>
        </div>

        {/* Botão de avanço rápido de etapa — fallback para dispositivos touch/móveis (BUG-504) */}
        {nextStep && onMoveOrder && (
          <button
            type="button"
            id={`btn-advance-${order.id}`}
            data-testid={`btn-advance-${order.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onMoveOrder(order.id, nextStep.status);
            }}
            aria-label={`${nextStep.label}: mover ordem de serviço ${order.codigo} para a próxima etapa`}
            title={nextStep.label}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-white hover:bg-slate-950 active:scale-95 transition-all duration-150 shrink-0 touch-manipulation select-none"
          >
            {nextStep.label}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
