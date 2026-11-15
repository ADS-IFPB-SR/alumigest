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
  WAITING_PRODUCTION: 'bg-tertiary',
  IN_PRODUCTION: 'bg-primary',
  COMPLETED: 'bg-secondary',
};

const COLUMN_BADGE_STYLE: Record<ProductionStatus, string> = {
  WAITING_PRODUCTION: 'bg-tertiary-container text-on-tertiary-container border-2 border-tertiary/30',
  IN_PRODUCTION: 'bg-primary-container text-on-primary-container border-2 border-primary/30',
  COMPLETED: 'bg-secondary-container text-on-secondary-container border-2 border-secondary/30',
};

/**
 * Componente principal do Quadro Kanban de Acompanhamento da Produção (US-18.4).
 * Apresenta colunas com fundo destacado (bg-surface-container), bordas bem visíveis e suporte a drag and drop.
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
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4 space-y-3 animate-pulse shadow-xs"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-surface-container-high rounded w-24"></div>
                <div className="h-4 bg-surface-container-high rounded w-16"></div>
              </div>
              <div className="h-3 bg-surface-container-high rounded w-3/4"></div>
              <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
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
        className="flex flex-col items-center justify-center h-48 text-center p-6 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant bg-surface-container-lowest/50"
      >
        <Inbox className="w-7 h-7 mb-2 text-on-surface-variant opacity-70 stroke-[1.5]" />
        <p className="text-xs font-semibold text-on-surface leading-snug">
          {column.emptyMessage}
        </p>
        <p className="text-[11px] text-on-surface-variant mt-1">
          Arraste uma O.S. para cá para alterar a etapa
        </p>
      </div>
    );
  };

  return (
    <section
      data-testid="production-kanban-board"
      aria-label="Quadro Kanban de Produção"
      className={`grid grid-cols-1 md:grid-cols-3 md:grid-rows-1 md:flex-1 md:min-h-0 gap-4 lg:gap-5 ${className}`}
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
            className={`bg-surface-container rounded-2xl border border-outline-variant p-3.5 sm:p-4 flex flex-col min-h-0 shadow-xs transition-all duration-200 ${
              isTarget ? 'bg-primary-container/20 ring-2 ring-primary border-dashed border-primary' : ''
            }`}
          >
            {/* Cabeçalho da Coluna com Fundo Contrastante e Bordas Visíveis */}
            <header className="flex-none flex items-center justify-between pb-3 border-b border-outline-variant mb-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 shadow-2xs ${dotColor}`}></span>
                <div className="min-w-0">
                  <h3 className="font-bold text-on-surface text-sm tracking-wide uppercase truncate">
                    {column.title}
                  </h3>
                  <p className="text-xs font-semibold text-on-surface-variant truncate mt-0.5">{column.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {column.totalPieces > 0 && (
                  <span
                    className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-surface-container-lowest text-on-surface border-2 border-outline-variant shadow-2xs"
                    title={`Total de esquadrias físicas nesta etapa: ${column.totalPieces}`}
                  >
                    {column.totalPieces} {column.totalPieces === 1 ? 'peça' : 'peças'}
                  </span>
                )}
                <span
                  data-testid={`column-count-${column.id.toLowerCase()}`}
                  id={`badgeCount${column.alias || column.id}`}
                  className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold shadow-2xs ${badgeStyle}`}
                  title={`${count} ${count === 1 ? 'ordem de serviço' : 'ordens de serviço'}`}
                >
                  {count}
                </span>
              </div>
            </header>

            {/* Lista Rolável de Cartões da Coluna */}
            <div data-testid={`column-scroll-${column.id.toLowerCase()}`} className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-outline-variant [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-outline">
              {renderColumnContent(column)}
            </div>
          </section>
        );
      })}
    </section>
  );
};