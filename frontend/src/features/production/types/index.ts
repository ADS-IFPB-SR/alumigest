import type { Order, OrderSummary } from '../../orders/types';

/**
 * Status de produção válidos para o quadro Kanban (US-18).
 * Suporta o enum técnico em inglês e os identificadores legados em português.
 */
export type ProductionStatus = 'WAITING_PRODUCTION' | 'IN_PRODUCTION' | 'COMPLETED';

export type ProductionStatusAlias = 'AGUARDANDO_PRODUCAO' | 'EM_PRODUCAO' | 'CONCLUIDO';

export type ProductionStatusInput = ProductionStatus | ProductionStatusAlias;

/**
 * Normaliza qualquer formato textual ou alias de status para a chave padrão do Kanban.
 */
export const normalizeProductionStatus = (status: string | undefined | null): ProductionStatus | null => {
  if (!status) return null;
  const upper = status.trim().toUpperCase();
  if (upper === 'WAITING_PRODUCTION' || upper === 'AGUARDANDO_PRODUCAO') {
    return 'WAITING_PRODUCTION';
  }
  if (upper === 'IN_PRODUCTION' || upper === 'EM_PRODUCAO') {
    return 'IN_PRODUCTION';
  }
  if (upper === 'COMPLETED' || upper === 'CONCLUIDO') {
    return 'COMPLETED';
  }
  return null;
};

/**
 * Estrutura de configuração visual de cada coluna do Kanban de Produção.
 */
export interface ProductionColumnConfig {
  id: ProductionStatus;
  alias: ProductionStatusAlias;
  title: string;
  subtitle: string;
  emptyMessage: string;
  color: {
    bg: string;
    border: string;
    text: string;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    iconBg: string;
    iconColor: string;
    dropHighlight: string;
  };
}

/**
 * Props do componente ProductionKanbanBoard.
 */
export interface ProductionKanbanBoardProps {
  /** Lista de pedidos/ordens planos que serão distribuídos automaticamente nas colunas */
  orders?: (Order | OrderSummary)[];
  /** Dicionário pré-agrupado de pedidos por status (opcional) */
  groupedOrders?: Partial<Record<ProductionStatus | ProductionStatusAlias, (Order | OrderSummary)[]>>;
  /** Indicador de carregamento assíncrono */
  isLoading?: boolean;
  /** Callback acionado ao mover um cartão (drag-and-drop) para outra coluna */
  onMoveOrder?: (orderId: string, newStatus: ProductionStatus) => void;
  /** Callback acionado ao clicar para visualizar os detalhes de um pedido */
  onClickDetails?: (orderId: string) => void;
  /** Classes CSS adicionais para o container do quadro */
  className?: string;
}
