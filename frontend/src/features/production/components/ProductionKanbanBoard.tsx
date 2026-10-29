/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import React, { useState, useMemo } from 'react';
import { Inbox } from 'lucide-react';
import type { Order, OrderSummary } from '../../orders/types';
import { OrderProductionCard } from './OrderProductionCard';
import {
  normalizeProductionStatus,
  type ProductionStatus,
  type ProductionKanbanBoardProps,
} from '../types';
import { KANBAN_COLUMNS, calculateTotalPieces } from '../utils/kanbanUtils';

const COLUMN_DOT_COLOR: Record<ProductionStatus, string> = {
  WAITING_PRODUCTION: 'bg-amber-500',
  IN_PRODUCTION: 'bg-blue-600',
  COMPLETED: 'bg-emerald-500',
};

const COLUMN_BADGE_STYLE: Record<ProductionStatus, string> = {
  WAITING_PRODUCTION: 'bg-amber-100 text-amber-900 border-2 border-amber-400',
  IN_PRODUCTION: 'bg-blue-100 text-blue-900 border-2 border-blue-400',
  COMPLETED: 'bg-emerald-100 text-emerald-900 border-2 border-emerald-400',
};

/**
 * Componente principal do Quadro Kanban de Acompanhamento da Produção (US-18.4).
 * Apresenta colunas com fundo destacado (bg-slate-100), bordas bem visíveis e suporte a drag and drop.
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
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLElement>, targetStatus: ProductionStatus) => {
    e.preventDefault();
    setActiveDropColumn(null);
    const orderId = e.dataTransfer.getData('text/plain');
    if (!orderId) {
      return;
    }

    // Identifica o status de origem via dataTransfer ou pelas colunas atuais
    const transferSourceStatus = e.dataTransfer.getData('sourceStatus') as ProductionStatus | '';
    let sourceStatus: ProductionStatus | undefined = transferSourceStatus || undefined;

    if (!sourceStatus) {
      const foundColumn = columnsData.find((col) =>
        col.orders.some((o) => o.id === orderId)
      );
      sourceStatus = foundColumn?.id;
    }

    // Se soltou na mesma coluna (sourceStatus === targetStatus), aborta imediatamente (no-op)
    if (sourceStatus === targetStatus) {
      return;
    }

    if (onMoveOrder) {
      onMoveOrder(orderId, targetStatus);
    }
  };

  // Renderizador do corpo da coluna
  const renderColumnContent = (column: (typeof columnsData)[number]) => {
    if (isLoading) {
      return (
        <div data-testid="kanban-skeleton" className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-300 p-4 space-y-3 animate-pulse shadow-xs"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-4 bg-slate-200 rounded w-16"></div>
              </div>
              <div className="h-3 bg-slate-200 rounded w-3/4"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      );
    }

    if (column.orders.length > 0) {
      return column.orders.map((order) => (
        <OrderProductionCard
          key={order.id}
          order={order}
          onClickDetails={onClickDetails}
          onMoveOrder={onMoveOrder}
        />
      ));
    }

    return (
      <div
        data-testid={`column-empty-${column.id.toLowerCase()}`}
        className="flex flex-col items-center justify-center h-48 text-center p-6 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 bg-white/70"
      >
        <Inbox className="w-7 h-7 mb-2 text-slate-400 stroke-[1.5]" />
        <p className="text-xs font-semibold text-slate-700 leading-snug">
          {column.emptyMessage}
        </p>
        <p className="text-[11px] text-slate-500 mt-1">
          Arraste uma O.S. para cá para alterar a etapa
        </p>
      </div>
    );
  };

  return (
    <section
      data-testid="production-kanban-board"
      aria-label="Quadro Kanban de Produção"
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 items-start ${className}`}
    >
      {columnsData.map((column) => {
        const isTarget = activeDropColumn === column.id;
        const count = column.orders.length;
        const dotColor = COLUMN_DOT_COLOR[column.id];
        const badgeStyle = COLUMN_BADGE_STYLE[column.id];

        return (
          <section
            key={column.id}
            data-testid={`kanban-column-${column.id.toLowerCase()}`}
            data-status={column.id}
            aria-label={`Coluna ${column.title}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
            className={`bg-slate-100/80 rounded-2xl border border-slate-300 p-3.5 sm:p-4 flex flex-col shadow-xs transition-all duration-200 ${
              isTarget ? 'bg-emerald-50 ring-2 ring-emerald-500 border-dashed border-emerald-500' : ''
            }`}
          >
            {/* Cabeçalho da Coluna com Fundo Contrastante e Bordas Visíveis */}
            <header className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ${dotColor}`}></span>
                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase truncate">
                    {column.title}
                  </h3>
                  <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">{column.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {column.totalPieces > 0 && (
                  <span
                    className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-slate-800 border-2 border-slate-300 shadow-2xs"
                    title={`Total de esquadrias físicas nesta etapa: ${column.totalPieces}`}
                  >
                    {column.totalPieces} {column.totalPieces === 1 ? 'peça' : 'peças'}
                  </span>
                )}
                <span
                  data-testid={`column-count-${column.id.toLowerCase()}`}
                  id={`badgeCount${column.alias || column.id}`}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border-2 shadow-2xs ${badgeStyle}`}
                  title={`${count} ${count === 1 ? 'ordem de serviço' : 'ordens de serviço'}`}
                >
                  {count}
                </span>
              </div>
            </header>

            {/* Lista Rolável de Cartões da Coluna */}
            <div data-testid={`column-scroll-${column.id.toLowerCase()}`} className="flex-1 min-h-[200px] max-h-[calc(100vh-420px)] space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-400">
              {renderColumnContent(column)}
            </div>
          </section>
        );
      })}
    </section>
  );
};
