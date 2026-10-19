/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState, useMemo } from 'react';
import { Clock, Wrench, CheckCircle2, Inbox, Layers } from 'lucide-react';
import type { Order, OrderSummary } from '../../orders/types';
import { OrderProductionCard } from './OrderProductionCard';
import {
  normalizeProductionStatus,
  type ProductionStatus,
  type ProductionKanbanBoardProps,
} from '../types';
import { KANBAN_COLUMNS, calculateTotalPieces } from '../utils/kanbanUtils';

/**
 * Ícone correspondente a cada coluna do fluxo fabril.
 */
const ColumnIcon: React.FC<{ status: ProductionStatus; className?: string }> = ({
  status,
  className = 'w-4 h-4',
}) => {
  switch (status) {
    case 'WAITING_PRODUCTION':
      return <Clock className={className} />;
    case 'IN_PRODUCTION':
      return <Wrench className={className} />;
    case 'COMPLETED':
      return <CheckCircle2 className={className} />;
    default:
      return <Layers className={className} />;
  }
};

/**
 * Componente principal do Quadro Kanban de Acompanhamento da Produção (US-18.4).
 * Apresenta 3 colunas principais com contagem de O.S., total de peças e suporte a drag-and-drop.
 */
export const ProductionKanbanBoard: React.FC<ProductionKanbanBoardProps> = ({
  orders = [],
  groupedOrders,
  isLoading = false,
  onMoveOrder,
  onClickDetails = () => {},
  className = '',
}) => {
  const [activeDropColumn, setActiveDropColumn] = useState<ProductionStatus | null>(null);

  // Mapeia e distribui os pedidos para cada coluna garantindo compatibilidade com objetos planos ou agrupados
  const columnsData = useMemo(() => {
    return KANBAN_COLUMNS.map((col) => {
      let columnOrders: (Order | OrderSummary)[] = [];

      if (groupedOrders) {
        if (groupedOrders[col.id]) {
          columnOrders = groupedOrders[col.id]!;
        } else if (groupedOrders[col.alias]) {
          columnOrders = groupedOrders[col.alias]!;
        }
      } else if (orders.length > 0) {
        columnOrders = orders.filter((o) => normalizeProductionStatus(o.status) === col.id);
      }

      const totalPieces = calculateTotalPieces(columnOrders);

      return {
        ...col,
        orders: columnOrders,
        totalPieces,
      };
    });
  }, [orders, groupedOrders]);

  // Manipuladores de eventos de Drag and Drop
  const handleDragOver = (e: React.DragEvent<HTMLElement>, status: ProductionStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLElement>) => {
    // Evita resetar o highlight caso o ponteiro esteja sobrevoando um elemento-filho da coluna
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, targetStatus: ProductionStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const orderId = e.dataTransfer.getData('text/plain');
    if (orderId && onMoveOrder) {
      onMoveOrder(orderId, targetStatus);
    }
  };

  return (
    <section
      data-testid="production-kanban-board"
      aria-label="Quadro Kanban de Produção"
      className={`grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start w-full ${className}`}
    >
      {columnsData.map((column) => {
        const isTarget = activeDropColumn === column.id;
        const count = column.orders.length;

        return (
          <section
            key={column.id}
            data-testid={`kanban-column-${column.id.toLowerCase()}`}
            data-status={column.id}
            aria-label={`Coluna ${column.title}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`flex flex-col rounded-2xl border transition-all duration-200 bg-slate-50/80 shadow-xs ${
              isTarget ? column.color.dropHighlight : `${column.color.border}`
            }`}
          >
            {/* Cabeçalho da Coluna com Contadores em Tempo Real */}
            <header className="p-4 border-b border-slate-200/80 bg-white/70 rounded-t-2xl backdrop-blur-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${column.color.iconBg}`}>
                  <ColumnIcon status={column.id} className={`w-4 h-4 ${column.color.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 truncate leading-snug">
                    {column.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">{column.subtitle}</p>
                </div>
              </div>

              {/* Badges de Contagem (Total de Pedidos e Total de Peças Físicas) */}
              <div className="flex items-center gap-1.5 shrink-0">
                {column.totalPieces > 0 && (
                  <span
                    className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200"
                    title={`Total de esquadrias físicas nesta etapa: ${column.totalPieces}`}
                  >
                    {column.totalPieces} {column.totalPieces === 1 ? 'peça' : 'peças'}
                  </span>
                )}
                <span
                  data-testid={`column-count-${column.id.toLowerCase()}`}
                  className={`inline-flex items-center justify-center min-w-6 h-6 px-1.5 text-xs font-bold rounded-full border ${column.color.badgeBg} ${column.color.badgeText} ${column.color.badgeBorder}`}
                  title={`${count} ${count === 1 ? 'ordem de serviço' : 'ordens de serviço'}`}
                >
                  {count}
                </span>
              </div>
            </header>

            {/* Lista Rolável de Cartões da Coluna */}
            <div className="flex-1 p-3 space-y-3 overflow-y-auto max-h-[calc(100vh-270px)] min-h-[380px]">
              {isLoading ? (
                // Skeletons de Carregamento
                <div data-testid="kanban-skeleton" className="space-y-3">
                  {[1, 2, 3].map((skeletonId) => (
                    <div
                      key={skeletonId}
                      className="animate-pulse bg-white rounded-xl border border-slate-200 p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-slate-200 rounded-md w-24"></div>
                        <div className="h-4 bg-slate-100 rounded-md w-16"></div>
                      </div>
                      <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded-md w-1/2"></div>
                      <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                        <div className="h-3 bg-slate-100 rounded-md w-20"></div>
                        <div className="h-4 bg-slate-100 rounded-md w-12"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : column.orders.length > 0 ? (
                // Lista de Cartões de Produção
                column.orders.map((order) => (
                  <OrderProductionCard
                    key={order.id}
                    order={order}
                    onClickDetails={onClickDetails}
                  />
                ))
              ) : (
                // Estado Vazio da Coluna
                <div
                  data-testid={`column-empty-${column.id.toLowerCase()}`}
                  className="flex flex-col items-center justify-center h-52 text-center p-6 border-2 border-dashed border-slate-200/90 rounded-xl text-slate-400 bg-white/40"
                >
                  <Inbox className="w-8 h-8 mb-2 text-slate-300 stroke-[1.5]" />
                  <p className="text-xs font-semibold text-slate-600 leading-snug">
                    {column.emptyMessage}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Arraste uma O.S. para esta coluna para avançar a etapa
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </section>
  );
};
